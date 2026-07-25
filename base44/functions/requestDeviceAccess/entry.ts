import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Centralized device-access approval for the QR kiosk flow.
// Input: { device_id, ts }  (ts = QR generation timestamp, replay-protected)
// Validates the authenticated user, then creates an active LabSession + marks device in_use.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ approved: false, reason: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { device_id, ts } = body || {};
    if (!device_id || !ts) return Response.json({ approved: false, reason: "Invalid request" }, { status: 400 });

    // Replay protection: QR timestamp must be recent.
    const tsNum = Number(ts);
    const ageSec = Math.abs(Date.now() - tsNum) / 1000;
    if (isNaN(tsNum) || ageSec > 120) {
      return Response.json({ approved: false, reason: "QR code expired. Please rescan." });
    }

    const device = await base44.entities.Device.get(device_id);
    if (!device) return Response.json({ approved: false, reason: "Device not found" });
    if (device.status === "maintenance") return Response.json({ approved: false, reason: "Device is under maintenance" });
    if (device.status === "in_use") return Response.json({ approved: false, reason: "Device is already in use" });

    const isMainAdmin = user.role === "admin";
    const profiles = await base44.entities.UserProfile.filter({ email: user.email });
    const profile = profiles[0];

    if (!isMainAdmin) {
      if (!profile) return Response.json({ approved: false, reason: "No user profile found" });
      if (profile.status !== "approved") return Response.json({ approved: false, reason: "Account not approved" });
      if (profile.lab_id !== device.lab_id) return Response.json({ approved: false, reason: "Not assigned to this lab" });
      const bypass = profile.role === "lab_admin" || profile.role === "senior_user";
      const certs = profile.certifications || [];
      if (!bypass && device.requires_training && !certs.includes(device.id)) {
        return Response.json({ approved: false, reason: `Certification required: ${device.training_name || device.name}` });
      }
    }

    // One active session per user.
    const myActive = await base44.entities.LabSession.filter({ user_email: user.email, status: "active" });
    if (myActive.length > 0) return Response.json({ approved: false, reason: "You already have an active session. End it first." });

    const session = await base44.entities.LabSession.create({
      device_id: device.id,
      device_name: device.name,
      user_email: user.email,
      user_name: user.full_name || user.email,
      start_time: new Date().toISOString(),
      status: "active",
      lab_id: device.lab_id
    });
    await base44.entities.Device.update(device.id, { status: "in_use" });

    return Response.json({ approved: true, session, device });
  } catch (error) {
    return Response.json({ approved: false, reason: error.message }, { status: 500 });
  }
});
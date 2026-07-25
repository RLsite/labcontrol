import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Public bridge for the separate device-side Frontend (built in Claude Code).
// No user auth — uses service role. Returns the device status + active session (if any)
// so the kiosk can lock/unlock. Read-only, non-sensitive.
// Input: { device_id }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { device_id } = body || {};
    if (!device_id) return Response.json({ error: "device_id required" }, { status: 400 });

    const device = await base44.asServiceRole.entities.Device.get(device_id);
    if (!device) return Response.json({ error: "Device not found" }, { status: 404 });

    const sessions = await base44.asServiceRole.entities.LabSession.filter({ device_id, status: "active" });
    const active = sessions[0] || null;

    return Response.json({
      device_id: device.id,
      name: device.name,
      location: device.location,
      status: device.status,
      active: !!active,
      session: active ? {
        user_name: active.user_name,
        user_email: active.user_email,
        start_time: active.start_time
      } : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
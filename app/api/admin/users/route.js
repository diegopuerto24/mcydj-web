import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "noreply@mcydj.mx";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mcydj.mx";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function getBearerToken(request) {
  const auth = request.headers.get("authorization") || "";
  return auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
}

function makeClients() {
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return null;
  return {
    publicClient: createClient(supabaseUrl, anonKey),
    adminClient: createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  };
}

async function assertAdmin(request) {
  const clients = makeClients();
  if (!clients) return { error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY o variables Supabase.", status: 500 };

  const token = getBearerToken(request);
  if (!token) return { error: "No autorizado.", status: 401 };

  const { data: userData, error: userError } = await clients.publicClient.auth.getUser(token);
  if (userError || !userData?.user?.email) return { error: "Sesión inválida.", status: 401 };

  const { data: profile, error: profileError } = await clients.adminClient
    .from("profiles")
    .select("id,email,nombre,rol,activo,role_id")
    .eq("email", userData.user.email)
    .eq("activo", true)
    .maybeSingle();

  if (profileError) return { error: "No fue posible validar el perfil.", status: 500 };
  if (!profile || !["director", "admin", "sistemas"].includes(profile.rol)) {
    return { error: "No tienes permisos para administrar usuarios.", status: 403 };
  }

  return { clients, profile, authUser: userData.user };
}

async function sendInvitationEmail({ personalEmail, corporateEmail, fullName, actionLink }) {
  if (!resendApiKey) throw new Error("Falta RESEND_API_KEY.");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#16150E;max-width:620px;margin:auto">
      <div style="background:#A0C7FE;padding:22px;border-radius:16px 16px 0 0">
        <h2 style="margin:0">Bienvenido a MC&amp;DJ Hub</h2>
      </div>
      <div style="border:1px solid #dbe5f0;border-top:0;padding:22px;border-radius:0 0 16px 16px">
        <p>Hola <strong>${fullName}</strong>,</p>
        <p>Se creó tu identidad institucional para acceder al sistema interno de MC&amp;DJ:</p>
        <p style="font-size:18px"><strong>${corporateEmail}</strong></p>
        <p>Presiona el botón para activar tu cuenta y definir tu contraseña:</p>
        <p><a href="${actionLink}" style="display:inline-block;background:#16150E;color:#FFF97D;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">Activar cuenta</a></p>
        <p style="font-size:12px;color:#666">Este enlace es personal. No lo compartas.</p>
      </div>
    </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: emailFrom,
      to: personalEmail,
      subject: "Activa tu cuenta de MC&DJ Hub",
      html
    })
  });

  if (!response.ok) throw new Error(`No fue posible enviar la invitación: ${await response.text()}`);
}

async function addAudit(adminClient, actor, action, entityType, entityId, summary, newData = null) {
  await adminClient.from("audit_logs").insert({
    actor_profile_id: actor.id,
    actor_email: actor.email,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    summary,
    new_data: newData
  });
}

export async function GET(request) {
  const guard = await assertAdmin(request);
  if (guard.error) return json({ error: guard.error }, guard.status);

  const { data, error } = await guard.clients.adminClient
    .from("profiles")
    .select(`
      id,email,nombre,rol,activo,role_id,area_id,personal_email,last_login_at,created_at,
      roles:role_id(id,code,name),
      areas:area_id(id,code,name),
      employees:employee_id(
        id,employee_number,first_name,last_name,corporate_email,personal_email,
        phone,extension,position,hire_date,status
      )
    `)
    .order("nombre", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  const [{ data: roles }, { data: areas }] = await Promise.all([
    guard.clients.adminClient.from("roles").select("id,code,name,level").eq("active", true).order("level", { ascending: true }),
    guard.clients.adminClient.from("areas").select("id,code,name,sort_order").eq("active", true).order("sort_order", { ascending: true })
  ]);
  return json({ users: data || [], roles: roles || [], areas: areas || [] });
}

export async function POST(request) {
  const guard = await assertAdmin(request);
  if (guard.error) return json({ error: guard.error }, guard.status);

  const body = await request.json().catch(() => ({}));
  const action = body.action || "create";
  const { adminClient } = guard.clients;

  if (action === "create") {
    const firstName = String(body.first_name || "").trim();
    const lastName = String(body.last_name || "").trim();
    const corporateEmail = String(body.corporate_email || "").trim().toLowerCase();
    const personalEmail = String(body.personal_email || "").trim().toLowerCase();
    const roleId = String(body.role_id || "").trim();
    const areaId = String(body.area_id || "").trim();
    const position = String(body.position || "").trim();
    const employeeNumber = String(body.employee_number || "").trim() || null;
    const phone = String(body.phone || "").trim() || null;
    const extension = String(body.extension || "").trim() || null;
    const hireDate = body.hire_date || null;
    const fullName = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName || !corporateEmail || !personalEmail || !roleId || !areaId) {
      return json({ error: "Nombre, apellidos, correo corporativo, correo personal, rol y área son obligatorios." }, 400);
    }
    if (!corporateEmail.endsWith("@mcydj.mx")) return json({ error: "El correo corporativo debe terminar en @mcydj.mx." }, 400);

    const { data: role, error: roleError } = await adminClient.from("roles").select("id,code,name").eq("id", roleId).eq("active", true).single();
    if (roleError || !role) return json({ error: "El rol seleccionado no es válido." }, 400);

    const { data: area, error: areaError } = await adminClient.from("areas").select("id,code,name").eq("id", areaId).eq("active", true).single();
    if (areaError || !area) return json({ error: "El área seleccionada no es válida." }, 400);

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "invite",
      email: corporateEmail,
      options: {
        redirectTo: `${siteUrl}/portal/activar-cuenta`,
        data: { nombre: fullName, rol: role.code, personal_email: personalEmail }
      }
    });

    if (linkError || !linkData?.user?.id || !linkData?.properties?.action_link) {
      return json({ error: linkError?.message || "No fue posible generar la invitación." }, 500);
    }

    const authUserId = linkData.user.id;
    const { data: employee, error: employeeError } = await adminClient
      .from("employees")
      .insert({
        employee_number: employeeNumber,
        first_name: firstName,
        last_name: lastName,
        corporate_email: corporateEmail,
        personal_email: personalEmail,
        phone,
        extension,
        position,
        area_id: areaId,
        hire_date: hireDate,
        status: "active"
      })
      .select("id")
      .single();

    if (employeeError) {
      await adminClient.auth.admin.deleteUser(authUserId).catch(() => null);
      return json({ error: employeeError.message }, 500);
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: authUserId,
        email: corporateEmail,
        nombre: fullName,
        rol: role.code,
        activo: true,
        employee_id: employee.id,
        role_id: roleId,
        area_id: areaId,
        personal_email: personalEmail
      }, { onConflict: "id" })
      .select("id,email,nombre,rol,activo")
      .single();

    if (profileError) {
      await adminClient.from("employees").delete().eq("id", employee.id);
      await adminClient.auth.admin.deleteUser(authUserId).catch(() => null);
      return json({ error: profileError.message }, 500);
    }

    try {
      await sendInvitationEmail({ personalEmail, corporateEmail, fullName, actionLink: linkData.properties.action_link });
    } catch (error) {
      return json({ error: `${error.message} El usuario fue creado, pero la invitación no se envió.`, user: profile }, 502);
    }

    await addAudit(adminClient, guard.profile, "user.create", "profile", profile.id, `Creó al usuario ${corporateEmail}.`, {
      corporate_email: corporateEmail,
      personal_email: personalEmail,
      role: role.code,
      area: area.code
    });

    return json({ ok: true, user: profile });
  }

  if (action === "set_active") {
    const profileId = String(body.profile_id || "").trim();
    const active = Boolean(body.active);
    if (!profileId) return json({ error: "profile_id es obligatorio." }, 400);

    const { data: profile, error } = await adminClient
      .from("profiles")
      .update({ activo: active })
      .eq("id", profileId)
      .select("id,email,nombre,rol,activo,employee_id")
      .single();

    if (error) return json({ error: error.message }, 500);
    if (profile.employee_id) {
      await adminClient.from("employees").update({ status: active ? "active" : "inactive" }).eq("id", profile.employee_id);
    }
    await adminClient.auth.admin.updateUserById(profileId, { ban_duration: active ? "none" : "876000h" });
    await addAudit(adminClient, guard.profile, active ? "user.enable" : "user.disable", "profile", profileId, `${active ? "Activó" : "Desactivó"} al usuario ${profile.email}.`);
    return json({ ok: true, user: profile });
  }

  if (action === "resend_invite") {
    const profileId = String(body.profile_id || "").trim();
    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("id,email,nombre,personal_email")
      .eq("id", profileId)
      .single();
    if (error || !profile?.personal_email) return json({ error: "No se encontró el usuario o su correo personal." }, 404);

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: profile.email,
      options: { redirectTo: `${siteUrl}/portal/activar-cuenta` }
    });
    if (linkError || !linkData?.properties?.action_link) return json({ error: linkError?.message || "No fue posible generar el enlace." }, 500);

    await sendInvitationEmail({
      personalEmail: profile.personal_email,
      corporateEmail: profile.email,
      fullName: profile.nombre,
      actionLink: linkData.properties.action_link
    });
    await addAudit(adminClient, guard.profile, "user.invite_resend", "profile", profile.id, `Reenvió la invitación a ${profile.email}.`);
    return json({ ok: true });
  }

  return json({ error: "Acción no soportada." }, 400);
}

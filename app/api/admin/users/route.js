import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function getBearerToken(request) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  return auth.slice(7).trim();
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
  if (!clients) {
    return { error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY o variables Supabase.", status: 500 };
  }

  const token = getBearerToken(request);
  if (!token) return { error: "No autorizado.", status: 401 };

  const { data: userData, error: userError } = await clients.publicClient.auth.getUser(token);
  if (userError || !userData?.user?.email) return { error: "Sesion invalida.", status: 401 };

  const { data: profile, error: profileError } = await clients.adminClient
    .from("profiles")
    .select("id,email,nombre,rol,activo")
    .eq("email", userData.user.email)
    .eq("activo", true)
    .maybeSingle();

  if (profileError) return { error: "No fue posible validar el perfil.", status: 500 };
  if (!profile || !["director", "admin"].includes(profile.rol)) {
    return { error: "No tienes permisos para administrar usuarios.", status: 403 };
  }

  return { clients, profile, authUser: userData.user };
}

export async function GET(request) {
  const guard = await assertAdmin(request);
  if (guard.error) return json({ error: guard.error }, guard.status);

  const { data, error } = await guard.clients.adminClient
    .from("profiles")
    .select("id,email,nombre,rol,activo,created_at")
    .order("nombre", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json({ users: data || [] });
}

export async function POST(request) {
  const guard = await assertAdmin(request);
  if (guard.error) return json({ error: guard.error }, guard.status);

  const body = await request.json().catch(() => ({}));
  const action = body.action || "create";

  if (action === "create") {
    const email = String(body.email || "").trim().toLowerCase();
    const nombre = String(body.nombre || "").trim();
    const rol = String(body.rol || "auxiliar").trim();
    const password = String(body.password || "");

    if (!email || !nombre || !password) {
      return json({ error: "Email, nombre y contrasena son obligatorios." }, 400);
    }

    if (password.length < 8) {
      return json({ error: "La contrasena temporal debe tener al menos 8 caracteres." }, 400);
    }

    const { data: created, error: createError } = await guard.clients.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol }
    });

    if (createError && !String(createError.message || "").toLowerCase().includes("already")) {
      return json({ error: createError.message }, 500);
    }

    const { data: profile, error: upsertError } = await guard.clients.adminClient
      .from("profiles")
      .upsert({ email, nombre, rol, activo: true }, { onConflict: "email" })
      .select("id,email,nombre,rol,activo")
      .single();

    if (upsertError) return json({ error: upsertError.message }, 500);
    return json({ ok: true, user: profile, authUserId: created?.user?.id || null });
  }

  if (action === "reset_password") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) return json({ error: "Email y nueva contrasena son obligatorios." }, 400);
    if (password.length < 8) return json({ error: "La contrasena debe tener al menos 8 caracteres." }, 400);

    const { data: listed, error: listError } = await guard.clients.adminClient.auth.admin.listUsers();
    if (listError) return json({ error: listError.message }, 500);

    const authUser = listed?.users?.find((user) => String(user.email || "").toLowerCase() === email);
    if (!authUser) return json({ error: "No existe usuario Auth con ese correo." }, 404);

    const { error: updateError } = await guard.clients.adminClient.auth.admin.updateUserById(authUser.id, {
      password
    });

    if (updateError) return json({ error: updateError.message }, 500);
    return json({ ok: true });
  }

  if (action === "set_active") {
    const email = String(body.email || "").trim().toLowerCase();
    const activo = Boolean(body.activo);
    if (!email) return json({ error: "Email obligatorio." }, 400);

    const { data, error } = await guard.clients.adminClient
      .from("profiles")
      .update({ activo })
      .eq("email", email)
      .select("id,email,nombre,rol,activo")
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, user: data });
  }

  return json({ error: "Accion no soportada." }, 400);
}

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const setupToken = process.env.ADMIN_SETUP_TOKEN;

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey || !setupToken) {
    return json({ error: "Faltan variables de servidor para bootstrap." }, 500);
  }

  const providedToken = request.headers.get("x-setup-token") || "";
  if (providedToken !== setupToken) {
    return json({ error: "Token de configuracion invalido." }, 401);
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "conecta@mcydj.mx").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password || password.length < 8) {
    return json({ error: "Email y password minimo de 8 caracteres son obligatorios." }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: listed, error: listError } = await adminClient.auth.admin.listUsers();
  if (listError) return json({ error: listError.message }, 500);

  const authUser = listed?.users?.find((user) => String(user.email || "").toLowerCase() === email);
  if (!authUser) return json({ error: "No existe usuario Auth con ese correo." }, 404);

  const { error: updateError } = await adminClient.auth.admin.updateUserById(authUser.id, {
    password,
    email_confirm: true
  });

  if (updateError) return json({ error: updateError.message }, 500);

  return json({ ok: true, email });
}

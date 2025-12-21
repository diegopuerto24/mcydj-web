import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req) {
  try {
    const body = await req.json();

    let {
      name = "",
      company = "",
      email = "",
      phone = "",
      message = "",
      consent = ""
    } = body || {};

    name = String(name).trim();
    company = String(company).trim();
    email = String(email).trim();
    phone = String(phone).trim();
    message = String(message).trim();
    consent = String(consent).trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre, email, mensaje)." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email no válido." }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@mcydj.mx";
    const EMAIL_TO = process.env.EMAIL_TO || "conecta@mcydj.mx";

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Falta RESEND_API_KEY" }, { status: 500 });
    }

    const html =
      '<div style="font-family:system-ui,Arial,sans-serif;line-height:1.45">' +
      "<h2>Nuevo contacto desde mcydj.mx</h2>" +
      "<p><b>Nombre:</b> " + esc(name) + "</p>" +
      "<p><b>Empresa:</b> " + esc(company) + "</p>" +
      "<p><b>Email:</b> " + esc(email) + "</p>" +
      "<p><b>Tel/WhatsApp:</b> " + esc(phone) + "</p>" +
      "<p><b>Consentimiento Aviso de Privacidad:</b> " + esc(consent || "No especificado") + "</p>" +
      "<p><b>Mensaje:</b></p>" +
      '<pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:0">' +
      esc(message) +
      "</pre>" +
      "</div>";

    const subject = "Nuevo contacto — " + name + (company ? " (" + company + ")" : "");

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject,
        html,
        reply_to: email
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      return NextResponse.json(
        { error: "Resend API error: " + detail },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e && e.message) ? e.message : "Error" },
      { status: 500 }
    );
  }
}

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


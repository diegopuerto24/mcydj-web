// app/api/contact/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    let { name, company = "", email, phone = "", message } = body || {};

    // Normaliza
    name = (name ?? "").toString().trim();
    company = (company ?? "").toString().trim();
    email = (email ?? "").toString().trim();
    phone = (phone ?? "").toString().trim();
    message = (message ?? "").toString().trim();

    // Validaciones mínimas
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email no válido." }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@mcydj.mx";
    const EMAIL_TO = process.env.EMAIL_TO || "conecta@mcydj.mx";

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Falta RESEND_API_KEY en las variables de entorno de Vercel." },
        { status: 500 }
      );
    }

    const subject = `Nuevo contacto de ${name}`;
    const html = `
      <div style="font-family:system-ui,Arial,sans-serif;line-height:1.45">
        <h2 style="margin:0 0 8px">Nuevo contacto desde mcydj.mx</h2>
        <p style="margin:0 0 6px"><b>Nombre:</b> ${escapeHtml(name)}</p>
        <p style="margin:0 0 6px"><b>Empresa:</b> ${escapeHtml(company)}</p>
        <p style="margin:0 0 6px"><b>Email:</b> ${escapeHtml(email)}</p>
        <p style="margin:0 0 6px"><b>Tel/WhatsApp:</b> ${escapeHtml(phone)}</p>
        <p style="margin:10px 0 6px"><b>Mensaje:</b></p>
        <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:0">${escapeHtml(message)}</pre>
      </div>
    `;

    // Envío vía Resend (sin SDK)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: EMAIL_FROM,   // debe ser @mcydj.mx (dominio verificado)
        to: EMAIL_TO,       // destinatario final (p. ej., conecta@mcydj.mx)
        subject,
        html,
        reply_to: email
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: `Resend API error: ${detail}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}

// Utilidad para evitar inyección HTML en el cuerpo del correo
function escapeHtml(s = "") {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


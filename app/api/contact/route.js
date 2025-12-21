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
        // 1) Email interno (MC&DJ)
    const subject = `${folio} | ${priority} | RFP: ${serviceMain} — ${name}${company ? ` (${company})` : ""}`;

    const internalRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject,
        html,
        reply_to: email
      })
    });

    if (!internalRes.ok) {
      const detail = await internalRes.text();
      return NextResponse.json({ error: `Resend API error (interno): ${detail}` }, { status: 502 });
    }

    // 2) Acuse al cliente (no debe bloquear operación si falla)
    const ACK_FROM = process.env.ACK_FROM || EMAIL_FROM;
    const ACK_BCC = process.env.ACK_BCC || ""; // opcional, ej: "conecta@mcydj.mx"

    const ackSubject = `Recibimos tu solicitud — Folio ${folio}`;
    const ackHtml = `
      <div style="font-family:system-ui,Arial,sans-serif;line-height:1.55">
        <h2 style="margin:0 0 8px">Gracias por contactarnos</h2>
        <p style="margin:0 0 12px">
          Recibimos tu solicitud de propuesta (RFP). Nuestro equipo la revisará y te contactaremos a la brevedad.
        </p>

        <div style="padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;margin:14px 0">
          <div style="font-size:12px;color:#334155">Folio de seguimiento</div>
          <div style="font-size:18px;font-weight:800">${esc(folio)}</div>
          <div style="margin-top:8px;font-size:14px;color:#334155">
            Servicio principal: <b>${esc(serviceMain)}</b><br/>
            Prioridad asignada: <b>${esc(priority)}</b>
          </div>
        </div>

        <p style="margin:0 0 10px"><b>Para agilizar tu propuesta</b>, si lo tienes a la mano puedes preparar:</p>
        <ul style="margin:0 0 14px;padding-left:18px">
          <li>Constancia de Situación Fiscal (CSF)</li>
          <li>Estados financieros recientes (si aplica)</li>
          <li>Descripción breve de tu necesidad principal</li>
        </ul>

        <p style="margin:0 0 14px">
          Si necesitas complementar información, responde a este correo o escríbenos a
          <a href="mailto:conecta@mcydj.mx">conecta@mcydj.mx</a>.
        </p>

        <p style="margin:0;color:#64748b;font-size:12px">
          MC&amp;DJ Consultores y Evaluadores Profesionales — mcydj.mx
        </p>
      </div>
    `;

    let ackOk = false;
    let ackError = "";

    try {
      const toField = [email];
      const payload = {
        from: ACK_FROM,
        to: toField,
        subject: ackSubject,
        html: ackHtml,
        reply_to: "conecta@mcydj.mx"
      };
      if (ACK_BCC) payload.bcc = [ACK_BCC];

      const ackRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!ackRes.ok) {
        ackError = await ackRes.text();
      } else {
        ackOk = true;
      }
    } catch (e) {
      ackError = e?.message || "Fallo acuse";
    }

    return NextResponse.json({
      ok: true,
      id: folio,
      priority,
      ack: ackOk,
      ...(ackOk ? {} : { ackError })
    });
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


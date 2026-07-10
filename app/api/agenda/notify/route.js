import { NextResponse } from "next/server";

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const action = String(body?.action || "").trim();
    const email = String(body?.email || "").trim();
    const user = String(body?.user || email || "Usuario MC&DJ").trim();
    const date = String(body?.date || "").trim();
    const start = String(body?.start || "").trim();
    const end = String(body?.end || "").trim();
    const area = String(body?.area || "General").trim();
    const reason = String(body?.reason || "Uso de NOMIPAQ").trim();
    const notes = String(body?.notes || "").trim();

    if (!action || !email || !date || !start || !end) {
      return NextResponse.json({ error: "Faltan datos de la notificacion." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "noreply@mcydj.mx";
    const auditTo = process.env.EMAIL_TO || "conecta@mcydj.mx";

    if (!apiKey) {
      return NextResponse.json({ error: "Falta RESEND_API_KEY" }, { status: 500 });
    }

    const labels = {
      created: "Reserva creada",
      updated: "Reserva reagendada",
      cancelled: "Reserva cancelada"
    };
    const label = labels[action] || "Actualizacion de reserva";
    const subject = `${label} - NOMIPAQ - ${date} ${start}`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#16150E">
        <div style="background:#A0C7FE;padding:18px;border-radius:14px 14px 0 0">
          <h2 style="margin:0">${esc(label)}</h2>
          <p style="margin:4px 0 0">Agenda NOMIPAQ - MC&amp;DJ Hub</p>
        </div>
        <div style="border:1px solid #d9e3ef;border-top:0;padding:18px;border-radius:0 0 14px 14px">
          <p><strong>Usuario:</strong> ${esc(user)}</p>
          <p><strong>Correo:</strong> ${esc(email)}</p>
          <p><strong>Fecha:</strong> ${esc(date)}</p>
          <p><strong>Horario:</strong> ${esc(start)} a ${esc(end)}</p>
          <p><strong>Area:</strong> ${esc(area)}</p>
          <p><strong>Motivo:</strong> ${esc(reason)}</p>
          ${notes ? `<p><strong>Notas:</strong> ${esc(notes)}</p>` : ""}
        </div>
      </div>`;

    const recipients = Array.from(new Set([email, auditTo].filter(Boolean)));
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to: recipients, subject, html })
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `Resend API error: ${detail}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Error al enviar notificacion." }, { status: 500 });
  }
}

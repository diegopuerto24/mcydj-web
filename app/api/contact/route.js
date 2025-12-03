import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, company = "", email, phone = "", message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
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

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: `Nuevo contacto de ${name}`,
        html: `
          <div style="font-family:system-ui,Arial,sans-serif">
            <h2>Nuevo contacto desde mcydj.mx</h2>
            <p><b>Nombre:</b> ${name}</p>
            <p><b>Empresa:</b> ${company}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Tel/WhatsApp:</b> ${phone}</p>
            <p><b>Mensaje:</b></p>
            <pre>${(message || "").toString()}</pre>
          </div>
        `,
        reply_to: email
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: `Resend API error: ${txt}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Error" }, { status: 500 });
  }
}

// Opcional: para probar rápido que existe la ruta
export async function GET() {
  return NextResponse.json({ ok: true });
}

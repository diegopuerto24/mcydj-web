import { NextResponse } from "next/server";

const REGIMENES_SAT = {
  "601": "General de Ley Personas Morales",
  "603": "Personas Morales con Fines no Lucrativos",
  "605": "Sueldos y Salarios e Ingresos Asimilados a Salarios",
  "606": "Arrendamiento",
  "607": "Régimen de Enajenación o Adquisición de Bienes",
  "608": "Demás ingresos",
  "610": "Residentes en el Extranjero sin Establecimiento Permanente en México",
  "611": "Ingresos por Dividendos (socios y accionistas)",
  "612": "Personas Físicas con Actividades Empresariales y Profesionales",
  "614": "Ingresos por intereses",
  "615": "Régimen de los ingresos por obtención de premios",
  "616": "Sin obligaciones fiscales",
  "620": "Sociedades Cooperativas de Producción que optan por diferir sus ingresos",
  "621": "Incorporación Fiscal",
  "622": "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
  "623": "Opcional para Grupos de Sociedades",
  "624": "Coordinados",
  "625": "Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
  "626": "Régimen Simplificado de Confianza"
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { services, ...fields } = body || {};

    let {
      name = "",
      company = "",
      email = "",
      phone = "",

      sector = "",
      revenue = "",

      taxPayerType = "", // PF | PM
      taxRegime = "",    // código SAT

      timing = "",
      pain = "",

      attachmentUrl = "",
      notes = ""
    } = fields;

    const servicesArr = Array.isArray(services) ? services : (services ? [services] : []);

    // Normalización
    name = String(name).trim();
    company = String(company).trim();
    email = String(email).trim();
    phone = String(phone).trim();

    sector = String(sector).trim();
    revenue = String(revenue).trim();

    taxPayerType = String(taxPayerType).trim().toUpperCase();
    taxRegime = String(taxRegime).trim();

    timing = String(timing).trim();
    pain = String(pain).trim();

    attachmentUrl = String(attachmentUrl).trim();
    notes = String(notes).trim();

    // Validación obligatoria (server-side)
    if (!name || !email || !pain || !taxPayerType || !taxRegime || servicesArr.length < 1) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre, email, servicios, tipo de contribuyente, régimen SAT, necesidad)." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email no válido." }, { status: 400 });
    }
    if (!["PF", "PM"].includes(taxPayerType)) {
      return NextResponse.json({ error: "Tipo de contribuyente no válido." }, { status: 400 });
    }

    // Env vars
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@mcydj.mx";
    const EMAIL_TO = process.env.EMAIL_TO || "conecta@mcydj.mx";

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Falta RESEND_API_KEY" }, { status: 500 });
    }

    // Folio (ID)
    const folio = makeFolio();

    // Régimen legible
    const taxRegimeLabel = REGIMENES_SAT[taxRegime] || "No identificado";
    const taxRegimeHuman = `${taxRegime} — ${taxRegimeLabel}`;

    // Prioridad
    const priority = calcPriority({
      servicesArr,
      timing,
      revenue,
      taxPayerType,
      pain
    });

    const serviceMain = servicesArr[0] || "Sin servicio";

    // Email interno (MC&DJ)
    const internalHtml = `
      <div style="font-family:system-ui,Arial,sans-serif;line-height:1.45">
        <div style="padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc">
          <div style="font-size:12px;color:#334155">Folio</div>
          <div style="font-size:18px;font-weight:800">${esc(folio)}</div>
          <div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap">
            <span style="font-size:12px;padding:4px 10px;border-radius:999px;background:#111827;color:#FFF">Prioridad: ${esc(priority)}</span>
            <span style="font-size:12px;padding:4px 10px;border-radius:999px;border:1px solid #cbd5e1;background:#fff">Servicio principal: ${esc(serviceMain)}</span>
          </div>
        </div>

        <h2 style="margin:16px 0 6px">Nuevo RFP desde mcydj.mx</h2>

        <p><b>Nombre:</b> ${esc(name)}</p>
        <p><b>Empresa:</b> ${esc(company)}</p>
        <p><b>Email:</b> ${esc(email)}</p>
        <p><b>Tel/WhatsApp:</b> ${esc(phone)}</p>

        <p><b>Servicios:</b> ${servicesArr.map(esc).join(", ")}</p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:14px 0" />

        <p><b>Sector:</b> ${esc(sector)}</p>
        <p><b>Facturación:</b> ${esc(revenue)}</p>
        <p><b>Tipo de contribuyente:</b> ${esc(taxPayerType === "PF" ? "Persona Física" : "Persona Moral")}</p>
        <p><b>Régimen (SAT):</b> ${esc(taxRegimeHuman)}</p>
        <p><b>Plazo / Urgencia:</b> ${esc(timing)}</p>

        <p><b>Necesidad principal:</b></p>
        <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:0">${esc(pain)}</pre>

        <p style="margin-top:12px"><b>Adjuntos / Enlace:</b> ${esc(attachmentUrl)}</p>

        <p><b>Notas:</b></p>
        <pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:0">${esc(notes)}</pre>

        <div style="margin-top:16px;padding:12px;border:1px dashed #cbd5e1;border-radius:12px;background:#fff">
          <b>Siguiente acción sugerida:</b>
          <div style="margin-top:6px;font-size:14px;color:#334155">
            1) Confirmar recepción con el cliente (correo/WhatsApp).<br/>
            2) Solicitar CSF y estados financieros si aplica.<br/>
            3) Agendar llamada de diagnóstico (15–30 min).
          </div>
        </div>
      </div>
    `;

    const internalSubject = `${folio} | ${priority} | RFP: ${serviceMain} — ${name}${company ? ` (${company})` : ""}`;

    const internalRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: internalSubject,
        html: internalHtml,
        reply_to: email
      })
    });

    if (!internalRes.ok) {
      const detail = await internalRes.text();
      return NextResponse.json({ error: `Resend API error (interno): ${detail}` }, { status: 502 });
    }

    // Acuse al cliente (no bloqueante)
    // Si no configuras nada en Vercel, estos defaults funcionan.
    const ACK_FROM = process.env.ACK_FROM || `MC&DJ Consultores <${EMAIL_FROM}>`;
    const ACK_BCC = process.env.ACK_BCC || ""; // opcional: conecta@mcydj.mx

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
      const payload = {
        from: ACK_FROM,
        to: [email],
        subject: ackSubject,
        html: ackHtml,
        reply_to: "conecta@mcydj.mx"
      };
      if (ACK_BCC) payload.bcc = [ACK_BCC];

      const ackRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
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
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}

/* ---------- Helpers ---------- */

function makeFolio() {
  // RFP-YYYYMMDD-HHMMSS-XXXX
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `RFP-${y}${m}${day}-${hh}${mm}${ss}-${rnd}`;
}

function calcPriority({ servicesArr, timing, revenue, taxPayerType, pain }) {
  let score = 0;

  // Servicios con ticket / complejidad mayor
  const hiValueServices = [
    "Finanzas corporativas (WACC, CAPM, valuación)",
    "Evaluación de proyectos de inversión"
  ];
  if (servicesArr.some((s) => hiValueServices.includes(s))) score += 3;

  // Capacitación (ajustable)
  if (servicesArr.includes("Capacitación")) score += 1;

  // Urgencia por texto
  const t = (timing || "").toLowerCase();
  if (/(urgente|hoy|esta semana|1 semana|asap|inmediato)/.test(t)) score += 2;
  if (/(2|3|4)\s*seman/.test(t)) score += 1;

  // Facturación (heurística)
  const r = (revenue || "").toLowerCase();
  if (/(>|\bmayor\b|\bmas de\b).*(20|30|50)/.test(r) || /(>20)/.test(r)) score += 2;
  if (/(5|10|15)\s*[-–]\s*(20|30)/.test(r) || /(5–20|5-20)/.test(r)) score += 1;

  // Persona Moral suele implicar mayor estructura/volumen (heurística)
  if (taxPayerType === "PM") score += 1;

  // Dolor largo (heurística)
  if ((pain || "").length >= 450) score += 1;

  if (score >= 6) return "ALTA";
  if (score >= 3) return "MEDIA";
  return "BAJA";
}

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

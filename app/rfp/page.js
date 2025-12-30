"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
;
;

const STEPS = ["Contacto", "Servicios", "Negocio", "Adjuntos"];

/**
 * Catálogo SAT (c_RegimenFiscal).
 * Aquí lo mantenemos en frontend por ahora; después lo movemos a /lib/sat.js para compartirlo con el backend.
 */
const REGIMENES_SAT = [
  { code: "601", label: "General de Ley Personas Morales" },
  { code: "603", label: "Personas Morales con Fines no Lucrativos" },
  { code: "605", label: "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { code: "606", label: "Arrendamiento" },
  { code: "607", label: "Régimen de Enajenación o Adquisición de Bienes" },
  { code: "608", label: "Demás ingresos" },
  { code: "610", label: "Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { code: "611", label: "Ingresos por Dividendos (socios y accionistas)" },
  { code: "612", label: "Personas Físicas con Actividades Empresariales y Profesionales" },
  { code: "614", label: "Ingresos por intereses" },
  { code: "615", label: "Régimen de los ingresos por obtención de premios" },
  { code: "616", label: "Sin obligaciones fiscales" },
  { code: "620", label: "Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { code: "621", label: "Incorporación Fiscal" },
  { code: "622", label: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { code: "623", label: "Opcional para Grupos de Sociedades" },
  { code: "624", label: "Coordinados" },
  { code: "625", label: "Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { code: "626", label: "Régimen Simplificado de Confianza" }
];

// Filtro simple por tipo de contribuyente (para UX).
// Nota: no es una regla fiscal perfecta para todos los casos; es una guía práctica para el usuario.
const REGIMENES_POR_TIPO = {
  PM: new Set(["601", "603", "620", "622", "623", "624"]), // Personas Morales
  PF: new Set(["605", "606", "607", "608", "610", "611", "612", "614", "615", "616", "621", "625", "626"]) // Personas Físicas
};

export default function RFP() {
   const SERVICE_OPTIONS = [
    "Contabilidad/Impuestos",
    "Consultoría Organizacional",
    "Finanzas corporativas (WACC, CAPM, valuación)",
    "Evaluación de proyectos de inversión",
    "Capacitación"
  ];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [folio, setFolio] = useState(""); // lo llenaremos cuando backend devuelva { id }

  const [data, setData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",

    services: [],

    sector: "PyME",
    revenue: "",

    taxPayerType: "", // PF | PM
    taxRegime: "",

    timing: "",
    pain: "",

    attachmentUrl: "",
    notes: ""
  });
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = (params.get("service") || "").trim();
      if (!raw) return;

      const normalize = (s) =>
        String(s)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, " ")
          .trim();

      const n = normalize(raw);

      const aliasMap = [
        { match: ["contabilidad"], value: "Contabilidad/Impuestos" },
        { match: ["impuestos"], value: "Contabilidad/Impuestos" },
        { match: ["consultoria", "organizacional"], value: "Consultoría Organizacional" },
        { match: ["finanzas", "corporativas"], value: "Finanzas corporativas (WACC, CAPM, valuación)" },
        { match: ["wacc"], value: "Finanzas corporativas (WACC, CAPM, valuación)" },
        { match: ["capm"], value: "Finanzas corporativas (WACC, CAPM, valuación)" },
        { match: ["valuacion"], value: "Finanzas corporativas (WACC, CAPM, valuación)" },
        { match: ["evaluacion", "proyectos"], value: "Evaluación de proyectos de inversión" },
        { match: ["proyectos", "inversion"], value: "Evaluación de proyectos de inversión" },
        { match: ["capacitacion"], value: "Capacitación" }
      ];

      // 1) Si coincide exacto con una opción, úsalo
      let selected = "";
      const exact = SERVICE_OPTIONS.find((opt) => normalize(opt) === n);
      if (exact) selected = exact;

      // 2) Si no coincide exacto, intenta por palabras clave
      if (!selected) {
        for (const a of aliasMap) {
          if (a.match.every((w) => n.includes(w))) {
            selected = a.value;
            break;
          }
        }
      }

      if (!selected) return;

      setData((d) => {
        const current = Array.isArray(d.services) ? d.services : [];
        if (current.includes(selected)) return d;
        return { ...d, services: [...current, selected] };
      });
    } catch {
      // no hacemos nada si algo falla; nunca rompemos el formulario por esto
    }
  }, []);
  const filteredRegimes = useMemo(() => {
    if (!data.taxPayerType) return REGIMENES_SAT;
    const allowed = REGIMENES_POR_TIPO[data.taxPayerType];
    return REGIMENES_SAT.filter(r => allowed?.has(r.code));
  }, [data.taxPayerType]);

  const canNext = useMemo(() => {
    if (step === 0) return data.name.trim() && data.email.trim();
    if (step === 1) return data.services.length >= 1; // Servicios obligatorio
    if (step === 2) return data.pain.trim() && data.taxPayerType && data.taxRegime;
    return true;
  }, [step, data]);

  function next() {
    if (!canNext) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function setField(key, value) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setTaxPayerType(value) {
    setData((d) => ({
      ...d,
      taxPayerType: value,
      taxRegime: "" // al cambiar PF/PM, reseteamos régimen para evitar inconsistencias
    }));
  }

  function toggleService(service) {
    setData((d) => {
      const exists = d.services.includes(service);
      return {
        ...d,
        services: exists ? d.services.filter((x) => x !== service) : [...d.services, service]
      };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setOk("");
    setErr("");
    setFolio("");
    setLoading(true);

    try {
      const res = await fetch("/api/rfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "No se pudo enviar. Intenta de nuevo.");

      // Si luego backend manda {id}, lo mostramos.
      if (j?.id) setFolio(String(j.id));
if (j?.ack === false) {
  setErr("Tu solicitud se registró, pero el acuse por correo no pudo enviarse. Si no te llega en unos minutos, revisa Spam o escríbenos a conecta@mcydj.mx.");
}
      setOk("Listo. Recibimos tu solicitud y te contactaremos a la brevedad por correo o WhatsApp.");

      setData({
        name: "",
        company: "",
        email: "",
        phone: "",

        services: [],

        sector: "PyME",
        revenue: "",

        taxPayerType: "",
        taxRegime: "",

        timing: "",
        pain: "",

        attachmentUrl: "",
        notes: ""
      });

      setStep(0);
    } catch (e) {
      setErr(e?.message || "Ocurrió un error. Si persiste, escríbenos a conecta@mcydj.mx.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container">
      <h1 className="h1">Solicitud de Propuesta (RFP)</h1>
      <p className="p-muted">Dinos qué necesitas y preparamos una propuesta a la medida.</p>

      <div style={{ height: 16 }} />

      <ol style={{ display: "flex", gap: 8, listStyle: "none", padding: 0, margin: "0 0 16px", flexWrap: "wrap" }}>
        {STEPS.map((t, i) => (
          <li
            key={t}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: i === step ? "var(--mcydj-ink)" : "rgba(255,255,255,.35)",
              color: i === step ? "var(--mcydj-yellow)" : "var(--mcydj-ink)",
              border: "var(--border)",
              fontSize: 12,
              fontWeight: 800
            }}
          >
            {i + 1}. {t}
          </li>
        ))}
      </ol>

      <div className="card">
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          {step === 0 && (
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <label style={{ fontSize: 12 }}>Nombre *</label>
                <input className="input" value={data.name} onChange={(e) => setField("name", e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Empresa</label>
                <input className="input" value={data.company} onChange={(e) => setField("company", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Email *</label>
                <input className="input" type="email" value={data.email} onChange={(e) => setField("email", e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Tel/WhatsApp</label>
                <input className="input" value={data.phone} onChange={(e) => setField("phone", e.target.value)} />
              </div>
            </div>
          )}

                    {step === 1 && (
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12 }}>Servicios requeridos</label>

              <div style={{ display: "grid", gap: 6 }}>
                {SERVICE_OPTIONS.map((s) => (
                  <label
                    key={s}
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={Array.isArray(data.services) && data.services.includes(s)}
                      onChange={() => toggleService(s)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>

              <div style={{ opacity: 0.8, fontSize: 12, marginTop: 6 }}>
                Selecciona uno o más servicios. Si no estás seguro, elige el más cercano a tu necesidad.
              </div>
            </div>
          )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12 }}>Sector</label>
                <select className="select" value={data.sector} onChange={(e) => setField("sector", e.target.value)}>
                  <option>PyME</option>
                  <option>Salud</option>
                  <option>Inmobiliario/Construcción</option>
                  <option>Comercio</option>
                  <option>Servicios profesionales</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Facturación aproximada (MXN)</label>
                <input
                  className="input"
                  value={data.revenue}
                  onChange={(e) => setField("revenue", e.target.value)}
                  placeholder="p. ej. 1–5 MDP / 5–20 MDP / >20 MDP"
                />
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Tipo de contribuyente *</label>
                <select className="select" value={data.taxPayerType} onChange={(e) => setTaxPayerType(e.target.value)} required>
                  <option value="">Selecciona una opción</option>
                  <option value="PF">Persona Física</option>
                  <option value="PM">Persona Moral</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Régimen fiscal (SAT) *</label>
                <select
                  className="select"
                  value={data.taxRegime}
                  onChange={(e) => setField("taxRegime", e.target.value)}
                  required
                  disabled={!data.taxPayerType}
                  title={!data.taxPayerType ? "Primero selecciona Tipo de contribuyente" : ""}
                >
                  <option value="">
                    {!data.taxPayerType ? "Selecciona primero Tipo de contribuyente" : "Selecciona tu régimen fiscal (SAT)"}
                  </option>
                  {filteredRegimes.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} — {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Plazo deseado / Urgencia</label>
                <input
                  className="input"
                  value={data.timing}
                  onChange={(e) => setField("timing", e.target.value)}
                  placeholder="p. ej. 2–4 semanas"
                />
              </div>

              <div>
                <label style={{ fontSize: 12 }}>Principal necesidad o dolor *</label>
                <textarea className="textarea" rows={5} value={data.pain} onChange={(e) => setField("pain", e.target.value)} required />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12 }}>Enlace a Drive/Docs (opcional)</label>
                <input
                  className="input"
                  value={data.attachmentUrl}
                  onChange={(e) => setField("attachmentUrl", e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Notas adicionales</label>
                <textarea className="textarea" rows={4} value={data.notes} onChange={(e) => setField("notes", e.target.value)} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap", marginTop: 6 }}>
            <div>
              {step > 0 && (
                <button type="button" className="btn btn-secondary" onClick={prev}>
                  Atrás
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {step < STEPS.length - 1 && (
                <button type="button" className="btn btn-primary" onClick={next} disabled={!canNext}>
                  Siguiente
                </button>
              )}
              {step === STEPS.length - 1 && (
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar RFP"}
                </button>
              )}
            </div>
          </div>

          {ok && (
            <div style={{ color: "#16a34a" }}>
              {ok}
              {folio ? <div style={{ marginTop: 6 }}>Folio: <strong>{folio}</strong></div> : null}
            </div>
          )}
          {err && <div style={{ color: "#dc2626" }}>{err}</div>}
        </form>
      </div>
    </section>
  );
}


"use client";
export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";

const STEPS = ["Contacto", "Servicios", "Negocio", "Adjuntos"];

export default function RFP() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const [data, setData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    services: [],
    sector: "PyME",
    revenue: "",
    taxRegime: "",
    timing: "",
    pain: "",
    attachmentUrl: "",
    notes: ""
  });

  const canNext = useMemo(() => {
    if (step === 0) return data.name.trim() && data.email.trim();
    if (step === 2) return data.pain.trim();
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
    setOk(""); setErr(""); setLoading(true);

    try {
      const res = await fetch("/api/rfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error al enviar");

      setOk("¡Gracias! Hemos recibido tu solicitud. Te contactaremos pronto.");
      setData({
        name: "",
        company: "",
        email: "",
        phone: "",
        services: [],
        sector: "PyME",
        revenue: "",
        taxRegime: "",
        timing: "",
        pain: "",
        attachmentUrl: "",
        notes: ""
      });
      setStep(0);
    } catch (e) {
      setErr(e.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container">
      <h1 className="h1">Solicitud de Propuesta (RFP)</h1>
      <p className="p-muted">Dinos qué necesitas y preparamos una propuesta a la medida.</p>

      <div style={{ height: 16 }} />

      <ol style={{display:"flex", gap:8, listStyle:"none", padding:0, margin:"0 0 16px", flexWrap:"wrap"}}>
        {STEPS.map((t, i) => (
          <li key={t} style={{
            padding:"6px 10px", borderRadius:999,
            background: i === step ? "var(--mcydj-ink)" : "rgba(255,255,255,.35)",
            color: i === step ? "var(--mcydj-yellow)" : "var(--mcydj-ink)",
            border: "var(--border)",
            fontSize:12,
            fontWeight:800
          }}>
            {i + 1}. {t}
          </li>
        ))}
      </ol>

      <div className="card">
        <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
          {step === 0 && (
            <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
              <div>
                <label style={{fontSize:12}}>Nombre *</label>
                <input className="input" value={data.name} onChange={(e)=>setField("name", e.target.value)} required />
              </div>
              <div>
                <label style={{fontSize:12}}>Empresa</label>
                <input className="input" value={data.company} onChange={(e)=>setField("company", e.target.value)} />
              </div>
              <div>
                <label style={{fontSize:12}}>Email *</label>
                <input className="input" type="email" value={data.email} onChange={(e)=>setField("email", e.target.value)} required />
              </div>
              <div>
                <label style={{fontSize:12}}>Tel/WhatsApp</label>
                <input className="input" value={data.phone} onChange={(e)=>setField("phone", e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{display:"grid", gap:8}}>
              <label style={{fontSize:12}}>Servicios requeridos</label>
              <div style={{display:"grid", gap:6}}>
                {[
                  "Contabilidad",
                  "Fiscal/Impuestos",
                  "Finanzas corporativas (WACC, CAPM, valuación)",
                  "Evaluación de proyectos de inversión"
                ].map(s => (
                  <label key={s} style={{display:"flex", gap:8, alignItems:"center"}}>
                    <input
                      type="checkbox"
                      checked={data.services.includes(s)}
                      onChange={() => toggleService(s)}
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{display:"grid", gap:12}}>
              <div>
                <label style={{fontSize:12}}>Sector</label>
                <select className="select" value={data.sector} onChange={(e)=>setField("sector", e.target.value)}>
                  <option>PyME</option>
                  <option>Salud</option>
                  <option>Inmobiliario/Construcción</option>
                  <option>Comercio</option>
                  <option>Servicios profesionales</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:12}}>Facturación aproximada (MXN)</label>
                <input className="input" value={data.revenue} onChange={(e)=>setField("revenue", e.target.value)} placeholder="p. ej. 1–5 MDP / 5–20 MDP / >20 MDP" />
              </div>
              <div>
                <label style={{fontSize:12}}>Régimen fiscal</label>
                <input className="input" value={data.taxRegime} onChange={(e)=>setField("taxRegime", e.target.value)} />
              </div>
              <div>
                <label style={{fontSize:12}}>Plazo deseado / Urgencia</label>
                <input className="input" value={data.timing} onChange={(e)=>setField("timing", e.target.value)} placeholder="p. ej. 2–4 semanas" />
              </div>
              <div>
                <label style={{fontSize:12}}>Principal necesidad o dolor *</label>
                <textarea className="textarea" rows={5} value={data.pain} onChange={(e)=>setField("pain", e.target.value)} required />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{display:"grid", gap:12}}>
              <div>
                <label style={{fontSize:12}}>Enlace a Drive/Docs (opcional)</label>
                <input className="input" value={data.attachmentUrl} onChange={(e)=>setField("attachmentUrl", e.target.value)} placeholder="https://drive.google.com/..." />
              </div>
              <div>
                <label style={{fontSize:12}}>Notas adicionales</label>
                <textarea className="textarea" rows={4} value={data.notes} onChange={(e)=>setField("notes", e.target.value)} />
              </div>
            </div>
          )}

          <div style={{display:"flex", gap:10, justifyContent:"space-between", flexWrap:"wrap", marginTop: 6}}>
            <div>
              {step > 0 && (
                <button type="button" className="btn btn-secondary" onClick={prev}>
                  Atrás
                </button>
              )}
            </div>

            <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
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

          {ok && <div style={{color:"#16a34a"}}>{ok}</div>}
          {err && <div style={{color:"#dc2626"}}>{err}</div>}
        </form>
      </div>
    </section>
  );
}

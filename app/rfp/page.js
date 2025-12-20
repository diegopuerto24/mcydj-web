"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

const STEPS = ["Contacto", "Servicios", "Negocio", "Adjuntos"];

export default function RFP() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }

  async function onSubmit(e) {
    e.preventDefault();
    setOk(""); setErr(""); setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    // checkboxes: usar getAll
    const services = fd.getAll("services");
    const payload = Object.fromEntries(fd.entries());
    payload.services = services;

    try {
      const res = await fetch("/api/rfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error al enviar");

      setOk("¡Gracias! Hemos recibido tu solicitud. Te contactaremos pronto.");
      form.reset();
      setStep(0);
    } catch (e) {
      setErr(e.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{maxWidth:820, margin:"0 auto", padding:"48px 16px", fontFamily:"system-ui, Arial, sans-serif"}}>
      <h1 style={{fontSize:32, marginBottom:8}}>Solicitud de Propuesta (RFP)</h1>
      <p style={{color:"#475569", marginBottom:16}}>Dinos qué necesitas y preparamos una propuesta a la medida.</p>

      <ol style={{display:"flex", gap:8, listStyle:"none", padding:0, marginBottom:16, flexWrap:"wrap"}}>
        {STEPS.map((t, i) => (
          <li key={t} style={{
            padding:"6px 10px", borderRadius:999,
            background: i === step ? "#0ea5e9" : "#e2e8f0",
            color: i === step ? "#fff" : "#0f172a", fontSize:12
          }}>{i+1}. {t}</li>
        ))}
      </ol>

      <form onSubmit={onSubmit} style={{border:"1px solid #e2e8f0", borderRadius:16, padding:16}}>
        {step === 0 && (
          <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
            <div>
              <label style={{fontSize:12}}>Nombre *</label>
              <input classname="name" required style={inp}/>
            </div>
            <div>
              <label style={{fontSize:12}}>Empresa</label>
              <input classname="company" style={inp}/>
            </div>
            <div>
              <label style={{fontSize:12}}>Email *</label>
              <input classname="email" type="email" required style={inp}/>
            </div>
            <div>
              <label style={{fontSize:12}}>Tel/WhatsApp</label>
              <input classname="phone" style={inp}/>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{display:"grid", gap:8}}>
            <label style={{fontSize:12}}>Servicios requeridos *</label>
            <div style={{display:"grid", gap:6}}>
              {[
                "Contabilidad",
                "Fiscal/Impuestos",
                "Finanzas corporativas (WACC, CAPM, valuación)",
                "Evaluación de proyectos de inversión"
              ].map(s => (
                <label key={s} style={{display:"flex", gap:8, alignItems:"center"}}>
                  <input type="checkbox" classname="services" value={s}/>
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
              <select name="sector" style={inp}>
                <option>PyME</option>
                <option>Salud</option>
                <option>Inmobiliario/Construcción</option>
                <option>Comercio</option>
                <option>Servicios profesionales</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:12}}>Facturación aproximada (MXN)</label>
              <input classname="revenue" placeholder="p. ej. 1–5 MDP / 5–20 MDP / >20 MDP" style={inp}/>
            </div>
            <div>
              <label style={{fontSize:12}}>Régimen fiscal</label>
              <input classname="taxRegime" style={inp}/>
            </div>
            <div>
              <label style={{fontSize:12}}>Plazo deseado / Urgencia</label>
              <input classname="timing" placeholder="p. ej. 2–4 semanas" style={inp}/>
            </div>
            <div>
              <label style={{fontSize:12}}>Principal necesidad o dolor *</label>
              <textarea classname="pain" required rows={4} style={{...inp, height:"auto"}}/>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{display:"grid", gap:12}}>
            <div>
              <label style={{fontSize:12}}>Enlace a Drive/Docs (opcional)</label>
              <input classname="attachmentUrl" placeholder="https://drive.google.com/..." style={inp}/>
            </div>
            <div>
              <label style={{fontSize:12}}>Notas adicionales</label>
              <textarea name="notes" rows={4} style={{...inp, height:"auto"}}/>
            </div>
            <button disabled={loading} style={{...btnPrimary, marginTop:12}}>
              {loading ? "Enviando..." : "Enviar RFP"}
            </button>
          </div>
        )}

        <div style={{marginTop:16, display:"flex", gap:8, justifyContent:"space-between"}}>
          <div>{step > 0 && <button type="button" onClick={prev} style={btnGhost}>Atrás</button>}</div>
          <div>{step < STEPS.length - 1 && <button type="button" onClick={next} style={btnPrimary}>Siguiente</button>}</div>
        </div>

        {ok && <div style={{color:"#16a34a", marginTop:12}}>{ok}</div>}
        {err && <div style={{color:"#dc2626", marginTop:12}}>{err}</div>}
      </form>
    </section>
  );
}

const inp = { width:"100%", padding:"8px 12px", borderRadius:12, border:"1px solid #cbd5e1" };
const btnPrimary = { padding:"10px 16px", background:"#0ea5e9", color:"#fff", borderRadius:12, border:"none" };
const btnGhost = { padding:"10px 16px", background:"#e2e8f0", color:"#0f172a", borderRadius:12, border:"none" };

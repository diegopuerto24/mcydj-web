"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

export default function Contacto() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setOk(""); setErr(""); setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error al enviar");

      setOk("¡Gracias! Te contactaremos pronto.");
      form.reset();
      // si tu código anterior tenía window.turnstile?.reset(), déjalo solo si usas turnstile
    } catch (e) {
      setErr(e.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container">
      <h1 className="h1">Contáctanos</h1>
      <p className="p-muted">Cuéntanos tu necesidad y cómo podemos ayudarte.</p>

      <div style={{height:16}} />

      <div className="card">
        <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
          <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
            <div>
              <label style={{fontSize:12}}>Nombre *</label>
              <input className="input" name="name" required />
            </div>
            <div>
              <label style={{fontSize:12}}>Empresa</label>
              <input className="input" name="company" />
            </div>
            <div>
              <label style={{fontSize:12}}>Email *</label>
              <input className="input" name="email" type="email" required />
            </div>
            <div>
              <label style={{fontSize:12}}>Tel/WhatsApp</label>
              <input className="input" name="phone" />
            </div>
          </div>

          <div>
            <label style={{fontSize:12}}>Mensaje *</label>
            <textarea className="textarea" name="message" required rows={5} />
          </div>

          <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
            <a className="btn btn-secondary" href="mailto:conecta@mcydj.mx">Escribir un correo</a>
            <a className="btn btn-secondary" href="/rfp">Solicitar propuesta</a>
          </div>

          {ok && <div style={{color:"#16a34a"}}>{ok}</div>}
          {err && <div style={{color:"#dc2626"}}>{err}</div>}
        </form>
      </div>
    </section>
  );
}

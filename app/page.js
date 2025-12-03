"use client";

// 👇 Evita que Next intente pre-renderizar/“exportar” esta ruta en el build
export const dynamic = "force-dynamic";

import { useState } from "react";

export default function Contacto() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setOk(""); 
    setErr(""); 
    setLoading(true);

    const form = e.currentTarget; // guardar referencia antes del await
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error al enviar");

      setOk("¡Gracias! Te contactaremos pronto.");
      form.reset(); // ← ya no se rompe
    } catch (e) {
      setErr(e.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{maxWidth:720, margin:"0 auto", padding:"48px 16px"}}>
      <h1 style={{fontSize:32, marginBottom:12}}>Contáctanos</h1>
      <p style={{color:"#475569", marginBottom:16}}>
        Cuéntanos tu necesidad y cómo podemos ayudarte.
      </p>

      <form onSubmit={onSubmit} style={{border:"1px solid #e2e8f0", borderRadius:16, padding:16}}>
        <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
          <div>
            <label style={{fontSize:12}}>Nombre *</label>
            <input name="name" required style={{width:"100%", padding:"8px 12px", borderRadius:12, border:"1px solid #cbd5e1"}} />
          </div>
          <div>
            <label style={{fontSize:12}}>Empresa</label>
            <input name="company" style={{width:"100%", padding:"8px 12px", borderRadius:12, border:"1px solid #cbd5e1"}} />
          </div>
          <div>
            <label style={{fontSize:12}}>Email *</label>
            <input name="email" type="email" required style={{width:"100%", padding:"8px 12px", borderRadius:12, border:"1px solid #cbd5e1"}} />
          </div>
          <div>
            <label style={{fontSize:12}}>Tel/WhatsApp</label>
            <input name="phone" style={{width:"100%", padding:"8px 12px", borderRadius:12, border:"1px solid #cbd5e1"}} />
          </div>
        </div>

        <div style={{marginTop:12}}>
          <label style={{fontSize:12}}>Mensaje *</label>
          <textarea name="message" rows={4} required style={{width:"100%", padding:"8px 12px", borderRadius:12, border:"1px solid #cbd5e1"}} />
        </div>

        <label style={{display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#475569", marginTop:8}}>
          <input type="checkbox" required /> Acepto el Aviso de Privacidad.
        </label>

        <div style={{marginTop:16, display:"flex", gap:12}}>
          <button disabled={loading} style={{padding:"10px 16px", background:"#0ea5e9", color:"#fff", borderRadius:12, border:"none"}}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
          <a href="mailto:conecta@mcydj.mx" style={{padding:"10px 16px", background:"#e2e8f0", color:"#0f172a", borderRadius:12, textDecoration:"none"}}>
            Escribir un correo
          </a>
        </div>

        {ok && <div style={{color:"#16a34a", marginTop:12}}>{ok}</div>}
        {err && <div style={{color:"#dc2626", marginTop:12}}>{err}</div>}
      </form>
    </section>
  );
}

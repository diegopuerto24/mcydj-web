"use client";
import { useState } from "react";
export default function Contacto() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setOk(null); setErr(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error");
      setOk("¡Gracias! Te contactaremos pronto."); form.reset();
    } catch (e:any) { setErr(e.message || "Ocurrió un error"); }
    finally { setLoading(false); }
  }
  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Contáctanos</h1>
      <form onSubmit={onSubmit} className="space-y-4 card">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1">Nombre</label><input name="name" required className="w-full rounded-xl border px-3 py-2" /></div>
          <div><label className="block text-sm mb-1">Empresa</label><input name="company" className="w-full rounded-xl border px-3 py-2" /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="block text-sm mb-1">Email</label><input type="email" name="email" required className="w-full rounded-xl border px-3 py-2" /></div>
          <div><label className="block text-sm mb-1">Tel/WhatsApp</label><input name="phone" className="w-full rounded-xl border px-3 py-2" /></div>
        </div>
        <div><label className="block text-sm mb-1">Mensaje</label><textarea name="message" rows={4} className="w-full rounded-xl border px-3 py-2" required /></div>
        <div className="text-xs text-slate-500"><input type="checkbox" required className="mr-2" /> Acepto el Aviso de Privacidad.</div>
        <button className="btn btn-primary" disabled={loading}>{loading ? "Enviando..." : "Enviar"}</button>
        {ok && <div className="text-green-600">{ok}</div>}
        {err && <div className="text-red-600">{err}</div>}
      </form>
    </section>
  );
}

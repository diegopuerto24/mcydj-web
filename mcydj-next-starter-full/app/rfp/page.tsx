"use client";
import { useState } from "react";
type Step = 1|2|3|4|5|6;
export default function RFP() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<any>({});

  function update(part: any) { setData((d:any)=>({...d, ...part})); }
  async function submit() {
    setLoading(true); setOk(null); setErr(null);
    try {
      const res = await fetch("/api/rfp", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error");
      setOk("¡Recibido! En breve nos comunicamos.");
    } catch(e:any) { setErr(e.message || "Ocurrió un error"); }
    finally { setLoading(false); }
  }
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Solicitud de cotización</h1>
      <p className="text-slate-600 mb-6">Compártenos algunos datos para entender tu necesidad.</p>
      <div className="card space-y-6">
        {step === 1 && (<div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="rounded-xl border px-3 py-2" placeholder="Nombre *" onChange={e=>update({name:e.target.value})} />
            <input className="rounded-xl border px-3 py-2" placeholder="Empresa" onChange={e=>update({company:e.target.value})} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input className="rounded-xl border px-3 py-2" placeholder="Email *" onChange={e=>update({email:e.target.value})} />
            <input className="rounded-xl border px-3 py-2" placeholder="Tel/WhatsApp" onChange={e=>update({phone:e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={()=>setStep(2)}>Siguiente</button>
        </div>)}
        {step === 2 && (<div className="space-y-4">
          <div className="font-medium">Servicios de interés</div>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {["Contabilidad","Fiscal","Finanzas","Evaluación de proyectos"].map(s => (
              <label key={s} className="flex items-center gap-2">
                <input type="checkbox" onChange={e=>update({services:{...(data.services||{}), [s]: e.target.checked}})} /> {s}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={()=>setStep(1)}>Atrás</button>
            <button className="btn btn-primary" onClick={()=>setStep(3)}>Siguiente</button>
          </div>
        </div>)}
        {step === 3 && (<div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <input className="rounded-xl border px-3 py-2" placeholder="Ventas anuales (MXN)" onChange={e=>update({sales:e.target.value})} />
            <input className="rounded-xl border px-3 py-2" placeholder="Régimen" onChange={e=>update({regime:e.target.value})} />
            <input className="rounded-xl border px-3 py-2" placeholder="# colaboradores" onChange={e=>update({staff:e.target.value})} />
          </div>
          <input className="rounded-xl border px-3 py-2 w-full" placeholder="Software actual (conta/ERP)" onChange={e=>update({software:e.target.value})} />
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={()=>setStep(2)}>Atrás</button>
            <button className="btn btn-primary" onClick={()=>setStep(4)}>Siguiente</button>
          </div>
        </div>)}
        {step === 4 && (<div className="space-y-4">
          <textarea className="rounded-xl border px-3 py-2 w-full" rows={4} placeholder="Describe tu necesidad" onChange={e=>update({need:e.target.value})} />
          <div className="text-xs text-slate-500">Adjuntar archivos se configura después.</div>
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={()=>setStep(3)}>Atrás</button>
            <button className="btn btn-primary" onClick={()=>setStep(5)}>Siguiente</button>
          </div>
        </div>)}
        {step === 5 && (<div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="rounded-xl border px-3 py-2" placeholder="Preferencia de contacto (tel/email)" onChange={e=>update({pref:e.target.value})} />
            <input className="rounded-xl border px-3 py-2" placeholder="Horario preferido" onChange={e=>update({time:e.target.value})} />
          </div>
          <label className="text-xs text-slate-600 flex items-center gap-2">
            <input type="checkbox" onChange={e=>update({consent:e.target.checked})} /> Acepto el Aviso de Privacidad.
          </label>
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={()=>setStep(4)}>Atrás</button>
            <button className="btn btn-primary" onClick={()=>setStep(6)}>Revisar</button>
          </div>
        </div>)}
        {step === 6 && (<div className="space-y-4">
          <div className="text-slate-600 text-sm">Revisa tus datos y envía.</div>
          <pre className="bg-slate-50 p-4 rounded-xl text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={()=>setStep(5)}>Atrás</button>
            <button className="btn btn-primary" disabled={loading} onClick={submit}>
              {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
          {ok && <div className="text-green-600">{ok}</div>}
          {err && <div className="text-red-600">{err}</div>}
        </div>)}
      </div>
    </section>
  );
}

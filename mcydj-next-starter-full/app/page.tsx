export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Asesoría contable, fiscal, financiera y evaluación de proyectos
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Aliados para el crecimiento y cumplimiento de tu organización.
          </p>
          <div className="flex gap-3">
            <a className="btn btn-primary no-underline" href="/rfp">Solicita una cotización</a>
            <a className="btn btn-secondary no-underline" href="/contacto">Agenda asesoría</a>
          </div>
        </div>
        <div className="card">
          <ul className="list-disc pl-5 space-y-2">
            <li>Decisiones con datos: VAN/TIR, flujo y escenarios.</li>
            <li>Cumplimiento: ISR, IVA, CFDI 4.0, RESICO al día.</li>
            <li>Acompañamiento de la contabilidad a la estrategia financiera.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

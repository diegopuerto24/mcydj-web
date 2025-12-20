export default function Home() {
  return (
    <section className="container">
      <h1 className="h1">MC&amp;DJ Consultores</h1>
      <p className="p-muted">Asesoría contable, fiscal y financiera. Evaluación de proyectos de inversión.</p>

      <div style={{height:16}} />

      <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
        <a className="btn btn-primary" href="/rfp">Solicitar propuesta</a>
        <a className="btn btn-secondary" href="/contacto">Contáctanos</a>
      </div>

      <div style={{height:20}} />

      <div className="grid-3">
        <div className="card"><strong>Contabilidad</strong><div className="p-muted">Cumplimiento y orden.</div></div>
        <div className="card"><strong>Fiscal</strong><div className="p-muted">Planeación y control.</div></div>
        <div className="card"><strong>Finanzas</strong><div className="p-muted">Decisiones con datos.</div></div>
      </div>
    </section>
  );
}

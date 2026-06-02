export const metadata = {
  title: "MC&DJ",
  description: "Sitio institucional."
};

export default function HomePage() {
  return (
    <main className="container">
      <section className="card" style={{ display: "grid", gap: 12 }}>
        <h1 className="h1" style={{ margin: 0 }}>MC&amp;DJ</h1>
        <p className="p-muted" style={{ margin: 0 }}>
          Sitio institucional en mantenimiento tecnico temporal.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href="/servicios">Servicios</a>
          <a className="btn btn-secondary" href="/contacto">Contacto</a>
          <a className="btn btn-secondary" href="/portal">Portal interno</a>
        </div>
      </section>
    </main>
  );
}

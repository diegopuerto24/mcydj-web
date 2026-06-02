export const metadata = {
  title: "Nosotros",
  description: "Pagina institucional."
};

export default function NosotrosPage() {
  return (
    <main className="container">
      <section className="card">
        <h1 className="h1">Nosotros</h1>
        <p className="p-muted">
          Pagina institucional en mantenimiento tecnico temporal.
        </p>
        <a className="btn btn-primary" href="/contacto">
          Contacto
        </a>
      </section>
    </main>
  );
}

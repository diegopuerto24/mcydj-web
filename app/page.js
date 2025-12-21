export const metadata = {
  title: "MC&DJ | Contabilidad, Fiscal, Finanzas y Proyectos",
  description:
    "Firma de asesoría contable, fiscal, financiera, consultoría organizacional y evaluación de proyectos. Información confiable para decisiones con sustento."
};

const SERVICES = [
  {
    title: "Contabilidad e Impuestos",
    desc: "Cumplimiento con orden y reportes que sí sirven para decidir.",
    href: "/rfp?service=Contabilidad%20e%20Impuestos"
  },
  {
    title: "Consultoría Organizacional",
    desc: "Procesos, control interno y estructura para crecer con orden.",
    href: "/rfp?service=Consultor%C3%ADa%20Organizacional"
  },
  {
    title: "Finanzas Corporativas",
    desc: "WACC, CAPM, modelos y análisis para decisiones estratégicas.",
    href: "/rfp?service=Finanzas%20corporativas%20(WACC,%20CAPM,%20valuaci%C3%B3n)"
  },
  {
    title: "Evaluación de Proyectos",
    desc: "VAN, TIR, riesgo y escenarios para invertir con criterio.",
    href: "/rfp?service=Evaluaci%C3%B3n%20de%20proyectos%20de%20inversi%C3%B3n"
  },
  {
    title: "Capacitación",
    desc: "Formación aplicada + adopción responsable de IA en tu equipo.",
    href: "/rfp?service=Capacitaci%C3%B3n"
  }
];

function Card({ title, desc, href }) {
  return (
    <article className="card" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{title}</h3>
        <p style={{ margin: 0, opacity: 0.85 }}>{desc}</p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
        <a className="btn btn-primary" href={href}>
          Solicitar propuesta
        </a>
        <a className="btn btn-secondary" href="/servicios">
          Ver detalle
        </a>
      </div>
    </article>
  );
}

function SectionHeader({ kicker, title, desc }) {
  return (
    <header style={{ display: "grid", gap: 8 }}>
      {kicker ? (
        <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.6, opacity: 0.85 }}>
          {kicker}
        </div>
      ) : null}
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{title}</h2>
      {desc ? <p style={{ margin: 0, opacity: 0.85 }}>{desc}</p> : null}
    </header>
  );
}

export default function HomePage() {
  return (
    <section className="container" style={{ display: "grid", gap: 16 }}>
      {/* HERO */}
      <header className="card" style={{ display: "grid", gap: 12 }}>
        <h1 className="h1" style={{ margin: 0 }}>
          Contabilidad, fiscal y finanzas para decisiones con sustento
        </h1>

        <p className="p-muted" style={{ margin: 0 }}>
          En MC&amp;DJ convertimos cumplimiento y análisis financiero en información ejecutiva: clara, confiable y útil para
          operar, crecer y decidir con menor incertidumbre.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          <a className="btn btn-primary" href="/rfp">
            Solicitar propuesta
          </a>
          <a className="btn btn-secondary" href="/contacto">
            Hablar con un asesor
          </a>
          <a className="btn btn-secondary" href="/servicios">
            Ver servicios
          </a>
        </div>

        <div
          style={{
            marginTop: 6,
            padding: 12,
            border: "var(--border)",
            borderRadius: 14,
            background: "rgba(255,255,255,.45)"
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.6 }}>
            Uso estratégico de Inteligencia Artificial
          </div>
          <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
            Integramos IA como apoyo al análisis, diagnóstico y modelación para elevar precisión y oportunidad. No sustituye
            el criterio profesional: lo acelera y lo fortalece, siempre bajo supervisión experta.
          </p>
        </div>
      </header>

      {/* DIFERENCIADORES */}
      <section className="card" style={{ display: "grid", gap: 12 }}>
        <SectionHeader
          kicker="Nuestra propuesta"
          title="Una firma con enfoque ejecutivo"
          desc="No entregamos solo cumplimiento: entregamos control, claridad y soporte para decidir."
        />

        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
          <li>
            <b>Criterio profesional + metodología:</b> procesos estructurados y entregables documentados.
          </li>
          <li>
            <b>Información que sí se usa:</b> reportes ejecutivos, modelos y análisis orientados a decisiones.
          </li>
          <li>
            <b>Prevención de riesgos:</b> enfoque en control, consistencia y reducción de contingencias.
          </li>
          <li>
            <b>IA con responsabilidad:</b> tecnología como apoyo; el criterio experto define el resultado.
          </li>
        </ul>
      </section>

      {/* SERVICIOS */}
      <section style={{ display: "grid", gap: 12 }}>
        <SectionHeader
          kicker="Servicios"
          title="Cómo podemos ayudarte"
          desc="Selecciona un servicio para solicitar una propuesta. Si tienes dudas, contáctanos primero."
        />

        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(1, minmax(0, 1fr))"
          }}
        >
          {SERVICES.map((s) => (
            <Card key={s.title} title={s.title} desc={s.desc} href={s.href} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn btn-secondary" href="/servicios">
            Ver detalle de servicios
          </a>
        </div>
      </section>

      {/* CIERRE CTA */}
      <footer className="card" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
          Si ya tienes claridad, envíanos tu solicitud. Si no, te orientamos.
        </h2>
        <p style={{ margin: 0, opacity: 0.85 }}>
          El objetivo es simple: información confiable, análisis sólido y criterio profesional para que tomes decisiones con
          menor incertidumbre.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href="/rfp">
            Solicitar propuesta
          </a>
          <a className="btn btn-secondary" href="/contacto">
            Contacto
          </a>
        </div>
      </footer>
    </section>
  );
}

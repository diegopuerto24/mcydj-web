import Reveal from "../../components/Reveal";
export const metadata = {
  title: "Nosotros x | MC&DJ",
  description:
    "MC&DJ es una firma de asesoría contable, fiscal, financiera, consultoría organizacional y evaluación de proyectos, con enfoque en información confiable para la toma de decisiones."
};

function Block({ title, children }) {
  return (
    <section
      className="card"
      style={{
        display: "grid",
        gap: 10,
        padding: 16
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          opacity: 0.85
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gap: 10, opacity: 0.92 }}>{children}</div>
    </section>
  );
}

export default function NosotrosPage() {
  return (
    <Reveal as="header" className="card" delay={0}> style={{ display: "grid", gap: 16 }}>
      <header className="card" style={{ display: "grid", gap: 10 }}>
        <h1 className="h1" style={{ margin: 0 }}>
          Nosotros
        </h1>

        <p className="p-muted" style={{ margin: 0 }}>
          Somos una firma de asesoría contable, fiscal, financiera y de evaluación de proyectos enfocada en generar
          información confiable para la toma de decisiones empresariales.
        </p>

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
            Enfoque de trabajo
          </div>
          <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
            Nuestro objetivo es que la información contable y financiera no sea un trámite, sino una herramienta real de
            control, planeación y crecimiento.
          </p>
        </div>
      </header>

      <Reveal delay={60}><Block title="Qué hacemos">
        <p style={{ margin: 0 }}>
          En MC&amp;DJ acompañamos a personas físicas y morales en la gestión, análisis y optimización de su información
          financiera, fiscal y administrativa, con un enfoque técnico, práctico y orientado a decisiones.
        </p>
        <p style={{ margin: 0 }}>
          Nuestro trabajo no se limita al cumplimiento normativo. Buscamos que la información contable y financiera se
          convierta en un soporte claro para la toma de decisiones.
        </p>
      </Block>

      <Reveal delay={90}><Block title="Cómo trabajamos">
        <p style={{ margin: 0 }}>
          Operamos bajo metodologías estructuradas que combinan criterio profesional, análisis riguroso y herramientas
          tecnológicas modernas —incluida la inteligencia artificial— para incrementar la precisión, eficiencia y
          profundidad de nuestros análisis.
        </p>
        <p style={{ margin: 0 }}>
          Integramos este enfoque tanto en el trabajo técnico como en procesos de <b>consultoría organizacional</b>,
          fortaleciendo estructura administrativa, procesos internos y sistemas de control, siempre alineados al contexto
          y objetivos de cada organización.
        </p>
        <p style={{ margin: 0 }}>
          La tecnología es un apoyo; el criterio profesional es el eje central de nuestro trabajo.
        </p>
      </Block>

      <Reveal delay={120}><Block title="Cómo generamos valor">
        <p style={{ margin: 0 }}>Generamos valor cuando ayudamos a nuestros clientes a:</p>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
          <li>Reducir incertidumbre en la toma de decisiones.</li>
          <li>Prevenir riesgos fiscales, financieros y operativos.</li>
          <li>Evaluar correctamente proyectos e inversiones con sustento técnico.</li>
          <li>Fortalecer estructura organizacional y procesos internos.</li>
          <li>
            Desarrollar capacidades internas mediante <b>capacitación aplicada y especializada</b>.
          </li>
        </ul>
        <p style={{ margin: 0 }}>
          Nuestros servicios y programas están diseñados para que la información, el análisis y el criterio permanezcan
          en la organización y no dependan exclusivamente de terceros.
        </p>
      </Block>

      <Reveal delay={150}><Block title="Compromiso institucional">
        <p style={{ margin: 0 }}>
          En MC&amp;DJ creemos que una buena decisión comienza con información confiable, análisis sólido y criterio
          profesional.
        </p>
        <p style={{ margin: 0 }}>
          Por ello, más que proveedores de servicios, buscamos ser aliados técnicos en la toma de decisiones
          empresariales, acompañando a nuestros clientes en su operación, crecimiento y profesionalización.
        </p>
      </Block>

      <Reveal as="footer" className="card" delay={180}> style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>¿Hablamos?</h2>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Si ya tienes claridad sobre lo que necesitas, envíanos una solicitud. Si prefieres, podemos orientarte primero.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href="/rfp">
            Solicitar propuesta
          </a>
          <a className="btn btn-secondary" href="/contacto">
            Contacto
          </a>
          <a className="btn btn-secondary" href="/servicios">
            Ver servicios
          </a>
        </div>
      </footer>
    </section>
  );
}

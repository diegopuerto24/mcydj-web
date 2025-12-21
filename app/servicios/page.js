export const metadata = {
  title: "Servicios ok| MC&DJ",
  description:
    "Servicios contables, fiscales, financieros y de evaluación de proyectos. Integramos inteligencia artificial como apoyo al análisis y al criterio profesional."
};

const SERVICES = [
  {
    key: "contabilidad-impuestos",
    title: "Contabilidad e Impuestos",
    subtitle: "Cumplimiento con orden, información confiable y prevención de riesgos.",
    what: [
      "Administramos, supervisamos y optimizamos el cumplimiento contable y fiscal de personas físicas y morales.",
      "Integramos herramientas de análisis asistido por inteligencia artificial para detección de inconsistencias, validación y revisión documental, siempre bajo supervisión profesional.",
      "Nuestro enfoque es que la contabilidad no solo “cumpla”, sino que sirva para decidir."
    ],
    when: [
      "Buscas certeza fiscal y reducción de contingencias.",
      "Tu contabilidad está al día, pero no te ayuda a tomar decisiones.",
      "Quieres orden, control y reporteo ejecutivo oportuno."
    ],
    deliverables: [
      "Contabilidad mensual conforme a NIF (según aplique).",
      "Cumplimiento fiscal (ISR, IVA, retenciones) y reportes de control.",
      "Conciliaciones y papeles de trabajo.",
      "Reportes financieros ejecutivos (ingresos, gastos, márgenes, flujo).",
      "Acompañamiento ante requerimientos y revisiones (según alcance contratado)."
    ],
    cta: "Solicitar propuesta"
  },
  {
    key: "consultoria-organizacional",
    title: "Consultoría Organizacional",
    subtitle: "Estructura, procesos y control interno para crecer con orden.",
    what: [
      "Diagnosticamos y fortalecemos la estructura organizacional, los procesos administrativos y el control interno.",
      "Integramos herramientas de inteligencia artificial para análisis de información, detección de patrones operativos y simulación de escenarios, siempre con supervisión experta.",
      "Además, trasladamos este conocimiento a tu organización para que adoptes IA de forma responsable y práctica."
    ],
    when: [
      "La empresa creció más rápido que su estructura y procesos.",
      "Hay dependencia excesiva del dueño, duplicidad de funciones o falta de control.",
      "Deseas incorporar IA en la gestión administrativa/financiera, pero necesitas una ruta clara y responsable."
    ],
    deliverables: [
      "Diagnóstico organizacional y de procesos (con hallazgos priorizados).",
      "Mapa de procesos y oportunidades de mejora.",
      "Definición de roles, responsabilidades y controles clave.",
      "KPIs sugeridos para seguimiento y disciplina operativa.",
      "Lineamientos de adopción responsable de IA (qué sí y qué no automatizar)."
    ],
    cta: "Solicitar propuesta"
  },
  {
    key: "finanzas-corporativas",
    title: "Finanzas Corporativas",
    subtitle: "Modelos, costo de capital y decisiones estratégicas con sustento.",
    what: [
      "Analizamos la estructura financiera para optimizar el costo de capital y fortalecer decisiones estratégicas.",
      "Desarrollamos modelos financieros y análisis de escenarios/sensibilidad, incorporando apoyo de IA para explorar alternativas y riesgos con mayor profundidad.",
      "La IA no sustituye el criterio profesional: acelera el análisis y mejora la calidad de la decisión."
    ],
    when: [
      "Antes de invertir, endeudarte, crecer o reorganizar.",
      "Necesitas justificar decisiones ante socios, inversionistas o bancos.",
      "Quieres conocer tu costo de capital y el impacto real de tus decisiones."
    ],
    deliverables: [
      "Cálculo de WACC y componentes (según información disponible).",
      "CAPM / costo de capital y supuestos documentados.",
      "Modelos financieros (escenarios y sensibilidad).",
      "Análisis de riesgos y variables críticas.",
      "Recomendación ejecutiva para toma de decisiones."
    ],
    cta: "Solicitar propuesta"
  },
  {
    key: "evaluacion-proyectos",
    title: "Evaluación de Proyectos de Inversión",
    subtitle: "Decisiones de inversión con metodología y análisis de riesgo.",
    what: [
      "Evaluamos viabilidad financiera y económica de proyectos con metodologías cuantitativas.",
      "Complementamos con análisis asistido por IA para escenarios alternativos y evaluación de riesgos cuando el contexto lo amerita.",
      "Entregamos un informe defendible para socios, comités o instituciones."
    ],
    when: [
      "Antes de comprometer capital en un proyecto nuevo o expansión.",
      "Necesitas comparar alternativas de inversión.",
      "Requieres sustentar un proyecto con números, no con intuición."
    ],
    deliverables: [
      "Flujos de efectivo proyectados (estructura y supuestos).",
      "VAN, TIR, PRI y métricas relevantes.",
      "Análisis de sensibilidad y escenarios.",
      "Evaluación de riesgos y variables críticas.",
      "Informe ejecutivo con recomendación."
    ],
    cta: "Solicitar propuesta"
  },
  {
    key: "capacitacion",
    title: "Capacitación Ejecutiva y Empresarial",
    subtitle: "Formación práctica en contabilidad, fiscal y finanzas + adopción responsable de IA.",
    what: [
      "Diseñamos e impartimos capacitación aplicada al contexto real de tu empresa.",
      "Integramos el uso práctico y responsable de herramientas de inteligencia artificial para elevar la calidad del análisis y la toma de decisiones.",
      "Transferimos metodología, guías y casos para que tu equipo lo implemente internamente."
    ],
    when: [
      "Quieres fortalecer capacidades contables, fiscales o financieras en tu equipo.",
      "Buscas homologar criterios de decisión y estandarizar prácticas.",
      "Deseas que tu organización adopte IA con enfoque práctico, sin improvisación."
    ],
    deliverables: [
      "Programa a la medida (presencial o virtual).",
      "Material de apoyo, plantillas y ejercicios prácticos.",
      "Casos reales aplicados a tu giro.",
      "Guía de uso responsable de IA (buenas prácticas y límites).",
      "Constancia de participación (opcional, según alcance)."
    ],
    cta: "Solicitar propuesta"
  }
];

function ServiceCard({ s }) {
  return (
    <article className="card" style={{ display: "grid", gap: 12 }}>
      <header style={{ display: "grid", gap: 6 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{s.title}</h2>
        <p style={{ margin: 0, opacity: 0.85 }}>{s.subtitle}</p>
      </header>

      <div style={{ display: "grid", gap: 12 }}>
        <Section title="Qué hacemos">
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {s.what.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </Section>

        <Section title="Cuándo lo necesitas">
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {s.when.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </Section>

        <Section title="Entregables clave">
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {s.deliverables.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </Section>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
        <a className="btn btn-primary" href={`/rfp?service=${encodeURIComponent(s.title)}`}>
          {s.cta}
        </a>
        <a className="btn btn-secondary" href="/contacto">
          Hablar con un asesor
        </a>
      </div>
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ borderTop: "var(--border)", paddingTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.6, opacity: 0.85 }}>
        {title}
      </div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </section>
  );
}

export default function ServiciosPage() {
  return (
    <section className="container" style={{ display: "grid", gap: 18 }}>
      <header className="card" style={{ display: "grid", gap: 10 }}>
        <h1 className="h1" style={{ margin: 0 }}>
          Servicios
        </h1>
        <p className="p-muted" style={{ margin: 0 }}>
          En MC&amp;DJ combinamos metodología, experiencia y herramientas modernas para entregar soluciones
          contables, fiscales y financieras con enfoque ejecutivo.
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
            Uso estratégico de Inteligencia Artificial
          </div>
          <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
            Integramos herramientas de inteligencia artificial en nuestros procesos de análisis, diagnóstico y modelación
            para incrementar precisión, profundidad y oportunidad. La IA no sustituye el criterio profesional: lo acelera
            y lo fortalece, siempre bajo supervisión experta.
          </p>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(1, minmax(0, 1fr))"
        }}
      >
        {SERVICES.map((s) => (
          <ServiceCard key={s.key} s={s} />
        ))}
      </div>

      <footer className="card" style={{ display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>¿Listo para una propuesta?</h2>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Si ya tienes claridad sobre lo que necesitas, envíanos tu solicitud. Si prefieres, podemos orientarte primero.
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

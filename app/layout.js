import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header className="siteHeader">
          <div className="container headerInner">
            <a href="/" className="brand" aria-label="Ir a inicio">
              {/* Si tienes logo en /public/logo.svg, se mostrará */}
              <img src="/logo.svg" alt="MC&DJ" className="brandLogo" />
            </a>

            <nav className="nav">
              <a href="/">Inicio</a>
              <a href="/servicios">Servicios</a>
              <a href="/nosotros">Nosotros</a>
              <a href="/contacto">Contacto</a>
            </nav>

            <div className="headerCtas">
              <a href="/rfp" className="btn btn-primary">Solicitar propuesta</a>
              <a href="mailto:conecta@mcydj.mx" className="btn btn-secondary">Escribir un correo</a>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="siteFooter">
          <div className="container footerInner">
            <div>
              <strong>MC&amp;DJ Consultores y Evaluadores Profesionales</strong>
              <div className="p-muted">Mérida, Yucatán · México</div>
            </div>
            <div className="footerLinks">
              <a href="/aviso-de-privacidad">Aviso de Privacidad</a>
              <a href="mailto:conecta@mcydj.mx">conecta@mcydj.mx</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}


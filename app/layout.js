import "./globals.css";
import SiteHeader from "../components/SiteHeader";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
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



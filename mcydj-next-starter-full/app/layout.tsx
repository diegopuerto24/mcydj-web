import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "MC&DJ Consultores | Asesoría contable, fiscal y financiera",
  description: "Asesoría contable, fiscal, financiera y evaluación de proyectos en México.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: { title: "MC&DJ Consultores", description: "Asesoría contable, fiscal, financiera y evaluación de proyectos en México.", images: ["/og.png"] },
  alternates: { canonical: "/" }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>
        <header className="border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 no-underline">
              <img src="/logo.svg" alt="MC&DJ" width={120} height={24} />
            </a>
            <nav className="flex gap-4">
              <a href="/servicios/contabilidad" className="hover:underline">Servicios</a>
              <a href="/recursos/primeros-pasos" className="hover:underline">Recursos</a>
              <a href="/contacto" className="btn btn-primary no-underline">Contáctanos</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <div className="font-semibold">MC&DJ Consultores y Evaluadores Profesionales</div>
                <div>Mérida, Yucatán, México</div>
                <div><a href="mailto:contacto@mcydj.mx">contacto@mcydj.mx</a></div>
              </div>
              <div className="flex gap-6">
                <a href="/aviso-de-privacidad" className="hover:underline">Aviso de Privacidad</a>
                <a href="/contacto" className="hover:underline">Contacto</a>
              </div>
            </div>
            <div className="mt-6">© {new Date().getFullYear()} MC&DJ</div>
          </div>
        </footer>
      </body>
    </html>
  );
}

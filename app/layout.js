export const metadata = {
  title: "MC&DJ Consultores | Asesoría contable, fiscal y financiera",
  description: "Asesoría contable, fiscal, financiera y evaluación de proyectos en México."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <body style={{fontFamily:"system-ui, Arial, sans-serif", color:"#0f172a"}}>
        <header style={{borderBottom:"1px solid #e2e8f0"}}>
          <div style={{maxWidth:960, margin:"0 auto", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <a href="/" style={{textDecoration:"none", color:"inherit", display:"flex", alignItems:"center", gap:8}}>
              <img src="/logo.svg" alt="MC&DJ" width="120" height="24" />
            </a>
            <nav style={{display:"flex", gap:16}}>
              <a href="/" style={{textDecoration:"underline", textUnderlineOffset:4}}>Inicio</a>
              <a href="/contacto" style={{textDecoration:"underline", textUnderlineOffset:4}}>Contacto</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer style={{borderTop:"1px solid #e2e8f0", marginTop:24}}>
          <div style={{maxWidth:960, margin:"0 auto", padding:"24px 16px", fontSize:14, color:"#475569"}}>
            © {new Date().getFullYear()} MC&DJ Consultores y Evaluadores Profesionales · Mérida, Yucatán
          </div>
        </footer>
      </body>
    </html>
  );
}

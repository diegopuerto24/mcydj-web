export default function Home() {
  return (
    <section style={{maxWidth:960, margin:"0 auto", padding:"48px 16px"}}>
      <h1 style={{fontSize:36, marginBottom:12}}>
        Asesoría contable, fiscal, financiera y evaluación de proyectos
      </h1>
      <p style={{fontSize:18, color:"#475569", marginBottom:16}}>
        Aliados para el crecimiento y cumplimiento de tu organización.
      </p>
      <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
        <a href="/contacto" style={{padding:"10px 16px", background:"#0ea5e9", color:"#fff", borderRadius:12, textDecoration:"none"}}>
          Contáctanos
        </a>
        <a href="mailto:contacto@mcydj.mx" style={{padding:"10px 16px", background:"#e2e8f0", color:"#0f172a", borderRadius:12, textDecoration:"none"}}>
          Escribir un correo
        </a>
      </div>
    </section>
  );
}

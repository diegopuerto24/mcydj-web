"use client";

import { useState } from "react";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="siteHeader">
      <div className="container headerInner">
        <a href="/" className="brand" aria-label="Ir a inicio">
          <img src="/logo.svg" alt="MC&DJ" className="brandLogo" />
        </a>

        {/* Nav desktop */}
        <nav className="nav navDesktop" aria-label="Navegación principal">
          <a href="/">Inicio</a>
          <a href="/servicios">Servicios</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/contacto">Contacto</a>
        </nav>

        <div className="headerCtas">
          <a href="/rfp" className="btn btn-primary">Solicitar propuesta</a>

          {/* Botón móvil */}
          <button
            type="button"
            className="btn btn-secondary menuBtn"
            aria-expanded={open ? "true" : "false"}
            aria-controls="mobile-menu"
            onClick={() => setOpen(v => !v)}
          >
            {open ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>

      {/* Nav móvil */}
      {open && (
        <div id="mobile-menu" className="mobileMenu">
          <div className="container mobileMenuInner">
            <a href="/" onClick={() => setOpen(false)}>Inicio</a>
            <a href="/servicios" onClick={() => setOpen(false)}>Servicios</a>
            <a href="/nosotros" onClick={() => setOpen(false)}>Nosotros</a>
            <a href="/contacto" onClick={() => setOpen(false)}>Contacto</a>
            <a href="/rfp" className="btn btn-primary" onClick={() => setOpen(false)}>
              Solicitar propuesta
            </a>
            <a href="mailto:conecta@mcydj.mx" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Escribir un correo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

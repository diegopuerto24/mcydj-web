"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../../../lib/supabaseClient";
import "../portal.css";

const FALLBACK_TOOLS = [
  {
    id: "isr",
    nombre: "Calculadora ISR Sueldos y Asimilables",
    descripcion: "Herramienta para calculo de ISR de trabajadores y asimilables.",
    url: "/portal/herramientas/isr"
  },
  {
    id: "resico",
    nombre: "Informes Declaraciones Anuales RESICO",
    descripcion: "Generacion de informes y analisis RESICO.",
    url: "/portal/herramientas/resico"
  },
  {
    id: "cfdi",
    nombre: "Descarga CFDI",
    descripcion: "Herramienta para descarga masiva de CFDI.",
    url: "/portal/herramientas/cfdi"
  },
  {
    id: "cobro",
    nombre: "Cobro Automatico Clientes",
    descripcion: "Herramienta para automatizacion de cobranza.",
    url: "/portal/herramientas/cobro"
  },
  {
    id: "diagnostico",
    nombre: "Diagnostico Clientes Nuevos",
    descripcion: "Cuestionario diagnostico para prospectos y nuevos clientes.",
    url: "/portal/herramientas/diagnostico"
  }
];

function getToolStatus(tool) {
  const url = tool.url || "";
  if (url.includes("isr") || url.includes("resico")) return "Listo para migracion";
  if (url.includes("cfdi") || url.includes("cobro") || url.includes("diagnostico")) return "Repositorio identificado";
  return "Pendiente";
}

export default function HerramientasPage() {
  const [tools, setTools] = useState(FALLBACK_TOOLS);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Cargando catalogo de herramientas...");

  useEffect(() => {
    async function loadTools() {
      if (!isSupabaseConfigured || !supabase) {
        setTools(FALLBACK_TOOLS);
        setMessage("Modo local: Supabase no esta configurado en este entorno.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tools")
        .select("id,nombre,descripcion,url,activo")
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (error) {
        setTools(FALLBACK_TOOLS);
        setMessage("No fue posible leer Supabase. Se muestra catalogo local de respaldo.");
        setLoading(false);
        return;
      }

      setTools(data?.length ? data : FALLBACK_TOOLS);
      setMessage(data?.length ? "Catalogo conectado a Supabase." : "La tabla tools esta vacia. Se muestra respaldo local.");
      setLoading(false);
    }

    loadTools();
  }, []);

  const stats = useMemo(() => {
    return {
      total: tools.length,
      fiscales: tools.filter((tool) => /ISR|RESICO|CFDI/i.test(tool.nombre)).length,
      operativas: tools.filter((tool) => /Cobro|Diagnostico/i.test(tool.nombre)).length
    };
  }, [tools]);

  return (
    <main className="portalShell portalToolsShell">
      <aside className="portalSidebar">
        <a className="portalBrand" href="/portal">
          <strong>MC&amp;DJ ERP</strong>
          <span>Sistema interno</span>
        </a>
        <nav className="portalNav" aria-label="Menu del ERP">
          <a href="/portal">Dashboard</a>
          <a href="/portal">Agenda NOMIPAQ</a>
          <a className="active" href="/portal/herramientas">Herramientas</a>
          <a href="/portal">Clientes</a>
          <a href="/portal">Proyectos</a>
          <a href="/portal">Configuracion</a>
        </nav>
      </aside>

      <section className="portalMain">
        <header className="portalTopbar portalTopbarBlue">
          <div>
            <p>Centro de Herramientas</p>
            <h1>Herramientas internas MC&amp;DJ</h1>
          </div>
          <div className="roleBox">
            <span>Estado</span>
            <strong>{loading ? "Cargando" : "Operativo"}</strong>
          </div>
        </header>

        <section className="notice noticeBlue">{message}</section>

        <section className="portalGrid">
          <article className="portalCard statCard">
            <span>Herramientas</span>
            <strong>{stats.total}</strong>
            <small>Catalogo inicial del ERP</small>
          </article>
          <article className="portalCard statCard">
            <span>Fiscal</span>
            <strong>{stats.fiscales}</strong>
            <small>ISR, RESICO y CFDI</small>
          </article>
          <article className="portalCard statCard">
            <span>Operacion</span>
            <strong>{stats.operativas}</strong>
            <small>Cobro y diagnostico</small>
          </article>
          <article className="portalCard statCard">
            <span>Base</span>
            <strong>Supabase</strong>
            <small>Catalogo administrable</small>
          </article>
        </section>

        <section className="toolsGrid">
          {tools.map((tool) => (
            <article className="portalCard toolCard" key={tool.id || tool.nombre}>
              <div>
                <span className="toolBadge">{getToolStatus(tool)}</span>
                <h2>{tool.nombre}</h2>
                <p>{tool.descripcion}</p>
              </div>
              <a className="btn btn-primary" href={tool.url || "#"}>
                Abrir herramienta
              </a>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

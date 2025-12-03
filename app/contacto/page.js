"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

export default function Contacto() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setOk(""); setErr(""); setLoading(true);
    const form = e.currentTarget; // guarda la ref antes del await
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error al enviar");
      setOk("¡Gracias! Te contactaremos pronto.");
      form.reset();
    } catch (e) { setErr(e.message || "Ocurrió un error"); }
    finally { setLoading(false); }
  }

  // ... (el resto del JSX del formulario)
}

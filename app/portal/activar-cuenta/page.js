"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "../../../lib/supabaseClient";

const MIN_PASSWORD_LENGTH = 10;

function getHashParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

function scorePassword(password) {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
}

function strengthLabel(score) {
  if (score <= 1) return "Débil";
  if (score <= 3) return "Media";
  if (score === 4) return "Fuerte";
  return "Muy fuerte";
}

function friendlyAuthError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  if (message.includes("expired") || message.includes("invalid") || message.includes("otp")) {
    return "El enlace venció o no es válido. Solicita que te reenvíen la invitación.";
  }
  return error?.message || "No fue posible validar el enlace de activación.";
}

export default function ActivateAccountPage() {
  const router = useRouter();
  const [status, setStatus] = useState("validating");
  const [message, setMessage] = useState("Validando enlace de activación...");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);
  const validation = useMemo(() => {
    if (!password) return "Captura una contraseña nueva.";
    if (password.length < MIN_PASSWORD_LENGTH) return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    if (password !== confirm) return "La confirmación no coincide.";
    return "";
  }, [password, confirm]);

  useEffect(() => {
    async function validateLink() {
      if (!isSupabaseConfigured || !supabase) {
        setStatus("error");
        setMessage("Supabase no está configurado en este entorno.");
        return;
      }

      try {
        const url = new URL(window.location.href);
        const hashParams = getHashParams();
        const code = url.searchParams.get("code");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const hashError = hashParams.get("error_description") || hashParams.get("error");

        if (hashError) throw new Error(hashError);

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.history.replaceState({}, document.title, "/portal/activar-cuenta");
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
          window.history.replaceState({}, document.title, "/portal/activar-cuenta");
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data?.session?.user) throw new Error("No hay una sesión válida para activar la cuenta.");

        setEmail(data.session.user.email || "");
        setStatus("ready");
        setMessage("Define una contraseña segura para terminar la activación.");
      } catch (error) {
        setStatus("error");
        setMessage(friendlyAuthError(error));
      }
    }

    validateLink();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (validation || submitting) return;
    setSubmitting(true);
    setMessage("Actualizando contraseña...");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(friendlyAuthError(error));
      setSubmitting(false);
      return;
    }
    setStatus("done");
    setMessage("Cuenta activada correctamente. Redirigiendo al portal...");
    setTimeout(() => router.push("/portal"), 1000);
  }

  return (
    <main className="activateShell">
      <section className="portalCard activateCard">
        <div className="sectionTitle">
          <p>MC&amp;DJ Hub</p>
          <h1>Activar cuenta</h1>
          <span>{email || "Identidad institucional"}</span>
        </div>
        <section className={`notice ${status === "error" ? "noticeError" : "noticeBlue"}`}>{message}</section>
        {status === "ready" || status === "done" ? (
          <form className="reservationForm" onSubmit={handleSubmit}>
            <label className="field"><span>Nueva contraseña</span><div className="passwordInput"><input type={showPassword ? "text" : "password"} value={password} minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Ocultar" : "Mostrar"}</button></div></label>
            <label className="field"><span>Confirmar contraseña</span><input type={showPassword ? "text" : "password"} value={confirm} minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" onChange={(e) => setConfirm(e.target.value)} /></label>
            <div className="strengthMeter" aria-label={`Fortaleza ${strengthLabel(strength)}`}><span style={{ width: `${(strength / 5) * 100}%` }} /></div>
            <small className="fieldHelp">Fortaleza: {strengthLabel(strength)} · mínimo {MIN_PASSWORD_LENGTH} caracteres.</small>
            {validation ? <small className="fieldError">{validation}</small> : null}
            <button className="btn btn-primary" disabled={Boolean(validation) || submitting || status === "done"}>{submitting ? "Guardando..." : "Activar y entrar"}</button>
          </form>
        ) : null}
        {status === "error" ? <a className="btn btn-secondary" href="/portal">Volver al portal</a> : null}
      </section>
    </main>
  );
}

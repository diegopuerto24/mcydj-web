"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";

const ROLES = {
  director: "Director General",
  admin: "Administrador",
  consultor: "Consultor",
  auxiliar: "Auxiliar"
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function toReservation(row) {
  return {
    id: row.id,
    userId: row.user_id,
    user: row.created_by_email || "Usuario MC&DJ",
    email: row.created_by_email || "",
    date: row.fecha,
    start: String(row.hora_inicio || "").slice(0, 5),
    end: String(row.hora_fin || "").slice(0, 5),
    status: row.estado === "cancelada" ? "Cancelada" : "Confirmada",
    notes: row.notas || ""
  };
}

function toLog(row) {
  return {
    id: row.id,
    date: String(row.created_at || "").slice(0, 10),
    action: row.accion,
    detail: row.detalle || "",
    email: row.user_email || ""
  };
}

function StatCard({ label, value, hint }) {
  return (
    <article className="portalCard statCard">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function PortalPage() {
  const [active, setActive] = useState("agenda");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState("Conectando agenda NOMIPAQ...");
  const [loginForm, setLoginForm] = useState({ email: "conecta@mcydj.mx", password: "" });
  const [form, setForm] = useState({
    date: todayISO(),
    start: "08:00",
    end: "09:00",
    notes: ""
  });

  const userEmail = session?.user?.email || "";
  const userName = profile?.nombre || userEmail || "Usuario MC&DJ";
  const role = profile?.rol || "consultor";
  const roleLabel = ROLES[role] || role;
  const canConfigure = role === "director" || role === "admin";

  async function loadProfile(email) {
    if (!supabase || !email) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,nombre,rol,activo")
      .eq("email", email)
      .eq("activo", true)
      .maybeSingle();

    if (error) {
      setMessage("No fue posible leer el perfil del usuario.");
      return null;
    }

    if (!data) {
      setMessage("El usuario existe en Authentication, pero no tiene perfil activo en profiles.");
      return null;
    }

    setProfile(data);
    return data;
  }

  async function loadReservations() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("reservations")
      .select("id,user_id,fecha,hora_inicio,hora_fin,estado,notas,created_by_email,created_at,updated_at")
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true });

    if (error) {
      setMessage("No fue posible leer reservas desde Supabase.");
      return;
    }

    setReservations((data || []).map(toReservation));
  }

  async function loadLogs() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("reservation_logs")
      .select("id,reservation_id,accion,detalle,created_at,user_email")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      setMessage("No fue posible leer historial desde Supabase.");
      return;
    }

    setLogs((data || []).map(toLog));
  }

  async function reloadData() {
    await Promise.all([loadReservations(), loadLogs()]);
  }

  useEffect(() => {
    async function boot() {
      if (!isSupabaseConfigured || !supabase) {
        setMessage("Supabase no esta configurado. Revisa variables de entorno en Vercel.");
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session || null;
      setSession(currentSession);

      if (currentSession?.user?.email) {
        await loadProfile(currentSession.user.email);
        await reloadData();
        setMessage("Agenda NOMIPAQ conectada a Supabase.");
      } else {
        setMessage("Inicia sesion para usar la Agenda NOMIPAQ.");
      }

      setLoading(false);
    }

    boot();

    if (!supabase) return undefined;
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.email) {
        await loadProfile(newSession.user.email);
        await reloadData();
        setMessage("Sesion activa. Agenda conectada.");
      } else {
        setProfile(null);
        setReservations([]);
        setLogs([]);
        setMessage("Sesion cerrada.");
      }
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  const todayReservations = useMemo(
    () => reservations.filter((r) => r.status === "Confirmada" && r.date === todayISO()),
    [reservations]
  );

  const nextReservations = useMemo(
    () => reservations
      .filter((r) => r.status === "Confirmada")
      .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)),
    [reservations]
  );

  function resetForm() {
    setEditingId(null);
    setForm({ date: todayISO(), start: "08:00", end: "09:00", notes: "" });
  }

  async function addLog(reservationId, action, detail) {
    if (!supabase) return;
    await supabase.from("reservation_logs").insert({
      reservation_id: reservationId,
      accion: action,
      detalle: detail,
      user_email: userEmail
    });
    await loadLogs();
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email.trim(),
      password: loginForm.password
    });
    if (error) setMessage(`No se pudo iniciar sesion: ${error.message}`);
    setAuthLoading(false);
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!session || !profile) {
      setMessage("Debes iniciar sesion para reservar NOMIPAQ.");
      return;
    }

    if (!form.date || !form.start || !form.end) {
      setMessage("Completa fecha, hora de inicio y hora de fin.");
      return;
    }

    if (form.start >= form.end) {
      setMessage("La hora de inicio debe ser menor que la hora de fin.");
      return;
    }

    const conflict = reservations.find(
      (reservation) =>
        reservation.status === "Confirmada" &&
        reservation.date === form.date &&
        reservation.id !== editingId &&
        overlaps(form.start, form.end, reservation.start, reservation.end)
    );

    if (conflict) {
      setMessage(`Horario no disponible. Ya existe reserva de ${conflict.start} a ${conflict.end} para ${conflict.user}.`);
      return;
    }

    if (!supabase) return;

    if (editingId) {
      const { error } = await supabase
        .from("reservations")
        .update({
          fecha: form.date,
          hora_inicio: form.start,
          hora_fin: form.end,
          notas: form.notes || null,
          estado: "confirmada",
          updated_at: new Date().toISOString()
        })
        .eq("id", editingId);

      if (error) {
        setMessage(`No se pudo reagendar: ${error.message}`);
        return;
      }

      await addLog(editingId, "Reserva reagendada", `${userName} movio NOMIPAQ al ${form.date} de ${form.start} a ${form.end}.`);
      await loadReservations();
      resetForm();
      setMessage("Reserva reagendada correctamente.");
      return;
    }

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        user_id: profile.id,
        fecha: form.date,
        hora_inicio: form.start,
        hora_fin: form.end,
        estado: "confirmada",
        notas: form.notes || null,
        created_by_email: userEmail
      })
      .select("id")
      .single();

    if (error) {
      setMessage(`No se pudo crear la reserva: ${error.message}`);
      return;
    }

    await addLog(data.id, "Reserva creada", `${userName} reservo NOMIPAQ el ${form.date} de ${form.start} a ${form.end}.`);
    await loadReservations();
    resetForm();
    setMessage("Reserva creada correctamente.");
  }

  function editReservation(reservation) {
    setEditingId(reservation.id);
    setForm({
      date: reservation.date,
      start: reservation.start,
      end: reservation.end,
      notes: reservation.notes || ""
    });
    setActive("agenda");
    setMessage("Edita los datos y guarda para reagendar.");
  }

  async function cancelReservation(reservation) {
    if (!supabase) return;
    const { error } = await supabase
      .from("reservations")
      .update({ estado: "cancelada", updated_at: new Date().toISOString() })
      .eq("id", reservation.id);

    if (error) {
      setMessage(`No se pudo cancelar: ${error.message}`);
      return;
    }

    await addLog(reservation.id, "Reserva cancelada", `${userName} cancelo NOMIPAQ el ${reservation.date} de ${reservation.start} a ${reservation.end}.`);
    await loadReservations();
    setMessage("Reserva cancelada correctamente.");
  }

  if (loading) {
    return (
      <div className="portalShell">
        <main className="portalMain">
          <section className="portalCard emptyState">
            <h1>Cargando ERP MC&amp;DJ...</h1>
            <p>{message}</p>
          </section>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="portalShell">
        <section className="portalMain">
          <form className="portalCard reservationForm" onSubmit={handleLogin} style={{ maxWidth: 520, margin: "48px auto" }}>
            <div className="sectionTitle">
              <h1>MC&amp;DJ ERP</h1>
              <p>Inicia sesion para usar la Agenda NOMIPAQ.</p>
            </div>
            <section className="notice">{message}</section>
            <Field label="Correo">
              <input type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} />
            </Field>
            <Field label="Contrasena">
              <input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} />
            </Field>
            <button className="btn btn-primary" type="submit" disabled={authLoading}>
              {authLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="portalShell">
      <aside className="portalSidebar">
        <a className="portalBrand" href="/portal">
          <strong>MC&amp;DJ ERP</strong>
          <span>Sistema interno</span>
        </a>
        <nav className="portalNav" aria-label="Menu del portal">
          <button className={active === "dashboard" ? "active" : ""} onClick={() => setActive("dashboard")}>Dashboard</button>
          <button className={active === "agenda" ? "active" : ""} onClick={() => setActive("agenda")}>Agenda NOMIPAQ</button>
          <a href="/portal/herramientas">Herramientas</a>
          <button className={active === "clientes" ? "active" : ""} onClick={() => setActive("clientes")}>Clientes</button>
          <button className={active === "proyectos" ? "active" : ""} onClick={() => setActive("proyectos")}>Proyectos</button>
          {canConfigure ? <button className={active === "config" ? "active" : ""} onClick={() => setActive("config")}>Configuracion</button> : null}
        </nav>
      </aside>

      <main className="portalMain">
        <header className="portalTopbar portalTopbarBlue">
          <div>
            <p>ERP MC&amp;DJ</p>
            <h1>{active === "agenda" ? "Agenda NOMIPAQ" : "Dashboard inicial"}</h1>
          </div>
          <div className="roleBox">
            <span>{userName}</span>
            <strong>{roleLabel}</strong>
            <button type="button" onClick={handleLogout}>Cerrar sesion</button>
          </div>
        </header>

        <section className="notice noticeBlue">{message}</section>

        {active === "dashboard" ? (
          <section className="portalGrid">
            <StatCard label="Reservas de hoy" value={todayReservations.length} hint="Uso confirmado de NOMIPAQ" />
            <StatCard label="Usuarios objetivo" value="19" hint="Colaboradores del despacho" />
            <StatCard label="Reservas activas" value={nextReservations.length} hint="Agenda real en Supabase" />
            <StatCard label="Estado" value="Produccion" hint="Login y reservas reales" />
          </section>
        ) : null}

        {active === "agenda" ? (
          <section className="agendaLayout">
            <form className="portalCard reservationForm" onSubmit={handleSubmit}>
              <div className="sectionTitle">
                <h2>{editingId ? "Reagendar reserva" : "Nueva reserva"}</h2>
                <p>El sistema bloquea horarios empalmados para una sola licencia.</p>
              </div>
              <Field label="Usuario">
                <input value={userName} readOnly />
              </Field>
              <Field label="Correo">
                <input type="email" value={userEmail} readOnly />
              </Field>
              <Field label="Fecha">
                <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              </Field>
              <div className="timeGrid">
                <Field label="Inicio">
                  <input type="time" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} />
                </Field>
                <Field label="Fin">
                  <input type="time" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} />
                </Field>
              </div>
              <Field label="Notas">
                <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Actividad a realizar" rows={3} />
              </Field>
              <div className="formActions">
                <button className="btn btn-primary" type="submit">{editingId ? "Guardar cambio" : "Reservar"}</button>
                {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancelar edicion</button> : null}
              </div>
            </form>

            <div className="portalCard tableCard">
              <div className="sectionTitle">
                <h2>Reservas activas</h2>
                <p>Una sola licencia disponible. No se permiten empalmes.</p>
              </div>
              <div className="reservationList">
                {nextReservations.length ? nextReservations.map((reservation) => (
                  <article className="reservationItem" key={reservation.id}>
                    <div>
                      <strong>{reservation.date} - {reservation.start} a {reservation.end}</strong>
                      <span>{reservation.user} - {reservation.email}</span>
                      {reservation.notes ? <small>{reservation.notes}</small> : null}
                    </div>
                    <div className="reservationActions">
                      <button type="button" onClick={() => editReservation(reservation)}>Reagendar</button>
                      <button type="button" onClick={() => cancelReservation(reservation)}>Cancelar</button>
                    </div>
                  </article>
                )) : <p>No hay reservas activas.</p>}
              </div>
            </div>

            <div className="portalCard logCard">
              <div className="sectionTitle">
                <h2>Historial</h2>
                <p>Bitacora operativa para auditoria interna.</p>
              </div>
              <div className="logList">
                {logs.length ? logs.map((log) => (
                  <div key={log.id}>
                    <strong>{log.action}</strong>
                    <span>{log.date} - {log.detail}</span>
                  </div>
                )) : <p>No hay historial todavia.</p>}
              </div>
            </div>
          </section>
        ) : null}

        {!["dashboard", "agenda"].includes(active) ? (
          <section className="portalCard emptyState">
            <h2>Modulo en preparacion</h2>
            <p>Este espacio queda reservado para integrar {active}.</p>
          </section>
        ) : null}
      </main>
    </div>
  );
}

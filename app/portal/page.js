"use client";

import { useMemo, useState } from "react";

const ROLES = {
  director: "Director General",
  admin: "Administrador",
  consultor: "Consultor",
  auxiliar: "Auxiliar"
};

const INITIAL_RESERVATIONS = [
  {
    id: 1,
    user: "Dirección General",
    email: "conecta@mcydj.mx",
    date: "2026-05-29",
    start: "09:00",
    end: "11:00",
    status: "Confirmada",
    notes: "Carga inicial de prueba"
  },
  {
    id: 2,
    user: "Área Fiscal",
    email: "fiscal@mcydj.mx",
    date: "2026-05-29",
    start: "12:00",
    end: "14:00",
    status: "Confirmada",
    notes: "Procesamiento de nómina"
  }
];

const INITIAL_LOGS = [
  {
    id: 1,
    date: "2026-05-29",
    action: "Reserva creada",
    detail: "Dirección General reservó NOMIPAQ de 09:00 a 11:00."
  },
  {
    id: 2,
    date: "2026-05-29",
    action: "Reserva creada",
    detail: "Área Fiscal reservó NOMIPAQ de 12:00 a 14:00."
  }
];

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
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
  const [role, setRole] = useState("director");
  const [active, setActive] = useState("agenda");
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("MVP local: pendiente conexión a Supabase Auth, PostgreSQL y Resend.");
  const [form, setForm] = useState({
    user: "",
    email: "",
    date: "2026-05-29",
    start: "08:00",
    end: "09:00",
    notes: ""
  });

  const todayReservations = useMemo(
    () => reservations.filter((r) => r.status === "Confirmada" && r.date === "2026-05-29"),
    [reservations]
  );

  const nextReservations = useMemo(
    () => reservations.filter((r) => r.status === "Confirmada").sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)),
    [reservations]
  );

  const canConfigure = role === "director" || role === "admin";

  function resetForm() {
    setEditingId(null);
    setForm({ user: "", email: "", date: "2026-05-29", start: "08:00", end: "09:00", notes: "" });
  }

  function addLog(action, detail) {
    setLogs((current) => [
      { id: Date.now(), date: new Date().toISOString().slice(0, 10), action, detail },
      ...current
    ]);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.user || !form.email || !form.date || !form.start || !form.end) {
      setMessage("Completa usuario, correo, fecha, hora de inicio y hora de fin.");
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

    if (editingId) {
      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === editingId
            ? { ...reservation, ...form, status: "Confirmada" }
            : reservation
        )
      );
      addLog("Reserva reagendada", `${form.user} movió NOMIPAQ al ${form.date} de ${form.start} a ${form.end}.`);
      setMessage("Reserva reagendada correctamente. Falta activar correo automático con Resend.");
      resetForm();
      return;
    }

    const newReservation = {
      id: Date.now(),
      ...form,
      status: "Confirmada"
    };

    setReservations((current) => [newReservation, ...current]);
    addLog("Reserva creada", `${form.user} reservó NOMIPAQ el ${form.date} de ${form.start} a ${form.end}.`);
    setMessage("Reserva creada correctamente. Falta activar correo automático con Resend.");
    resetForm();
  }

  function editReservation(reservation) {
    setEditingId(reservation.id);
    setForm({
      user: reservation.user,
      email: reservation.email,
      date: reservation.date,
      start: reservation.start,
      end: reservation.end,
      notes: reservation.notes || ""
    });
    setActive("agenda");
    setMessage("Edita los datos y guarda para reagendar.");
  }

  function cancelReservation(reservation) {
    setReservations((current) =>
      current.map((item) => (item.id === reservation.id ? { ...item, status: "Cancelada" } : item))
    );
    addLog("Reserva cancelada", `${reservation.user} canceló NOMIPAQ el ${reservation.date} de ${reservation.start} a ${reservation.end}.`);
    setMessage("Reserva cancelada. Falta activar notificación automática con Resend.");
  }

  return (
    <div className="portalShell">
      <aside className="portalSidebar">
        <a className="portalBrand" href="/">
          <strong>MC&amp;DJ</strong>
          <span>Portal interno</span>
        </a>

        <nav className="portalNav" aria-label="Menú del portal">
          <button className={active === "dashboard" ? "active" : ""} onClick={() => setActive("dashboard")}>Dashboard</button>
          <button className={active === "agenda" ? "active" : ""} onClick={() => setActive("agenda")}>Agenda NOMIPAQ</button>
          <button className={active === "herramientas" ? "active" : ""} onClick={() => setActive("herramientas")}>Herramientas</button>
          <button className={active === "clientes" ? "active" : ""} onClick={() => setActive("clientes")}>Clientes</button>
          <button className={active === "proyectos" ? "active" : ""} onClick={() => setActive("proyectos")}>Proyectos</button>
          {canConfigure ? <button className={active === "config" ? "active" : ""} onClick={() => setActive("config")}>Configuración</button> : null}
        </nav>
      </aside>

      <main className="portalMain">
        <header className="portalTopbar">
          <div>
            <p>ERP MC&amp;DJ</p>
            <h1>{active === "agenda" ? "Agenda NOMIPAQ" : "Dashboard inicial"}</h1>
          </div>

          <div className="roleBox">
            <span>Rol de prueba</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {Object.entries(ROLES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </header>

        <section className="notice">{message}</section>

        {active === "dashboard" ? (
          <section className="portalGrid">
            <StatCard label="Reservas de hoy" value={todayReservations.length} hint="Uso confirmado de NOMIPAQ" />
            <StatCard label="Usuarios objetivo" value="19" hint="Colaboradores del despacho" />
            <StatCard label="Módulos" value="6" hint="Base inicial del ERP" />
            <StatCard label="Estado" value="MVP" hint="Listo para conectar Supabase" />
          </section>
        ) : null}

        {active === "agenda" ? (
          <section className="agendaLayout">
            <form className="portalCard reservationForm" onSubmit={handleSubmit}>
              <div className="sectionTitle">
                <h2>{editingId ? "Reagendar reserva" : "Nueva reserva"}</h2>
                <p>El sistema bloquea automáticamente horarios empalmados.</p>
              </div>

              <Field label="Usuario">
                <input value={form.user} onChange={(event) => setForm({ ...form, user: event.target.value })} placeholder="Nombre o área" />
              </Field>
              <Field label="Correo">
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="usuario@mcydj.mx" />
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
                {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancelar edición</button> : null}
              </div>
            </form>

            <div className="portalCard tableCard">
              <div className="sectionTitle">
                <h2>Reservas activas</h2>
                <p>Una sola licencia disponible. No se permiten empalmes.</p>
              </div>

              <div className="reservationList">
                {nextReservations.map((reservation) => (
                  <article className="reservationItem" key={reservation.id}>
                    <div>
                      <strong>{reservation.date} · {reservation.start} - {reservation.end}</strong>
                      <span>{reservation.user} · {reservation.email}</span>
                      {reservation.notes ? <small>{reservation.notes}</small> : null}
                    </div>
                    <div className="reservationActions">
                      <button type="button" onClick={() => editReservation(reservation)}>Reagendar</button>
                      <button type="button" onClick={() => cancelReservation(reservation)}>Cancelar</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="portalCard logCard">
              <div className="sectionTitle">
                <h2>Historial</h2>
                <p>Bitácora operativa para auditoría interna.</p>
              </div>
              <div className="logList">
                {logs.map((log) => (
                  <div key={log.id}>
                    <strong>{log.action}</strong>
                    <span>{log.date} · {log.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {!["dashboard", "agenda"].includes(active) ? (
          <section className="portalCard emptyState">
            <h2>Módulo en preparación</h2>
            <p>Este espacio queda reservado para integrar {active}: clientes, proyectos, expedientes, herramientas y configuración.</p>
          </section>
        ) : null}
      </main>
    </div>
  );
}

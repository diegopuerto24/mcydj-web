"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";

const REASONS = ["Procesamiento de nómina", "Cálculo y revisión", "Carga de información", "Emisión de reportes", "Corrección de incidencias", "Otro"];
const MIN_DURATION_MINUTES = 30;
const MAX_DURATION_MINUTES = 240;
const MIN_ADVANCE_MINUTES = 5;

function todayISO() { return new Date().toISOString().slice(0, 10); }
function nowHHMM() { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
function toMinutes(time) { const [h, m] = String(time || "00:00").split(":").map(Number); return h * 60 + m; }
function overlaps(aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd; }
function addDays(dateISO, days) { const d = new Date(`${dateISO}T12:00:00`); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function startOfWeek(dateISO) { const d = new Date(`${dateISO}T12:00:00`); const day = d.getDay() || 7; d.setDate(d.getDate() - day + 1); return d.toISOString().slice(0, 10); }
function displayDate(dateISO) { return new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(`${dateISO}T12:00:00`)); }
function areaClass(area) { return `area-${String(area || "general").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; }

function encodeNotes(area, reason, notes) {
  return `[[AREA:${area}]]\n[[MOTIVO:${reason}]]\n${notes || ""}`;
}

function decodeNotes(raw = "") {
  const area = raw.match(/\[\[AREA:(.*?)\]\]/)?.[1] || "General";
  const reason = raw.match(/\[\[MOTIVO:(.*?)\]\]/)?.[1] || "Uso de NOMIPAQ";
  const notes = raw.replace(/\[\[AREA:.*?\]\]\s*/s, "").replace(/\[\[MOTIVO:.*?\]\]\s*/s, "").trim();
  return { area, reason, notes };
}

function validateBooking(form) {
  const today = todayISO();
  const startMinutes = toMinutes(form.start);
  const endMinutes = toMinutes(form.end);
  const nowMinutes = toMinutes(nowHHMM());
  const duration = endMinutes - startMinutes;
  if (!form.date || !form.start || !form.end || !form.area || !form.reason) return "Completa fecha, horario, área y motivo.";
  if (form.date < today) return "No puedes reservar NOMIPAQ en una fecha pasada.";
  if (form.start >= form.end) return "La hora de inicio debe ser menor que la hora de fin.";
  if (duration < MIN_DURATION_MINUTES) return "La duración mínima es de 30 minutos.";
  if (duration > MAX_DURATION_MINUTES) return "La duración máxima es de 4 horas.";
  if (form.date === today && startMinutes <= nowMinutes) return "No puedes reservar un horario que ya inició o ya pasó.";
  if (form.date === today && startMinutes < nowMinutes + MIN_ADVANCE_MINUTES) return "Reserva con al menos 5 minutos de anticipación.";
  return "";
}

function canManageAgenda(role) {
  return ["director_general", "sistemas"].includes(role);
}

function mapReservation(row) {
  const parsed = decodeNotes(row.notas || "");
  return {
    id: row.id,
    userId: row.user_id,
    date: row.fecha,
    start: String(row.hora_inicio || "").slice(0, 5),
    end: String(row.hora_fin || "").slice(0, 5),
    status: row.estado === "cancelada" ? "Cancelada" : "Confirmada",
    email: row.created_by_email || "",
    user: row.created_by_email || "Usuario MC&DJ",
    ...parsed
  };
}

function Field({ label, children, error }) {
  return <label className="field"><span>{label}</span>{children}{error ? <small className="fieldError">{error}</small> : null}</label>;
}

function StatCard({ label, value, hint }) {
  return <article className="portalCard statCard"><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>;
}

function ReservationCard({ reservation, onEdit, onCancel }) {
  return (
    <article className={`reservationItem ${areaClass(reservation.area)}`}>
      <div>
        <strong>{reservation.date} · {reservation.start} - {reservation.end}</strong>
        <span>{reservation.area} · {reservation.reason}</span>
        <span>{reservation.email}</span>
        {reservation.notes ? <small>{reservation.notes}</small> : null}
      </div>
      <div className="reservationActions">
        <button type="button" onClick={() => onEdit(reservation)}>Reagendar</button>
        <button type="button" onClick={() => onCancel(reservation)}>Cancelar</button>
      </div>
    </article>
  );
}

export default function PortalPage() {
  const [active, setActive] = useState("agenda");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [areas, setAreas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState("Conectando agenda NOMIPAQ...");
  const [loginForm, setLoginForm] = useState({ email: "conecta@mcydj.mx", password: "" });
  const [viewMode, setViewMode] = useState("week");
  const [focusDate, setFocusDate] = useState(todayISO());
  const [filterEmail, setFilterEmail] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [form, setForm] = useState({ date: todayISO(), start: "08:00", end: "09:00", area: "", reason: REASONS[0], notes: "" });

  const userEmail = session?.user?.email || "";
  const userName = profile?.nombre || userEmail || "Usuario MC&DJ";
  const userId = profile?.id || session?.user?.id || null;
  const role = profile?.rol || "consultor";
  const roleLabel = roles.find((item) => item.code === role)?.name || role;
  const areaOptions = areas.map((area) => area.name);
  const canConfigure = ["director", "admin", "sistemas"].includes(role);
  const canUseAgendaAdmin = canManageAgenda(role);
  const formValidation = validateBooking(form);

  async function loadReservations(context = {}) {
    if (!supabase) return;
    const effectiveUserId = context.userId || userId;
    const effectiveRole = context.role || role;
    let query = supabase.from("reservations").select("id,user_id,fecha,hora_inicio,hora_fin,estado,notas,created_by_email,created_at,updated_at").order("fecha", { ascending: true }).order("hora_inicio", { ascending: true });
    if (!canManageAgenda(effectiveRole)) query = query.eq("user_id", effectiveUserId);
    const { data, error } = await query;
    if (error) { setMessage(`No fue posible leer reservas: ${error.message}`); return; }
    setReservations((data || []).map(mapReservation));
  }

  async function loadLogs() {
    if (!supabase) return;
    const { data } = await supabase.from("reservation_logs").select("id,reservation_id,accion,detalle,created_at").order("created_at", { ascending: false }).limit(30);
    setLogs((data || []).map((row) => ({ id: row.id, action: row.accion, detail: row.detalle || "", date: String(row.created_at || "").slice(0, 10) })));
  }

  async function loadCatalogs() {
    if (!supabase) return;
    const [{ data: rolesData }, { data: areasData }] = await Promise.all([
      supabase.from("roles").select("id,code,name,level").eq("active", true).order("level", { ascending: true }),
      supabase.from("areas").select("id,code,name,sort_order").eq("active", true).order("sort_order", { ascending: true })
    ]);
    setRoles(rolesData || []);
    setAreas(areasData || []);
    setForm((current) => ({ ...current, area: current.area || areasData?.[0]?.name || "" }));
  }

  async function reloadData(context = {}) { await Promise.all([loadReservations(context), loadLogs(), loadCatalogs()]); }

  useEffect(() => {
    async function boot() {
      if (!isSupabaseConfigured || !supabase) { setMessage("Supabase no está configurado."); setLoading(false); return; }
      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session || null;
      setSession(currentSession);
      if (currentSession?.user?.email) {
        const { data: profileData } = await supabase.from("profiles").select("id,email,nombre,rol,activo").eq("email", currentSession.user.email).maybeSingle();
        const currentProfile = profileData || { id: currentSession.user.id, email: currentSession.user.email, nombre: currentSession.user.email, rol: "consultor", activo: true };
        setProfile(currentProfile);
        await reloadData({ userId: currentProfile.id, role: currentProfile.rol });
        setMessage("Sesión activa. Agenda conectada.");
      } else setMessage("Inicia sesión para usar la Agenda NOMIPAQ.");
      setLoading(false);
    }
    boot();
    const { data: listener } = supabase?.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.email) {
        const { data: profileData } = await supabase.from("profiles").select("id,email,nombre,rol,activo").eq("email", newSession.user.email).maybeSingle();
        const currentProfile = profileData || { id: newSession.user.id, email: newSession.user.email, nombre: newSession.user.email, rol: "consultor", activo: true };
        setProfile(currentProfile);
        await reloadData({ userId: currentProfile.id, role: currentProfile.rol });
        setMessage("Sesión activa. Agenda conectada.");
      }
      else { setProfile(null); setReservations([]); setLogs([]); }
    }) || { data: null };
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  const activeReservations = useMemo(() => reservations.filter((r) => r.status === "Confirmada"), [reservations]);
  const filteredReservations = useMemo(() => activeReservations.filter((r) => (!filterEmail || r.email === filterEmail) && (!filterArea || r.area === filterArea)), [activeReservations, filterEmail, filterArea]);
  const uniqueEmails = useMemo(() => [...new Set(activeReservations.map((r) => r.email).filter(Boolean))].sort(), [activeReservations]);
  const weekStart = startOfWeek(focusDate);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const visibleReservations = useMemo(() => viewMode === "day" ? filteredReservations.filter((r) => r.date === focusDate) : filteredReservations.filter((r) => r.date >= weekDays[0] && r.date <= weekDays[6]), [filteredReservations, viewMode, focusDate, weekDays]);
  const totalHours = useMemo(() => activeReservations.reduce((sum, r) => sum + (toMinutes(r.end) - toMinutes(r.start)) / 60, 0), [activeReservations]);

  function resetForm() { setEditingId(null); setForm({ date: todayISO(), start: "08:00", end: "09:00", area: areaOptions[0] || "", reason: REASONS[0], notes: "" }); }

  async function addLog(reservationId, action, detail) {
    const { error } = await supabase.from("reservation_logs").insert({ reservation_id: reservationId, accion: action, detalle: detail, user_email: userEmail });
    if (!error) await loadLogs();
  }

  async function notify(action, reservation) {
    try {
      await fetch("/api/agenda/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, email: userEmail, user: userName, date: reservation.date, start: reservation.start, end: reservation.end, area: reservation.area, reason: reservation.reason, notes: reservation.notes }) });
    } catch (_) {}
  }

  async function handleLogin(event) {
    event.preventDefault(); setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginForm.email.trim(), password: loginForm.password });
    if (error) setMessage(`No se pudo iniciar sesión: ${error.message}`);
    setAuthLoading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (formValidation) { setMessage(formValidation); return; }
    const conflict = activeReservations.find((r) => r.date === form.date && r.id !== editingId && overlaps(form.start, form.end, r.start, r.end));
    if (conflict) { setMessage(`Horario no disponible. Ya existe reserva de ${conflict.start} a ${conflict.end} para ${conflict.email}.`); return; }
    const notas = encodeNotes(form.area, form.reason, form.notes);
    if (editingId) {
      const reservation = activeReservations.find((item) => item.id === editingId);
      if (!canUseAgendaAdmin && reservation?.userId !== userId) { setMessage("No puedes modificar reservas de otro usuario."); return; }
      let updateQuery = supabase.from("reservations").update({ fecha: form.date, hora_inicio: form.start, hora_fin: form.end, notas, updated_at: new Date().toISOString(), updated_by_email: userEmail }).eq("id", editingId);
      if (!canUseAgendaAdmin) updateQuery = updateQuery.eq("user_id", userId);
      const { error } = await updateQuery;
      if (error) { setMessage(`No se pudo reagendar: ${error.message}`); return; }
      await addLog(editingId, "Reserva reagendada", `${userName} movió NOMIPAQ al ${form.date} de ${form.start} a ${form.end}.`);
      await notify("updated", form); await loadReservations(); resetForm(); setMessage("Reserva reagendada correctamente."); return;
    }
    const authenticatedUserId = userId || session.user.id;
    const { data, error } = await supabase.from("reservations").insert({ user_id: authenticatedUserId, fecha: form.date, hora_inicio: form.start, hora_fin: form.end, estado: "confirmada", notas, created_by_email: userEmail }).select("id").single();
    if (error) { setMessage(`No se pudo crear la reserva: ${error.message}`); return; }
    await addLog(data.id, "Reserva creada", `${userName} reservó NOMIPAQ el ${form.date} de ${form.start} a ${form.end}.`);
    await notify("created", form); await loadReservations(); resetForm(); setMessage("Reserva creada correctamente.");
  }

  function editReservation(r) { setEditingId(r.id); setForm({ date: r.date, start: r.start, end: r.end, area: r.area, reason: r.reason, notes: r.notes }); setFocusDate(r.date); setMessage("Edita los datos y guarda para reagendar."); }

  async function cancelReservation(r) {
    if (!canUseAgendaAdmin && r.userId !== userId) { setMessage("No puedes cancelar reservas de otro usuario."); return; }
    let cancelQuery = supabase.from("reservations").update({ estado: "cancelada", cancelled_at: new Date().toISOString(), cancelled_by_email: userEmail, updated_at: new Date().toISOString() }).eq("id", r.id);
    if (!canUseAgendaAdmin) cancelQuery = cancelQuery.eq("user_id", userId);
    const { error } = await cancelQuery;
    if (error) { setMessage(`No se pudo cancelar: ${error.message}`); return; }
    await addLog(r.id, "Reserva cancelada", `${userName} canceló NOMIPAQ el ${r.date} de ${r.start} a ${r.end}.`);
    await notify("cancelled", r); await loadReservations(); setMessage("Reserva cancelada correctamente.");
  }

  function exportCSV() {
    const rows = [["Fecha", "Inicio", "Fin", "Usuario", "Área", "Motivo", "Notas"], ...visibleReservations.map((r) => [r.date, r.start, r.end, r.email, r.area, r.reason, r.notes])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `agenda-nomipaq-${focusDate}.csv`; link.click(); URL.revokeObjectURL(link.href);
  }

  if (loading) return <main className="portalMain"><section className="portalCard emptyState"><h1>Cargando ERP MC&amp;DJ...</h1></section></main>;
  if (!session) return <main className="portalShell"><section className="portalMain"><form className="portalCard reservationForm" onSubmit={handleLogin} style={{ maxWidth: 520, margin: "48px auto" }}><div className="sectionTitle"><h1>MC&amp;DJ ERP</h1><p>Inicia sesión para usar la Agenda NOMIPAQ.</p></div><section className="notice">{message}</section><Field label="Correo"><input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} /></Field><Field label="Contraseña"><input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} /></Field><button className="btn btn-primary" disabled={authLoading}>{authLoading ? "Entrando..." : "Entrar"}</button></form></section></main>;

  return <div className="portalShell">
    <aside className="portalSidebar"><a className="portalBrand" href="/portal"><strong>MC&amp;DJ ERP</strong><span>Sistema interno</span></a><nav className="portalNav"><button className={active === "dashboard" ? "active" : ""} onClick={() => setActive("dashboard")}>Dashboard</button><button className={active === "agenda" ? "active" : ""} onClick={() => setActive("agenda")}>Agenda NOMIPAQ</button><a href="/portal/herramientas">Herramientas</a><button onClick={() => setActive("clientes")}>Clientes</button><button onClick={() => setActive("proyectos")}>Proyectos</button>{canConfigure ? <a href="/portal/configuracion/usuarios">Configuración · Usuarios</a> : null}</nav></aside>
    <main className="portalMain">
      <header className="portalTopbar portalTopbarBlue"><div><p>ERP MC&amp;DJ</p><h1>{active === "agenda" ? "Agenda NOMIPAQ" : "Dashboard"}</h1></div><div className="roleBox"><span>{userEmail}</span><strong>{roleLabel}</strong><button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button></div></header>
      <section className="notice noticeBlue">{message}</section>
      {active === "dashboard" ? <section className="portalGrid"><StatCard label="Reservas activas" value={activeReservations.length} hint="Agenda real" /><StatCard label="Horas reservadas" value={totalHours.toFixed(1)} hint="Acumulado" /><StatCard label="Usuarios" value={uniqueEmails.length} hint="Con reservas" /><StatCard label="Herramientas" value="5" hint="Catálogo inicial" /></section> : null}
      {active === "agenda" ? <>
        <section className="agendaToolbar portalCard">
          <div className="viewSwitch"><button className={viewMode === "day" ? "active" : ""} onClick={() => setViewMode("day")}>Día</button><button className={viewMode === "week" ? "active" : ""} onClick={() => setViewMode("week")}>Semana</button></div>
          <input type="date" value={focusDate} onChange={(e) => setFocusDate(e.target.value)} />
          <select value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)}><option value="">Todos los usuarios</option>{uniqueEmails.map((email) => <option key={email}>{email}</option>)}</select>
          <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)}><option value="">Todas las áreas</option>{areaOptions.map((area) => <option key={area}>{area}</option>)}</select>
          <button className="btn btn-secondary" onClick={exportCSV}>Exportar CSV</button>
        </section>
        <section className="agendaLayout">
          <form className="portalCard reservationForm" onSubmit={handleSubmit}><div className="sectionTitle"><h2>{editingId ? "Reagendar reserva" : "Nueva reserva"}</h2><p>Bloqueo automático de empalmes.</p></div><Field label="Usuario"><input value={userName} readOnly /></Field><Field label="Fecha"><input type="date" min={todayISO()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field><div className="timeGrid"><Field label="Inicio"><input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field><Field label="Fin"><input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field></div><Field label="Área"><select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>{areaOptions.map((area) => <option key={area}>{area}</option>)}</select></Field><Field label="Motivo"><select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>{REASONS.map((reason) => <option key={reason}>{reason}</option>)}</select></Field><Field label="Notas"><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>{formValidation ? <section className="notice">{formValidation}</section> : null}<div className="formActions"><button className="btn btn-primary" disabled={Boolean(formValidation)}>{editingId ? "Guardar cambio" : "Reservar"}</button>{editingId ? <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancelar edición</button> : null}</div></form>
          <div className="portalCard calendarCard">
            {viewMode === "day" ? <div className="dayView"><div className="calendarHeading"><h2>{displayDate(focusDate)}</h2><span>{visibleReservations.length} reservas</span></div>{visibleReservations.length ? visibleReservations.map((r) => <ReservationCard key={r.id} reservation={r} onEdit={editReservation} onCancel={cancelReservation} />) : <p>No hay reservas para este día.</p>}</div> : <div className="weekView">{weekDays.map((day) => <section className="weekDay" key={day}><header><strong>{displayDate(day)}</strong><span>{filteredReservations.filter((r) => r.date === day).length}</span></header><div>{filteredReservations.filter((r) => r.date === day).map((r) => <ReservationCard key={r.id} reservation={r} onEdit={editReservation} onCancel={cancelReservation} />)}{!filteredReservations.some((r) => r.date === day) ? <small>Disponible</small> : null}</div></section>)}</div>}
          </div>
          <div className="portalCard logCard"><div className="sectionTitle"><h2>Historial</h2></div><div className="logList">{logs.map((log) => <div key={log.id}><strong>{log.action}</strong><span>{log.date} · {log.detail}</span></div>)}</div></div>
        </section>
      </> : null}
      {!["dashboard", "agenda"].includes(active) ? <section className="portalCard emptyState"><h2>Módulo en preparación</h2></section> : null}
    </main>
  </div>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../../../../lib/supabaseClient";

const EMPTY_FORM = { first_name: "", last_name: "", corporate_email: "", personal_email: "", area_id: "", position: "", role_id: "", hire_date: "", phone: "", extension: "" };

function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function fullName(user) { return user?.employees ? `${user.employees.first_name || ""} ${user.employees.last_name || ""}`.trim() : user?.nombre || ""; }

export default function UsersAdminPage() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Cargando usuarios...");
  const [error, setError] = useState("");

  async function api(actionBody) {
    const token = session?.access_token;
    if (!token) throw new Error("Sesión no disponible.");
    const response = await fetch("/api/admin/users", { method: actionBody ? "POST" : "GET", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: actionBody ? JSON.stringify(actionBody) : undefined });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "No fue posible completar la operación.");
    return payload;
  }

  async function loadUsers(currentSession = session) {
    if (!currentSession?.access_token) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${currentSession.access_token}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "No fue posible cargar usuarios.");
      setUsers(payload.users || []); setRoles(payload.roles || []); setAreas(payload.areas || []);
      setMessage("Usuarios sincronizados con Supabase.");
    } catch (err) { setError(err.message); setMessage("Revisa permisos administrativos o configuración del servidor."); }
    setLoading(false);
  }

  useEffect(() => {
    async function boot() {
      if (!isSupabaseConfigured || !supabase) { setError("Supabase no está configurado."); setLoading(false); return; }
      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session || null;
      setSession(currentSession);
      if (currentSession) await loadUsers(currentSession); else { setError("Inicia sesión en /portal antes de administrar usuarios."); setLoading(false); }
    }
    boot();
  }, []);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const text = `${fullName(user)} ${user.email} ${user.personal_email || ""} ${user.employees?.position || ""}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!roleFilter || user.role_id === roleFilter) && (!areaFilter || user.area_id === areaFilter) && (activeFilter === "all" || String(Boolean(user.activo)) === activeFilter);
  }), [users, query, roleFilter, areaFilter, activeFilter]);

  async function handleCreate(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("Creando colaborador e invitación...");
    try { await api({ action: "create", ...form }); setForm(EMPTY_FORM); setMessage("Colaborador creado. Invitación enviada al correo personal."); await loadUsers(); }
    catch (err) { setError(err.message); setMessage("No se pudo crear el usuario."); }
    setSaving(false);
  }

  async function runAction(body, success) {
    setSaving(true); setError(""); setMessage("Procesando solicitud...");
    try { await api(body); setMessage(success); await loadUsers(); } catch (err) { setError(err.message); }
    setSaving(false);
  }

  return <div className="portalShell">
    <aside className="portalSidebar"><a className="portalBrand" href="/portal"><strong>MC&amp;DJ ERP</strong><span>Sistema interno</span></a><nav className="portalNav"><a href="/portal">Agenda NOMIPAQ</a><a className="active" href="/portal/configuracion/usuarios">Configuración · Usuarios</a></nav></aside>
    <main className="portalMain">
      <header className="portalTopbar portalTopbarBlue"><div><p>Configuración</p><h1>Usuarios</h1></div><a className="btn btn-secondary" href="/portal">Volver al portal</a></header>
      <section className={`notice ${error ? "noticeError" : "noticeBlue"}`}>{error || message}</section>
      <section className="usersAdminGrid">
        <form className="portalCard reservationForm" onSubmit={handleCreate}><div className="sectionTitle"><h2>Alta de colaborador</h2><p>Roles y áreas se cargan desde Supabase.</p></div>
          <div className="twoColumns"><Field label="Nombre"><input required value={form.first_name} onChange={(e)=>setForm({...form, first_name:e.target.value})}/></Field><Field label="Apellidos"><input required value={form.last_name} onChange={(e)=>setForm({...form, last_name:e.target.value})}/></Field></div>
          <Field label="Correo corporativo @mcydj.mx"><input required type="email" pattern=".+@mcydj\.mx" value={form.corporate_email} onChange={(e)=>setForm({...form, corporate_email:e.target.value})}/></Field>
          <Field label="Correo personal"><input required type="email" value={form.personal_email} onChange={(e)=>setForm({...form, personal_email:e.target.value})}/></Field>
          <div className="twoColumns"><Field label="Área"><select required value={form.area_id} onChange={(e)=>setForm({...form, area_id:e.target.value})}><option value="">Selecciona</option>{areas.map((a)=><option key={a.id} value={a.id}>{a.name}</option>)}</select></Field><Field label="Rol"><select required value={form.role_id} onChange={(e)=>setForm({...form, role_id:e.target.value})}><option value="">Selecciona</option>{roles.map((r)=><option key={r.id} value={r.id}>{r.name}</option>)}</select></Field></div>
          <Field label="Puesto"><input value={form.position} onChange={(e)=>setForm({...form, position:e.target.value})}/></Field>
          <div className="twoColumns"><Field label="Fecha de ingreso"><input type="date" value={form.hire_date} onChange={(e)=>setForm({...form, hire_date:e.target.value})}/></Field><Field label="Teléfono"><input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})}/></Field></div>
          <Field label="Extensión"><input value={form.extension} onChange={(e)=>setForm({...form, extension:e.target.value})}/></Field>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Guardando..." : "Crear y enviar invitación"}</button>
        </form>
        <section className="portalCard tableCard"><div className="sectionTitle"><h2>Directorio</h2><p>{filteredUsers.length} usuarios visibles.</p></div><div className="usersFilters"><input placeholder="Buscar por nombre, correo o puesto" value={query} onChange={(e)=>setQuery(e.target.value)}/><select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)}><option value="">Todos los roles</option>{roles.map((r)=><option key={r.id} value={r.id}>{r.name}</option>)}</select><select value={areaFilter} onChange={(e)=>setAreaFilter(e.target.value)}><option value="">Todas las áreas</option>{areas.map((a)=><option key={a.id} value={a.id}>{a.name}</option>)}</select><select value={activeFilter} onChange={(e)=>setActiveFilter(e.target.value)}><option value="all">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></div>
          {loading ? <p>Cargando...</p> : <div className="usersTable">{filteredUsers.map((user)=><article className="userRow" key={user.id}><div><strong>{fullName(user) || user.email}</strong><span>{user.email} · {user.roles?.name || user.rol}</span><small>{user.areas?.name || "Sin área"} · {user.employees?.position || "Sin puesto"}</small></div><div className="userActions"><span className={user.activo ? "statusPill active" : "statusPill"}>{user.activo ? "Activo" : "Inactivo"}</span><button onClick={()=>runAction({ action:"set_active", profile_id:user.id, active:!user.activo }, user.activo ? "Usuario desactivado." : "Usuario activado.")}>{user.activo ? "Desactivar" : "Activar"}</button><button onClick={()=>runAction({ action:"resend_invite", profile_id:user.id }, "Invitación reenviada.")}>Reenviar invitación</button></div></article>)}</div>}
        </section>
      </section>
    </main>
  </div>;
}

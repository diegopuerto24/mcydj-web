import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const portal = readFileSync("app/portal/page.js", "utf8");
const sharedRls = readFileSync("supabase/migrations/20260714_fix_nomipaq_shared_calendar.sql", "utf8");
const roleFix = readFileSync("supabase/migrations/20260714_fix_nomipaq_admin_roles.sql", "utf8");

const loadReservationsBlock = portal.match(/async function loadReservations\([^)]*\)[\s\S]*?setReservations\(\(data \|\| \[\]\)\.map\(mapReservation\)\);\n  \}/)?.[0] || "";
const updateBlock = portal.match(/let updateQuery[\s\S]*?const \{ error \} = await updateQuery;/)?.[0] || "";
const cancelBlock = portal.match(/let cancelQuery[\s\S]*?const \{ error \} = await cancelQuery;/)?.[0] || "";

assert.match(portal, /\["director", "director_general", "sistemas"\]\.includes\(role\)/, "director, director_general and sistemas use agenda admin mode");
assert.ok(!loadReservationsBlock.includes('.eq("user_id"'), "reservation SELECT loads the shared calendar for every authenticated user");
assert.match(loadReservationsBlock, /from\("reservations"\)\.select/, "initial reservation load queries reservations directly");
assert.equal((portal.match(/await hydratePortal\(data\?\.session \|\| null\)/g) || []).length, 1, "boot has a single initial hydratePortal call");
assert.match(portal, /if \(event === "INITIAL_SESSION"\) return;/, "auth listener ignores the initial session event to avoid duplicate hydration");
assert.match(portal, /setTimeout\(\(\) => \{[\s\S]*hydratePortal\(newSession\)/, "auth changes schedule hydration outside the callback");
assert.match(portal, /await reloadData\(\{ userId: currentProfile\.id, role: currentProfile\.rol \}\);/, "reloadData receives explicit user and role context");
assert.match(portal, /await reloadData\(\{ userId: currentProfile\.id, role: currentProfile\.rol \}\);\n    setMessage\("Sesión activa\. Agenda conectada\."\);/, "agenda is marked connected only after reloadData succeeds");
assert.match(portal, /const conflict = activeReservations\.find/, "overlap detection uses globally loaded active reservations");
assert.match(portal, /insert\(\{ user_id: authenticatedUserId,/, "new reservations store the authenticated profile/user id");
assert.match(portal, /reservation\?\.userId !== userId/, "normal users are blocked from editing reservations owned by others");
assert.match(updateBlock, /if \(!canUseAgendaAdmin\) updateQuery = updateQuery\.eq\("user_id", userId\)/, "normal-user updates are scoped by owner");
assert.match(cancelBlock, /if \(!canUseAgendaAdmin\) cancelQuery = cancelQuery\.eq\("user_id", userId\)/, "normal-user cancellations are scoped by owner");
assert.match(portal, /setMessage\("Cargando reservas\.\.\."\)/, "hydration shows an explicit loading-reservations message");
assert.match(portal, /viewMode === "month"/, "portal exposes the month view");
assert.match(portal, /setViewMode\("day"\)/, "clicking a month day switches to day view");

assert.match(sharedRls, /create policy reservations_user_select[\s\S]*?using \(true\)/, "RLS allows every authenticated user to read the shared reservations calendar");
assert.match(sharedRls, /create policy reservations_user_insert[\s\S]*?user_id = auth\.uid\(\)[\s\S]*?user_id = public\.current_profile_id\(\)/, "RLS inserts require the authenticated user id");
assert.match(sharedRls, /create policy reservations_user_update[\s\S]*?public\.can_manage_nomipaq_agenda\(\)[\s\S]*?user_id = auth\.uid\(\)[\s\S]*?user_id = public\.current_profile_id\(\)/, "RLS updates allow owners or agenda admins");
assert.match(sharedRls, /create policy reservations_user_delete[\s\S]*?public\.can_manage_nomipaq_agenda\(\)[\s\S]*?user_id = auth\.uid\(\)[\s\S]*?user_id = public\.current_profile_id\(\)/, "RLS deletes allow owners or agenda admins");
assert.match(sharedRls, /create policy reservation_logs_user_select[\s\S]*?exists \([\s\S]*?from public\.reservations r/, "reservation logs are readable when tied to a visible reservation");
assert.match(sharedRls, /create policy reservation_logs_user_insert[\s\S]*?public\.can_manage_nomipaq_agenda\(\)[\s\S]*?r\.user_id = auth\.uid\(\)/, "reservation log inserts require owner or admin");
assert.match(roleFix, /lower\(coalesce\(p\.rol, ''\)\) in \('director', 'director_general', 'sistemas'\)/, "role corrective migration allows all agenda admin roles");

function addDays(dateISO, days) {
  const d = new Date(`${dateISO}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function startOfWeek(dateISO) {
  const d = new Date(`${dateISO}T12:00:00`);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}
function buildMonthDays(dateISO) {
  const first = `${String(dateISO).slice(0, 7)}-01`;
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
const july2026 = buildMonthDays("2026-07-14");
assert.equal(july2026.length, 42, "month view always renders a six-week grid");
assert.equal(july2026[0], "2026-06-29", "month view starts on Monday of the first visible week");
assert.equal(july2026.at(-1), "2026-08-09", "month view ends on Sunday of the last visible week");
assert.ok(july2026.includes("2026-07-14"), "month view includes the focused month dates");

console.log("Agenda NOMIPAQ shared-calendar security checks passed.");

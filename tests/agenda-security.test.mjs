import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const portal = readFileSync("app/portal/page.js", "utf8");
const rls = readFileSync("supabase/migrations/20260714_nomipaq_reservations_rls.sql", "utf8");

assert.match(portal, /function canManageAgenda\(role\)/, "portal defines the agenda admin-role helper");
assert.match(portal, /\["director_general", "sistemas"\]\.includes\(role\)/, "only director_general and sistemas use agenda admin mode");
assert.match(portal, /query = query\.eq\("user_id", effectiveUserId\)/, "reservation list is scoped by user_id for non-admin users");
assert.match(portal, /insert\(\{ user_id: authenticatedUserId,/, "new reservations store the authenticated profile/user id");
assert.match(portal, /updateQuery = updateQuery\.eq\("user_id", userId\)/, "reservation updates are scoped by user_id for non-admin users");
assert.match(portal, /cancelQuery = cancelQuery\.eq\("user_id", userId\)/, "reservation cancellation is scoped by user_id for non-admin users");

assert.match(rls, /create or replace function public\.can_manage_nomipaq_agenda\(\)/, "RLS migration defines agenda admin helper");
assert.match(rls, /lower\(coalesce\(p\.rol, ''\)\) in \('director_general', 'sistemas'\)/, "RLS admin helper allows only director_general and sistemas");
assert.match(rls, /create policy reservations_user_select/, "RLS migration defines reservation select policy");
assert.match(rls, /create policy reservations_user_insert/, "RLS migration defines reservation insert policy");
assert.match(rls, /create policy reservations_user_update/, "RLS migration defines reservation update policy");
assert.match(rls, /create policy reservations_user_delete/, "RLS migration defines reservation delete policy");
assert.match(rls, /create policy reservation_logs_user_select/, "RLS migration defines reservation log select policy");

console.log("Agenda NOMIPAQ security checks passed.");

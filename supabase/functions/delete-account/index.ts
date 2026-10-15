import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return Response.json({ error: "Authentication required" }, { status: 401, headers: corsHeaders });
  let body: { confirmation?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders }); }
  if (body.confirmation !== "DELETE") return Response.json({ error: "Explicit DELETE confirmation required" }, { status: 400, headers: corsHeaders });
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceRoleKey) return Response.json({ error: "Deletion service is not configured" }, { status: 503, headers: corsHeaders });
  const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: { user }, error: userError } = await callerClient.auth.getUser();
  if (userError || !user) return Response.json({ error: "Invalid session" }, { status: 401, headers: corsHeaders });
  const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  // Prevent accidental lockout by refusing to delete the only SUPER_ADMIN account.
  const { data: roleRows, error: roleError } = await adminClient.from("user_roles").select("roles(name)").eq("user_id", user.id);
  if (roleError) return Response.json({ error: "Could not verify account roles; deletion was not performed" }, { status: 503, headers: corsHeaders });
  const isSuperAdmin = (roleRows ?? []).some((row: { roles?: { name?: string } | { name?: string }[] | null }) => {
    const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
    return role?.name === "SUPER_ADMIN";
  });
  if (isSuperAdmin) {
    const { count, error: countError } = await adminClient.from("user_roles").select("user_id, roles!inner(name)", { count: "exact", head: true }).eq("roles.name", "SUPER_ADMIN");
    if (countError || (count ?? 0) <= 1) return Response.json({ error: "The only SUPER_ADMIN account cannot be deleted. Assign another trusted SUPER_ADMIN first." }, { status: 409, headers: corsHeaders });
  }
  const { error: deletionError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deletionError) return Response.json({ error: "Account deletion failed", details: deletionError.message }, { status: 500, headers: corsHeaders });
  return Response.json({ deleted: true }, { status: 200, headers: corsHeaders });
});

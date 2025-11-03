import { cookies, headers } from "next/headers";

export async function GET() {
  const c = await cookies();
  const h = await headers();
  const hasCookie = c.get("__emu_authed")?.value || "0";
  const authz = h.get("authorization") || "";
  return new Response(JSON.stringify({
    ok: true,
    cookie: hasCookie,
    authHeader: authz.startsWith("Bearer ") ? "present" : "missing"
  }), { headers: { "content-type": "application/json" }});
}


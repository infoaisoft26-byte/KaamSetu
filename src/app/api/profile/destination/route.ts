import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await db.query(
    "SELECT role FROM public.user_roles r JOIN public.users u ON u.id=r.user_id WHERE u.auth_subject=$1 AND u.status='active'",
    [session.user.id],
  );
  const roles = new Set(result.rows.map((row: { role: string }) => row.role));
  const path = roles.has("super_admin") || roles.has("operations_admin") ? "/admin"
    : roles.has("provider_owner") || roles.has("provider_employee") ? "/provider/dashboard"
    : roles.has("customer") ? "/customer" : null;
  if (!path) return NextResponse.json({ error: "No active KaamSetu workspace is assigned to this account." }, { status: 403 });
  return NextResponse.json({ path });
}

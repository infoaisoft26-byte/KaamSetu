import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const role = body?.role;
  if (role !== "customer" && role !== "provider_owner") {
    return NextResponse.json({ error: "Invalid account type." }, { status: 400 });
  }

  const email = session.user.email?.toLowerCase() ?? null;
  const name = (session.user.name || email || "KaamSetu member").slice(0, 120);
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const user = await client.query(
      `INSERT INTO public.users (auth_subject, email, full_name, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (auth_subject) DO UPDATE
       SET email = COALESCE(EXCLUDED.email, public.users.email),
           full_name = EXCLUDED.full_name,
           updated_at = now()
       RETURNING id`,
      [session.user.id, email, name],
    );
    await client.query(
      `INSERT INTO public.user_roles (user_id, role)
       VALUES ($1, $2)
       ON CONFLICT (user_id, role) DO NOTHING`,
      [user.rows[0].id, role],
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("KaamSetu profile bootstrap failed", error);
    return NextResponse.json({ error: "We could not finish setting up your account. Please contact support." }, { status: 500 });
  } finally {
    client.release();
  }
}

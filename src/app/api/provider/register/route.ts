import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const businessName = String(body.businessName || "").trim().slice(0, 120);
  const phone = String(body.phone || "").replace(/[^0-9+]/g, "").slice(0, 16);
  const city = String(body.city || "").trim().slice(0, 80);
  const state = String(body.state || "").trim().slice(0, 80);
  const postalCode = String(body.postalCode || "").trim();
  const description = String(body.description || "").trim().slice(0, 1000);
  const subcategorySlug = String(body.subcategorySlug || "").trim();
  if (!businessName || phone.length < 10 || !city || !state || !/^\d{6}$/.test(postalCode) || !subcategorySlug) {
    return NextResponse.json({ error: "Please complete all required fields with a valid 6-digit PIN code." }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const owner = await client.query(
      "SELECT u.id FROM public.users u JOIN public.user_roles r ON r.user_id=u.id WHERE u.auth_subject=$1 AND u.status='active' AND r.role='provider_owner' LIMIT 1",
      [session.user.id],
    );
    if (!owner.rows[0]) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "A provider account is required before registering a business." }, { status: 403 });
    }
    const subcategory = await client.query(
      "SELECT s.id FROM public.subcategories s JOIN public.categories c ON c.id=s.category_id WHERE s.slug=$1 AND s.is_active=true AND c.is_active=true LIMIT 1",
      [subcategorySlug],
    );
    if (!subcategory.rows[0]) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Please choose a valid service category." }, { status: 400 });
    }
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) + "-" + randomUUID().slice(0, 8);
    const provider = await client.query(
      "INSERT INTO public.provider_businesses (owner_user_id,business_name,slug,description,phone,email,status) VALUES ($1,$2,$3,$4,$5,$6,'submitted') RETURNING id",
      [owner.rows[0].id,businessName,slug,description || null,phone,session.user.email || null],
    );
    await client.query(
      "INSERT INTO public.service_areas (provider_id,postal_code,city,state) VALUES ($1,$2,$3,$4)",
      [provider.rows[0].id,postalCode,city,state],
    );
    const serviceName = await client.query("SELECT name FROM public.subcategories WHERE id=$1", [subcategory.rows[0].id]);
    await client.query(
      "INSERT INTO public.provider_services (provider_id,subcategory_id,title,description,pricing_type,is_active) VALUES ($1,$2,$3,$4,'quote',false)",
      [provider.rows[0].id,subcategory.rows[0].id,serviceName.rows[0].name,description || null],
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, message: "Your business details have been submitted for review." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Provider registration failed", error);
    return NextResponse.json({ error: "We could not submit your business right now. Please try again." }, { status: 500 });
  } finally {
    client.release();
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const postalCode = request.nextUrl.searchParams.get("postalCode")?.trim() || "";
  const category = request.nextUrl.searchParams.get("category")?.trim() || "";
  if (postalCode && !/^\d{6}$/.test(postalCode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });
  }
  const result = await db.query(
    `SELECT pb.id AS provider_id, pb.business_name, pb.description, ps.title AS service_title,
            ps.pricing_type, ps.base_price_paise, sa.city, sa.state, sa.postal_code, c.name AS category
     FROM public.provider_services ps
     JOIN public.provider_businesses pb ON pb.id=ps.provider_id
     JOIN public.subcategories sc ON sc.id=ps.subcategory_id
     JOIN public.categories c ON c.id=sc.category_id
     JOIN public.service_areas sa ON sa.provider_id=pb.id
     WHERE pb.status='approved' AND ps.is_active=true AND c.is_active=true
       AND ($1='' OR sa.postal_code=$1)
       AND ($2='' OR c.slug=$2)
     ORDER BY pb.business_name, ps.title
     LIMIT 40`,
    [postalCode,category],
  );
  return NextResponse.json({ results: result.rows });
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerHome() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");
  const result = await db.query(
    "SELECT u.full_name FROM public.users u JOIN public.user_roles r ON r.user_id=u.id WHERE u.auth_subject=$1 AND r.role='customer' LIMIT 1",
    [session.user.id],
  );
  if (!result.rows[0]) redirect("/login");
  return <main className="soft-grid min-h-screen px-5 py-12"><section className="mx-auto max-w-4xl rounded-[2rem] border border-white bg-white p-8 shadow-xl"><p className="text-xs font-black uppercase tracking-[.2em] text-forest">Customer space</p><h1 className="mt-3 text-3xl font-black">Welcome, {result.rows[0].full_name}</h1><p className="mt-3 text-slate-500">Your account is ready. Browse the marketplace to find a service in your area.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/services" className="rounded-xl bg-forest px-5 py-3 font-bold text-white">Explore services</Link><Link href="/bills" className="rounded-xl border border-slate-200 px-5 py-3 font-bold">Bill payments</Link></div><p className="mt-8 text-sm text-slate-400">Bookings and live executive tracking will appear here once a provider confirms a booking.</p></section></main>;
}

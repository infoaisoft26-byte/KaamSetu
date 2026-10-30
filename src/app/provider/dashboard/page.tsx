import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProviderDashboard() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/provider/login");
  const result = await db.query(
    "SELECT u.full_name FROM public.users u JOIN public.user_roles r ON r.user_id=u.id WHERE u.auth_subject=$1 AND r.role='provider_owner' LIMIT 1",
    [session.user.id],
  );
  if (!result.rows[0]) redirect("/provider/login");
  return <main className="soft-grid min-h-screen px-5 py-12"><section className="mx-auto max-w-4xl rounded-[2rem] border border-white bg-white p-8 shadow-xl"><p className="text-xs font-black uppercase tracking-[.2em] text-forest">Provider workspace</p><h1 className="mt-3 text-3xl font-black">Welcome, {result.rows[0].full_name}</h1><p className="mt-3 text-slate-500">Your provider account is created. Complete your business profile to start the verification process.</p><Link href="/provider/register" className="mt-7 inline-flex rounded-xl bg-forest px-5 py-3 font-bold text-white">Complete business registration</Link><p className="mt-8 text-sm text-slate-400">Bookings, team assignments and payouts will be shown after your business is submitted and approved.</p></section></main>;
}

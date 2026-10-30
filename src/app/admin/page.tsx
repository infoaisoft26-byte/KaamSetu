import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, LockKeyhole, Users, BriefcaseBusiness, ClipboardList, CreditCard } from "lucide-react";
import { auth } from "@/lib/auth/server";
import SignOutButton from "@/app/components/SignOutButton";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Admin(){
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");
  const result = await db.query(
    "SELECT r.role FROM public.user_roles r JOIN public.users u ON u.id=r.user_id WHERE u.auth_subject=$1 AND u.status='active'",
    [session.user.id],
  );
  const roles = new Set(result.rows.map((row: { role: string }) => row.role));
  if (!roles.has("super_admin") && !roles.has("operations_admin")) {
    return <main className="soft-grid grid min-h-screen place-items-center px-5 py-10"><section className="w-full max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-xl"><LockKeyhole className="mx-auto text-rose-600" size={34}/><h1 className="mt-4 text-2xl font-black">Access restricted</h1><p className="mt-2 text-slate-500">This account does not have permission to open platform operations.</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-forest px-5 py-3 font-bold text-white">Return to website</Link></section></main>;
  }
  const [users, providers, bookings, payments] = await Promise.all([
    db.query("SELECT count(*)::int AS count FROM public.users"),
    db.query("SELECT count(*)::int AS count FROM public.provider_businesses"),
    db.query("SELECT count(*)::int AS count FROM public.bookings"),
    db.query("SELECT count(*)::int AS count FROM public.payments"),
  ]);
  const cards = [
    {label:"Registered accounts",value:users.rows[0].count,icon:Users},
    {label:"Provider businesses",value:providers.rows[0].count,icon:BriefcaseBusiness},
    {label:"Service bookings",value:bookings.rows[0].count,icon:ClipboardList},
    {label:"Payment records",value:payments.rows[0].count,icon:CreditCard},
  ];
  return <main className="soft-grid min-h-screen px-5 py-10"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink p-7 text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Private operations</p><h1 className="mt-2 text-3xl font-black">Platform overview</h1><p className="mt-2 text-sm text-white/60">Signed in as {session.user.email}</p></div><div className="flex items-center gap-3"><SignOutButton/><div className="rounded-2xl bg-white/10 p-4"><ShieldCheck size={28}/></div></div></header><section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({label,value,icon:Icon})=><article key={label} className="rounded-3xl border border-white bg-white p-6 shadow-sm"><Icon className="text-forest" size={22}/><p className="mt-5 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></article>)}</section><section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Operations status</h2><p className="mt-2 text-sm leading-6 text-slate-500">Authentication and role checks are active. Provider approvals, booking operations, payment gateway reconciliation and service-area management still need their workflow screens and integrations.</p></section></div></main>;
}

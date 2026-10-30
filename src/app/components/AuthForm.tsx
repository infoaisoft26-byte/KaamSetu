"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth/client";

type Props = { portal: "customer" | "provider" };

export default function AuthForm({ portal }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const result = await authClient.signUp.email({ email, password, name });
        if (result.error) throw new Error(result.error.message || "Account creation failed.");
        const role = portal === "customer" ? "customer" : "provider_owner";
        const bootstrap = await fetch("/api/profile/bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
        const profile = await bootstrap.json();
        if (!bootstrap.ok) throw new Error(profile.error || "Account setup failed.");
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message || "Sign-in failed.");
      }
      router.replace(portal === "customer" ? "/customer" : "/provider/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="mt-7 space-y-4">
    {mode === "signup" && <label className="block text-sm font-bold text-slate-700">Full name<input required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" placeholder="Your name"/></label>}
    <label className="block text-sm font-bold text-slate-700">Email address<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" placeholder="you@example.com"/></label>
    <label className="block text-sm font-bold text-slate-700">Password<input required minLength={8} type="password" autoComplete={mode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" placeholder="At least 8 characters"/></label>
    {message && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{message}</p>}
    <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-4 font-extrabold text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 disabled:opacity-60">{busy?<LoaderCircle className="animate-spin" size={18}/>:<>{mode==="signin"?"Sign in":"Create account"} <ArrowRight size={18}/></>}</button>
    <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500"><ShieldCheck size={15} className="text-forest"/> Secure account powered by KaamSetu</div>
    <p className="text-center text-sm text-slate-600">{mode==="signin"?"New to KaamSetu?":"Already have an account?"} <button type="button" onClick={()=>{setMode(mode==="signin"?"signup":"signin");setMessage("");}} className="font-extrabold text-forest underline underline-offset-4">{mode==="signin"?"Create account":"Sign in"}</button></p>
  </form>;
}

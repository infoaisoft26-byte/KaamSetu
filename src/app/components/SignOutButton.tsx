"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export default function SignOutButton(){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  async function signOut(){
    setBusy(true);
    try{
      await authClient.signOut();
      router.replace("/");
      router.refresh();
    }finally{setBusy(false);}
  }
  return <button onClick={signOut} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-emerald-300 disabled:opacity-60">{busy?<LoaderCircle size={16} className="animate-spin"/>:<LogOut size={16}/>} Sign out</button>;
}

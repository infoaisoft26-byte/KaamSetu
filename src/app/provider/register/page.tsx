"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Store, ShieldCheck } from "lucide-react";

const services = [
  ["AC servicing","ac-servicing"],["AC installation","ac-installation"],
  ["Electrical repair","electrical-repair"],["Wiring and fitting","wiring-fitting"],
  ["Tap and pipe repair","tap-pipe-repair"],["Bathroom plumbing","bathroom-plumbing"],
  ["RO servicing","ro-servicing"],["RO installation","ro-installation"],
  ["Deep home cleaning","deep-cleaning"],["Bathroom cleaning","bathroom-cleaning"],
  ["General pest control","general-pest-control"],["Termite treatment","termite-treatment"],
  ["Furniture repair","furniture-repair"],["Furniture installation","furniture-installation"],
  ["Washing machine repair","washing-machine-repair"],["Refrigerator repair","refrigerator-repair"],
];

export default function ProviderRegister(){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");setError(false);
    const form=new FormData(e.currentTarget);
    try{
      const res=await fetch("/api/provider/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        businessName:form.get("businessName"),phone:form.get("phone"),city:form.get("city"),state:form.get("state"),
        postalCode:form.get("postalCode"),description:form.get("description"),subcategorySlug:form.get("subcategorySlug")
      })});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Could not submit registration.");
      setMessage(data.message||"Registration submitted.");
      setTimeout(()=>router.push("/provider/dashboard"),1000);
    }catch(err){setError(true);setMessage(err instanceof Error?err.message:"Please try again.");}
    finally{setBusy(false);}
  }
  return <main className="soft-grid min-h-screen px-5 py-10"><div className="mx-auto max-w-3xl"><Link href="/provider/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-forest"><ArrowLeft size={16}/> Provider workspace</Link><section className="mt-7 rounded-[2rem] border border-white bg-white p-7 shadow-xl sm:p-10"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-mint text-forest"><Store size={26}/></div><p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-forest">Business onboarding</p><h1 className="mt-2 text-3xl font-black">Register your service business.</h1><p className="mt-3 leading-7 text-slate-500">Share your business details and the service you provide. Your listing stays private until the review is complete.</p>
  <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
    <label className="text-sm font-bold text-slate-700 sm:col-span-2">Business name<input name="businessName" required maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Your business name"/></label>
    <label className="text-sm font-bold text-slate-700">Contact phone<input name="phone" required inputMode="tel" minLength={10} maxLength={16} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="10-digit mobile number"/></label>
    <label className="text-sm font-bold text-slate-700">Primary service<select name="subcategorySlug" required defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"><option value="" disabled>Select a service</option>{services.map(([label,value])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label className="text-sm font-bold text-slate-700">City<input name="city" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="City"/></label>
    <label className="text-sm font-bold text-slate-700">State<input name="state" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="State"/></label>
    <label className="text-sm font-bold text-slate-700 sm:col-span-2">Service area PIN code<input name="postalCode" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="6-digit PIN code"/></label>
    <label className="text-sm font-bold text-slate-700 sm:col-span-2">Business description<textarea name="description" rows={4} maxLength={1000} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Tell customers about your experience and services"/></label>
    {message&&<p role="status" className={`rounded-xl p-4 text-sm sm:col-span-2 ${error?"bg-rose-50 text-rose-700":"bg-emerald-50 text-emerald-800"}`}>{message}</p>}
    <div className="rounded-xl bg-sand p-4 text-sm leading-6 text-slate-600 sm:col-span-2"><ShieldCheck className="mb-2 text-forest" size={19}/> No registration charge is collected in this step. Provider fees will be displayed before payment once the platform fee amount and payment gateway are approved.</div>
    <button disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-4 font-extrabold text-white disabled:opacity-60 sm:col-span-2">{busy?<LoaderCircle className="animate-spin" size={18}/>: "Submit business for review"}</button>
  </form></section></div></main>
}

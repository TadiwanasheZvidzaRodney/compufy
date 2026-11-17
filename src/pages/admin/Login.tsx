import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, ShieldCheck, Command } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email,setEmail] = useState(""), [password,setPassword] = useState(""), [busy,setBusy] = useState(false);
  const {session} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {if(session) navigate("/admin",{replace:true});},[session,navigate]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {const {error} = await supabase.auth.signInWithPassword({email,password}); if(error) throw error; navigate("/admin",{replace:true});}
    catch {toast.error("Unable to sign in. Check your credentials and try again.");} finally {setBusy(false);}
  };
  return <main className="min-h-screen grid lg:grid-cols-2"><section className="hidden lg:flex bg-[#0b132b] text-white flex-col justify-between p-16 relative overflow-hidden"><div className="absolute w-96 h-96 bg-blue-600/20 rounded-full -right-32 top-32 blur-3xl" /><div className="flex gap-3 items-center text-xl font-bold relative"><Command className="text-cyan-300" /> compufy.</div><div className="relative"><p className="eyebrow text-cyan-300 mb-6">BEHIND EVERY GREAT SOLUTION</p><h1 className="text-5xl font-semibold tracking-tight leading-tight">A workspace<br />that works for you.</h1><p className="text-slate-400 max-w-sm mt-6 leading-relaxed">Manage your products. Connect with customers. Keep your business moving.</p></div><p className="text-sm text-slate-400">Compufy Investments · Staff access only</p></section>
    <section className="flex flex-col justify-center p-6 sm:p-16"><div className="w-full max-w-sm mx-auto"><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-14"><ArrowLeft size={16} /> Back to website</Link><div className="rounded-xl bg-blue-50 text-primary w-12 h-12 flex items-center justify-center mb-6"><ShieldCheck /></div><p className="eyebrow mb-3">COMPUFY ADMIN</p><h2 className="text-3xl font-semibold tracking-tight">Welcome back.</h2><p className="text-muted-foreground mt-3 mb-8">Sign in to your business workspace.</p><form onSubmit={submit} className="space-y-5"><label className="form-label">Email address<input className="field" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" /></label><label className="form-label">Password<input className="field" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label><Button className="w-full" size="lg" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<ArrowUpRight size={17} /></Button></form><p className="text-xs text-muted-foreground mt-8 leading-relaxed">Need access or a password reset? Contact your site administrator. Staff accounts are provisioned by the site owner.</p></div></section>
  </main>;
}

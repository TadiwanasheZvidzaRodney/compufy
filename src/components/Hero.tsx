import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, Cpu, Wifi, Check, Monitor, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return <section className="hero-section overflow-hidden relative">
    <div className="absolute inset-0 hero-grid pointer-events-none" />
    <div className="container-custom relative grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[11px] font-semibold tracking-widest text-primary uppercase"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Your technology partner since 2016</span>
        <h1 className="display-title mt-7">Big ideas.<br />Better technology.<br /><span className="text-primary">Made simple.</span></h1>
        <p className="text-lg text-slate-500 leading-relaxed mt-7 max-w-lg">From the hardware on your desk to the network behind your business. We make technology work for you.</p>
        <div className="flex flex-wrap gap-3 mt-9"><Button asChild size="lg"><Link to="/products">Explore catalogue <ArrowUpRight size={18} /></Link></Button><Button asChild size="lg" variant="outline" className="bg-white"><Link to="/services">Discover our services <ArrowRight size={17} /></Link></Button></div>
        <div className="flex flex-wrap gap-6 items-center mt-10 text-xs text-slate-500"><span className="inline-flex gap-2 items-center"><ShieldCheck size={17} className="text-primary" /> Reliable support</span><span className="inline-flex gap-2 items-center"><Check size={17} className="text-primary" /> Practical solutions</span><span className="inline-flex gap-2 items-center"><Headphones size={17} className="text-primary" /> Real people</span></div>
      </div>
      <div className="relative mx-auto w-full max-w-lg py-8 lg:py-0" aria-label="Connected technology and IT solutions illustration" role="img">
        <div className="absolute bg-blue-100 rounded-full w-80 h-80 top-4 left-14 blur-3xl opacity-70" />
        <div className="tech-stage"><div className="flex items-center justify-between mb-10"><div className="flex gap-1.5"><span className="w-2 h-2 rounded-full bg-white/20" /><span className="w-2 h-2 rounded-full bg-white/20" /><span className="w-2 h-2 rounded-full bg-white/20" /></div><span className="text-[9px] text-slate-400 font-mono tracking-widest">COMPUFY / CONNECTED</span></div>
          <div className="monitor-frame"><div className="monitor-screen"><div className="text-[9px] tracking-[.2em] text-blue-200/70 uppercase mb-5">Built for what’s next</div><div className="flex justify-center"><Cpu size={64} strokeWidth={1} className="text-cyan-200" /></div><div className="text-white text-xl font-semibold tracking-tight mt-5">Your world. Connected.</div><div className="flex gap-1 justify-center mt-4">{[1,2,3,4,5,6,7,8].map(n => <span key={n} className="h-1 w-5 rounded-full bg-cyan-300/50" style={{opacity:n/8}} />)}</div></div></div>
          <div className="monitor-neck" /><div className="monitor-base" />
          <div className="flex justify-between text-[9px] text-slate-400 mt-9 pt-5 border-t border-white/10"><span>HARDWARE + EXPERTISE</span><span className="flex gap-1.5 items-center text-emerald-300"><span className="w-1.5 h-1.5 bg-emerald-300 rounded-full" /> ALL SYSTEMS READY</span></div>
        </div>
        <div className="floating-tag -left-3 top-16"><span className="rounded-lg bg-blue-50 p-2 text-primary"><Monitor size={19} /></span><div><p className="text-xs font-semibold">Business-ready hardware</p><p className="text-[10px] text-slate-500 mt-1">Built to keep you moving</p></div></div>
        <div className="floating-tag -right-2 bottom-12"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Wifi size={19} /></span><div><p className="text-xs font-semibold">Seamlessly connected</p><p className="text-[10px] text-slate-500 mt-1">Networks that go further</p></div></div>
      </div>
    </div>
    <div className="border-y border-slate-200/70 bg-white/60"><div className="container-custom grid grid-cols-2 md:grid-cols-4 py-6 gap-6">{[["01","IT support & repairs"],["02","Hardware & accessories"],["03","Networks & security"],["04","Digital solutions"]].map(([n,title]) => <div key={n} className="flex items-center gap-3"><span className="text-xs font-mono text-primary">{n} /</span><span className="text-sm font-medium text-slate-600">{title}</span></div>)}</div></div>
  </section>;
}

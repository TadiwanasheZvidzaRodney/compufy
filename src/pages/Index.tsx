import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Laptop, Network, Cctv, Code, Wifi, GraduationCap, ArrowUpRight, Check, ArrowRight, Package } from "lucide-react";
import { useProducts, useCategories } from "@/lib/catalogue";

const services = [
  {title:"Computer repairs",text:"A fresh start for the tech you rely on. Diagnostics, repairs and upgrades without the headache.",icon:Laptop,id:"repair"},
  {title:"Networks that connect",text:"Secure, dependable connectivity. From your home office to your whole business.",icon:Network,id:"network"},
  {title:"Security, made smarter",text:"Keep an eye on what matters with professionally installed CCTV systems.",icon:Cctv,id:"cctv"},
  {title:"Web & digital solutions",text:"Make your business feel at home online. Thoughtful websites built around your goals.",icon:Code,id:"web"},
  {title:"Support from anywhere",text:"Get back to what you do best with practical remote troubleshooting and assistance.",icon:Wifi,id:"remote"},
  {title:"Knowledge that empowers",text:"Get more from your technology with tailored training and expert IT consultancy.",icon:GraduationCap,id:"training"},
];
export default function Index() {
  const {data:products = [],error,isLoading} = useProducts();
  const {data:categories = []} = useCategories();
  const featured = products.filter(p => p.featured).slice(0,3);
  const show = featured.length ? featured : products.slice(0,3);
  return <><Navbar /><main><Hero />
    <section className="container-custom py-20 lg:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12"><div><p className="eyebrow">OUR EXPERTISE</p><h2 className="section-title mt-4">One partner.<br />Every tech possibility.</h2></div><p className="text-muted-foreground max-w-sm leading-relaxed">Practical solutions for everyday challenges and ambitious plans. We’re here for both.</p></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{services.map((s,index) => <Link to={`/services#${s.id}`} key={s.id} className="service-tile group"><div className="flex justify-between items-center"><span className="service-icon"><s.icon size={25} strokeWidth={1.5} /></span><span className="text-xs font-mono text-slate-300">0{index+1}</span></div><h3 className="text-xl font-semibold tracking-tight mt-8">{s.title}</h3><p className="text-sm text-muted-foreground leading-relaxed mt-3">{s.text}</p><span className="inline-flex gap-2 items-center text-primary text-sm font-medium mt-6">Explore service <ArrowUpRight size={16} className="group-hover:translate-x-1 transition" /></span></Link>)}</div>
    </section>
    <section className="bg-slate-50 border-y border-slate-100"><div className="container-custom py-20"><div className="flex flex-wrap items-end justify-between gap-5 mb-10"><div><p className="eyebrow">THE RIGHT TOOLS FOR THE JOB</p><h2 className="section-title mt-4">Meet your next upgrade.</h2><p className="text-muted-foreground mt-4">Great hardware. Helpful advice. No guesswork.</p></div><Button asChild variant="outline" className="bg-white"><Link to="/products">View catalogue <ArrowUpRight size={16} /></Link></Button></div>
      {isLoading ? <div className="grid md:grid-cols-3 gap-5">{[1,2,3].map(n => <div key={n} className="bg-slate-200 animate-pulse h-72 rounded-2xl" />)}</div> : show.length ? <div className="grid md:grid-cols-3 gap-5">{show.map(p => <ProductCard key={p.id} product={p} category={categories.find(c => c.id === p.category_id)?.name} />)}</div> :
        <div className="rounded-2xl bg-white border border-slate-200 p-8 sm:p-12 flex flex-wrap gap-8 items-center justify-between"><div className="flex gap-5"><span className="service-icon hidden sm:flex"><Package size={30} /></span><div><h3 className="text-xl font-semibold">{error ? "Let's find the tech you need." : "Looking for something specific?"}</h3><p className="text-muted-foreground mt-3 max-w-lg">{error ? "Our online catalogue is temporarily unavailable. Our team can still help with product availability and pricing." : "Laptops, printers, storage, networking and more. Tell us what you need and we'll put together a tailored quote."}</p></div></div><Button asChild><Link to="/contact?service=products">Ask about products <ArrowRight size={16} /></Link></Button></div>}
    </div></section>
    <section className="container-custom py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center"><div className="relative"><div className="rounded-3xl overflow-hidden aspect-[5/4] bg-slate-100"><img src="/images/services/ca0fca17-1fb7-4741-82ef-57ca2211043f.png" alt="Computer repair and hardware expertise" className="w-full h-full object-cover" loading="lazy" /></div><div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur rounded-xl p-5 flex items-center gap-4 border border-white"><span className="text-primary text-4xl font-semibold tracking-tight">2016</span><div className="text-sm"><p className="font-semibold">Where our story began.</p><p className="text-muted-foreground mt-1">Built on trust. Driven by technology.</p></div></div></div><div><p className="eyebrow">THE COMPUFY DIFFERENCE</p><h2 className="section-title mt-4">Technology is complex.<br />Working with us isn’t.</h2><p className="text-muted-foreground leading-relaxed mt-6">We’re more than a repair shop or a hardware supplier. We’re the people you call when you need technology to just work.</p><ul className="space-y-4 my-7">{["Straightforward advice, without the jargon","Solutions tailored to your needs and budget","Support that doesn't stop after the sale"].map(text => <li key={text} className="flex gap-3 items-center text-sm"><span className="rounded-full bg-blue-50 text-primary p-1"><Check size={14} /></span>{text}</li>)}</ul><Link to="/about" className="text-primary font-medium text-sm inline-flex gap-2 items-center">Get to know Compufy <ArrowUpRight size={17} /></Link></div></section>
    <section className="container-custom pb-20"><div className="callout"><div><p className="eyebrow text-cyan-300">LET'S BUILD WHAT'S NEXT</p><h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-4">Your next step starts with a conversation.</h2><p className="text-slate-300 mt-4 max-w-xl">A quick fix, a full setup, or a big idea. We’re ready when you are.</p></div><Button asChild size="lg" variant="secondary" className="shrink-0"><Link to="/contact">Let’s talk <ArrowUpRight size={18} /></Link></Button></div></section>
  </main><Footer /></>;
}

import { Link } from "react-router-dom";
import { ArrowUpRight, Command, Phone, Mail } from "lucide-react";

export default function Footer() {
  return <footer className="bg-[#0b132b] text-white pt-16 pb-7"><div className="container-custom">
    <div className="grid md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 pb-14">
      <div><Link to="/" className="inline-flex gap-3 items-center text-2xl font-bold tracking-tight"><Command className="text-cyan-300" />compufy.</Link><p className="text-slate-400 mt-5 max-w-xs leading-relaxed text-sm">Better technology. Less complexity. Your partner in IT support, hardware and digital solutions.</p><a href="https://wa.me/263772752393" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-300 text-sm mt-6">Let's talk on WhatsApp <ArrowUpRight size={16} /></a></div>
      <div><h3 className="text-sm font-semibold mb-5">Explore</h3><ul className="space-y-3 text-sm text-slate-400">{[["Home","/"],["Catalogue","/products"],["Our story","/about"],["Contact","/contact"]].map(([text,to]) => <li key={to}><Link className="hover:text-white" to={to}>{text}</Link></li>)}</ul></div>
      <div><h3 className="text-sm font-semibold mb-5">Expertise</h3><ul className="space-y-3 text-sm text-slate-400">{[["IT repairs","repair"],["Networking","network"],["CCTV & security","cctv"],["Web development","web"],["Training & consulting","training"]].map(([text,id]) => <li key={id}><Link className="hover:text-white" to={`/services#${id}`}>{text}</Link></li>)}</ul></div>
      <div><h3 className="text-sm font-semibold mb-5">Get in touch</h3><a href="tel:+263772752393" className="flex items-center gap-2 text-sm text-slate-300"><Phone size={15} /> +263 772 752 393</a><a href="tel:+263712125999" className="block text-sm text-slate-400 mt-3 ml-6">+263 712 125 999</a><a href="mailto:compufyinvestments@gmail.com" className="flex items-center gap-2 text-sm text-slate-300 mt-4 break-all"><Mail size={15} className="shrink-0" /> compufyinvestments@gmail.com</a><p className="text-xs text-slate-400 leading-relaxed mt-5">Monday–Friday · 9am–5pm<br />Call-out services available.</p></div>
    </div><div className="border-t border-white/10 pt-6 flex flex-wrap justify-between gap-4 text-xs text-slate-400"><p>© {new Date().getFullYear()} Compufy Investments. All rights reserved.</p><Link to="/admin/login" className="hover:text-white">Staff portal ↗</Link></div>
  </div></footer>;
}

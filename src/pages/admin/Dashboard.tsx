import { Link } from "react-router-dom";
import { useProducts, useInquiries, useCategories } from "@/lib/catalogue";
import { Package, Globe, AlertCircle, MessageSquare, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const products = useProducts(true), inquiries = useInquiries(), categories = useCategories();
  const p = products.data || [], i = inquiries.data || [];
  const loading = products.isLoading || inquiries.isLoading;
  const error = products.error || inquiries.error || categories.error;
  const stats = [
    { label:"Total products", value:p.length, icon:Package, hint:"Across your catalogue" },
    { label:"Published products", value:p.filter(p => p.published).length, icon:Globe, hint:"Visible on your website" },
    { label:"Stock alerts", value:p.filter(p => p.stock_status !== "in_stock").length, icon:AlertCircle, hint:"Low or out of stock" },
    { label:"New inquiries", value:i.filter(i => i.status === "new").length, icon:MessageSquare, hint:"Waiting for your response" },
  ];
  return <div className="space-y-8"><div className="flex flex-wrap justify-between gap-4 items-center"><div><p className="eyebrow">YOUR BUSINESS, AT A GLANCE</p><h2 className="text-3xl font-semibold tracking-tight mt-2">Welcome to your workspace.</h2><p className="text-muted-foreground mt-2">Keep your catalogue fresh and your customers connected.</p></div><Button asChild><Link to="/admin/products"><Plus size={16} /> Manage products</Link></Button></div>
    {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 text-sm">Some data couldn't load. Apply the Compufy catalogue migration and verify your administrator role. <button className="underline ml-2" onClick={() => {products.refetch(); inquiries.refetch(); categories.refetch();}}>Retry</button></div>}
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{stats.map(s => <div key={s.label} className="admin-panel"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{s.label}</p><s.icon size={19} className="text-primary" /></div><p className="text-4xl font-semibold tracking-tight my-4">{loading || error ? "—" : s.value}</p><p className="text-xs text-muted-foreground">{s.hint}</p></div>)}</div>
    <div className="grid lg:grid-cols-2 gap-6"><section className="admin-panel"><div className="flex justify-between items-center mb-6"><h3 className="font-semibold">Catalogue by category</h3><Package size={18} className="text-muted-foreground" /></div>{!p.length ? <p className="text-sm text-muted-foreground py-8">Add products to see your catalogue breakdown.</p> : (categories.data || []).map(c => {const count=p.filter(p => p.category_id === c.id).length; return <div key={c.id} className="mb-5"><div className="flex justify-between text-sm mb-2"><span>{c.name}</span><span className="text-muted-foreground">{count}</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${count / p.length * 100}%`}} /></div></div>;})}</section>
    <section className="admin-panel"><div className="flex justify-between items-center mb-6"><h3 className="font-semibold">Latest inquiries</h3><Link to="/admin/inquiries" className="text-primary text-sm inline-flex gap-1 items-center">View all <ArrowUpRight size={15} /></Link></div>{!i.length ? <p className="text-sm text-muted-foreground py-8">Customer requests will appear here.</p> : i.slice(0,5).map(item => <Link to="/admin/inquiries" key={item.id} className="flex justify-between gap-4 py-4 border-b last:border-0"><div><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.message}</p></div><span className="status-badge self-start">{item.status.replace("_"," ")}</span></Link>)}</section></div>
    <div className="callout"><div><p className="eyebrow text-cyan-300">LOOKING GOOD OUT THERE</p><h3 className="text-xl font-semibold mt-3">Your catalogue is your digital showroom.</h3><p className="text-slate-300 text-sm mt-2">Use clear photos and detailed specifications to help customers choose.</p></div><Button asChild variant="secondary"><Link to="/products">Visit website <ArrowUpRight size={16} /></Link></Button></div>
  </div>;
}

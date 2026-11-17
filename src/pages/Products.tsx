import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories } from "@/lib/catalogue";
import { Search, PackageOpen, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [params, setParams] = useSearchParams();
  const { data: products = [], isLoading, error, refetch } = useProducts();
  const { data: categories = [], error: categoryError } = useCategories();
  const update = (key: string, value: string) => setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key,value); else next.delete(key); return next; });
  const search = params.get("q") || "";
  const category = params.get("category") || "";
  const filtered = products.filter(p => (!category || p.category_id === category)
    && (!params.get("stock") || p.stock_status !== "out_of_stock")
    && `${p.title} ${p.description} ${p.sku || ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => params.get("sort") === "price" ? (a.price ?? Infinity) - (b.price ?? Infinity) : params.get("sort") === "name" ? a.title.localeCompare(b.title) : 0);
  return <><Navbar /><main>
    <section className="page-intro"><div className="container-custom">
      <p className="eyebrow">THE COMPUFY CATALOGUE</p>
      <h1 className="display-title mt-5">The right tech.<br /><span className="text-primary">For your next move.</span></h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-xl">From everyday essentials to business-ready hardware. Find your fit, and let our team take care of the rest.</p>
    </div></section>
    <section className="container-custom py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:w-96"><Search size={18} className="absolute left-4 top-3.5 text-muted-foreground" /><input aria-label="Search catalogue" className="field pl-11" placeholder="Search products, models, specifications…" value={search} onChange={e => update("q",e.target.value)} /></div>
        <div className="flex gap-5 items-center"><label className="text-sm flex gap-2 items-center"><input type="checkbox" checked={!!params.get("stock")} onChange={e => update("stock", e.target.checked ? "1" : "")} /> In stock only</label>
          <select aria-label="Sort products" className="field w-auto" value={params.get("sort") || ""} onChange={e => update("sort",e.target.value)}><option value="">Newest first</option><option value="price">Price: low to high</option><option value="name">Name: A–Z</option></select></div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8"><button className={`filter-pill ${!category ? "active" : ""}`} onClick={() => update("category","")}>All products</button>{categories.map(c => <button key={c.id} className={`filter-pill ${category === c.id ? "active" : ""}`} onClick={() => update("category",c.id)}>{c.name}</button>)}</div>
      {categoryError && <p role="alert" className="text-sm text-amber-700 mb-4">Category filters are temporarily unavailable.</p>}
      {isLoading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-96 rounded-2xl bg-slate-100 animate-pulse" />)}</div> :
        error ? <div className="empty-state" role="alert"><PackageOpen /><h2>Catalogue temporarily unavailable</h2><p>We couldn't load our products. Please try again or contact our team.</p><Button onClick={() => refetch()} variant="outline">Try again</Button></div> :
        filtered.length ? <><p className="text-sm text-muted-foreground mb-5">{filtered.length} products</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(p => <ProductCard key={p.id} product={p} category={categories.find(c => c.id === p.category_id)?.name} />)}</div></> :
        <div className="empty-state"><PackageOpen /><h2>{products.length ? "No matches just yet." : "Your next tech upgrade starts here."}</h2><p>{products.length ? "Try another search or clear your filters." : "We're updating our selection. Tell us what you need and we'll help you source it."}</p>{products.length ? <Button variant="outline" onClick={() => setParams({})}>Clear filters</Button> : <Button asChild><Link to="/contact?service=products">Request a product <ArrowUpRight size={16} /></Link></Button>}</div>}
    </section>
    <section className="container-custom pb-16"><div className="callout"><div><p className="eyebrow text-cyan-300">NEED A RECOMMENDATION?</p><h2 className="text-2xl font-semibold mt-3">Good advice. Better technology.</h2><p className="text-slate-300 mt-2">Let’s find a solution that fits your needs and your budget.</p></div><Button asChild variant="secondary"><Link to="/contact">Talk to an expert <ArrowUpRight size={16} /></Link></Button></div></section>
  </main><Footer /></>;
}

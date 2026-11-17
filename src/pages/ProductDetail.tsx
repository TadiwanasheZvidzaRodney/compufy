import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, safeImage, stockLabels } from "@/lib/catalogue";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, MessageCircle, ShieldCheck } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ["product", slug], queryFn: async () => {
      const { data,error } = await supabase.from("products").select("*").eq("slug",slug!).eq("published",true).maybeSingle();
      if(error) throw error; return data;
    },
  });
  const specs = product?.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications) ? Object.entries(product.specifications) : [];
  return <><Navbar /><main className="container-custom py-12 min-h-[65vh]">
    <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-10"><ArrowLeft size={16} /> Back to catalogue</Link>
    {isLoading ? <p role="status">Loading product…</p> : error ? <div className="empty-state" role="alert"><h1>Unable to load this product</h1><Button onClick={() => refetch()}>Try again</Button></div> : !product ? <div className="empty-state"><h1>Product not found</h1><p>This item may no longer be available.</p><Button asChild><Link to="/products">Browse catalogue</Link></Button></div> :
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20"><div className="rounded-3xl bg-slate-100 aspect-square p-10"><img className="w-full h-full object-contain" src={safeImage(product.image_url)} alt={product.title} onError={e => {e.currentTarget.onerror = null; e.currentTarget.src="/placeholder.svg";}} /></div>
      <div><p className="eyebrow">{product.sku || "COMPUFY SELECTION"}</p><h1 className="text-4xl font-semibold tracking-tight mt-4">{product.title}</h1><p className="text-2xl font-semibold mt-6">{formatPrice(product.price)} <span className="text-xs font-normal text-muted-foreground">USD</span></p>
        <p className="text-sm text-primary mt-3">{stockLabels[product.stock_status]}</p><p className="text-muted-foreground leading-relaxed whitespace-pre-line my-8">{product.description}</p>
        {specs.length > 0 && <dl className="mb-8 divide-y border-y">{specs.map(([key,value]) => <div key={key} className="flex justify-between py-3 gap-4 text-sm"><dt className="text-muted-foreground">{key}</dt><dd className="font-medium text-right">{String(value)}</dd></div>)}</dl>}
        <div className="flex flex-wrap gap-3"><Button asChild size="lg"><Link to={`/contact?service=products&product=${product.id}&name=${encodeURIComponent(product.title)}`}>Request a quote <ArrowUpRight size={18} /></Link></Button><Button asChild size="lg" variant="outline"><a target="_blank" rel="noopener noreferrer" href={`https://wa.me/263772752393?text=${encodeURIComponent(`Hi Compufy, I'm interested in ${product.title} (${product.sku || product.slug}).`)}`}><MessageCircle size={18} /> WhatsApp us</a></Button></div>
        <p className="mt-8 flex gap-2 items-center text-sm text-muted-foreground"><ShieldCheck size={18} /> Expert guidance before and after your purchase.</p>
      </div></div>}
  </main><Footer /></>;
}

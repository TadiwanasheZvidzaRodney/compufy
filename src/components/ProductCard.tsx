import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Product, formatPrice, safeImage, stockLabels } from "@/lib/catalogue";

export default function ProductCard({ product, category }: { product: Product; category?: string }) {
  return <Link to={`/products/${product.slug}`} className="product-card group">
    <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
      <img src={safeImage(product.image_url)} alt={product.title} loading="lazy"
        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "/placeholder.svg"; }}
        className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105" />
      {product.featured && <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold">Featured</span>}
    </div>
    <div className="p-5">
      <div className="eyebrow mb-3">{category || "Technology"}</div>
      <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">{product.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      <div className="mt-5 flex items-center justify-between border-t pt-4">
        <div><p className="font-semibold">{formatPrice(product.price)}</p><p className={`text-xs mt-1 ${product.stock_status === "out_of_stock" ? "text-slate-500" : "text-emerald-700"}`}>{stockLabels[product.stock_status]}</p></div>
        <span className="rounded-full bg-slate-100 p-2 group-hover:bg-primary group-hover:text-white transition"><ArrowUpRight size={18} /></span>
      </div>
    </div>
  </Link>;
}

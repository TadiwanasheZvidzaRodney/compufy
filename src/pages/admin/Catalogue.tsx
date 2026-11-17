import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts, useCategories, Product, formatPrice, stockLabels, safeImage } from "@/lib/catalogue";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Upload, PackageOpen } from "lucide-react";
import { toast } from "sonner";

const blank = { title:"", sku:"", category_id:"", price:"", description:"", image_url:"", specifications:"", stock_status:"in_stock" as Product["stock_status"], published:false, featured:false };
export default function Catalogue() {
  const { data: products = [], isLoading, error, refetch } = useProducts(true);
  const { data: categories = [], error: categoryError } = useCategories();
  const client = useQueryClient();
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("");
  const [open,setOpen] = useState(false);
  const [editing,setEditing] = useState<Product | null>(null);
  const [form,setForm] = useState(blank);
  const [busy,setBusy] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [deleting,setDeleting] = useState<Product | null>(null);
  const [categoryName,setCategoryName] = useState("");
  const [addingCategory,setAddingCategory] = useState(false);
  const field = <K extends keyof typeof blank>(key: K, value: typeof blank[K]) => setForm(f => ({...f,[key]:value}));
  const edit = (p: Product | null) => {
    setEditing(p); setForm(p ? {title:p.title, sku:p.sku || "", category_id:p.category_id || "",price:p.price === null ? "" : String(p.price),description:p.description,image_url:p.image_url,
      specifications: p.specifications && typeof p.specifications === "object" ? Object.entries(p.specifications).map(([k,v]) => `${k}: ${v}`).join("\n") : "",
      stock_status:p.stock_status,published:p.published,featured:p.featured} : blank); setOpen(true);
  };
  const invalidate = async () => { await client.invalidateQueries({queryKey:["products"]}); await client.invalidateQueries({queryKey:["product"]}); };
  const save = async (e: FormEvent) => {
    e.preventDefault(); if (busy || uploading) return;
    if (!form.title.trim()) return toast.error("A product name is required.");
    if (form.price !== "" && (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)) return toast.error("Enter a valid price.");
    if (form.image_url && safeImage(form.image_url) === "/placeholder.svg") return toast.error("Use an HTTPS image URL.");
    const specifications: Record<string,string> = {};
    for(const line of form.specifications.split("\n").filter(l => l.trim())) {
      const separator = line.indexOf(":");
      if(separator < 1 || !line.slice(separator+1).trim()) return toast.error("Write specifications as Name: Value, one per line.");
      specifications[line.slice(0,separator).trim()] = line.slice(separator+1).trim();
    }
    setBusy(true);
    try {
      const payload = { ...form, title:form.title.trim(), sku:form.sku.trim() || null, category_id:form.category_id || null, price:form.price === "" ? null : Number(form.price), specifications };
      const result = editing ? await supabase.from("products").update(payload).eq("id",editing.id).select("id").single() :
        await supabase.from("products").insert({...payload, slug:`${form.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "product"}-${crypto.randomUUID().slice(0,8)}`}).select("id").single();
      if(result.error) throw result.error;
      await invalidate(); setOpen(false); toast.success(editing ? "Product updated" : "Product added");
    } catch(e) { toast.error(e instanceof Error ? e.message : "Couldn't save product. Check database setup and permissions."); } finally {setBusy(false);}
  };
  const upload = async (file?: File) => {
    if(!file) return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 5*1024*1024) return toast.error("Choose a JPG, PNG or WebP image up to 5 MB.");
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}.${file.type.split("/")[1]}`;
      const {error} = await supabase.storage.from("product-images").upload(path,file);
      if(error) throw error;
      field("image_url",supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
      toast.success("Image uploaded");
    } catch {toast.error("Upload failed. Check storage setup and permissions.");} finally {setUploading(false);}
  };
  const remove = async () => {
    if(!deleting || busy) return; setBusy(true);
    try { const {error} = await supabase.from("products").delete().eq("id",deleting.id).select("id").single(); if(error) throw error; await invalidate(); setDeleting(null); toast.success("Product deleted"); }
    catch {toast.error("Couldn't delete this product.");} finally {setBusy(false);}
  };
  const addCategory = async (e: FormEvent) => {
    e.preventDefault(); if(addingCategory || !categoryName.trim()) return; setAddingCategory(true);
    try { const {error} = await supabase.from("categories").insert({name:categoryName.trim()}); if(error) throw error; await client.invalidateQueries({queryKey:["categories"]}); setCategoryName(""); toast.success("Category added"); }
    catch {toast.error("Couldn't add category. It may already exist.");} finally {setAddingCategory(false);}
  };
  const visible = products.filter(p => `${p.title} ${p.sku || ""}`.toLowerCase().includes(search.toLowerCase()) && (!filter || p.category_id === filter));
  return <div className="space-y-7">
    <div className="flex justify-between items-start gap-4"><div><p className="eyebrow">INVENTORY</p><h2 className="text-3xl font-semibold tracking-tight mt-2">Product catalogue</h2><p className="text-muted-foreground mt-2">Everything you sell, in one place.</p></div><Button onClick={() => edit(null)}><Plus size={17} /> Add product</Button></div>
    <div className="admin-panel">
      <div className="flex flex-wrap gap-3 mb-6"><div className="relative flex-1 min-w-48"><Search size={17} className="absolute top-3.5 left-3 text-muted-foreground" /><input aria-label="Search products" placeholder="Search product name or SKU…" className="field pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div><select aria-label="Filter category" className="field w-auto" value={filter} onChange={e => setFilter(e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      {categoryError && <p role="alert" className="text-amber-700 mb-4">Categories unavailable. Apply the database migration or retry later.</p>}
      {isLoading ? <p role="status">Loading catalogue…</p> : error ? <div className="empty-state" role="alert"><h3>Couldn't load your catalogue</h3><p>Check Supabase configuration and apply the catalogue migration.</p><Button variant="outline" onClick={() => refetch()}>Retry</Button></div> :
        !visible.length ? <div className="empty-state"><PackageOpen /><h3>{products.length ? "No matching products" : "Make room for your first product."}</h3><p>Add a product, upload a photo, then publish it to your website.</p><Button onClick={() => edit(null)}>Add product</Button></div> :
        <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price (USD)</th><th>Stock</th><th>Visibility</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map(p => <tr key={p.id}><td><div className="flex gap-3 items-center"><img src={safeImage(p.image_url)} alt="" className="h-12 w-12 rounded-lg bg-slate-100 object-contain" /><div className="font-medium">{p.title}<p className="text-xs text-muted-foreground font-normal">{p.sku || "No SKU"}</p></div></div></td><td>{categories.find(c => c.id === p.category_id)?.name || "Uncategorised"}</td><td>{formatPrice(p.price)}</td><td><span className="status-badge">{stockLabels[p.stock_status]}</span></td><td>{p.published ? "Published" : "Draft"}{p.featured && <span className="block text-xs text-primary">Featured</span>}</td><td><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${p.title}`} onClick={() => edit(p)}><Pencil size={16} /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${p.title}`} onClick={() => setDeleting(p)}><Trash2 size={16} className="text-red-600" /></Button></div></td></tr>)}</tbody></table></div>}
    </div>
    <form className="admin-panel flex flex-wrap items-end gap-3" onSubmit={addCategory}><label className="flex-1 min-w-48 text-sm font-medium">Add a category<input className="field mt-2" maxLength={100} required placeholder="e.g. Power & Backup" value={categoryName} onChange={e => setCategoryName(e.target.value)} /></label><Button variant="outline" disabled={addingCategory}>{addingCategory ? "Adding…" : "Add category"}</Button></form>
    <Dialog open={open} onOpenChange={value => {if(!busy && !uploading) setOpen(value);}}><DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle><DialogDescription>Save as a draft or publish directly to the catalogue.</DialogDescription></DialogHeader>
      <form className="space-y-5" onSubmit={save}>
        <label className="form-label">Product name<input className="field" required maxLength={200} value={form.title} onChange={e => field("title",e.target.value)} /></label>
        <div className="grid sm:grid-cols-2 gap-4"><label className="form-label">SKU / model<input className="field" value={form.sku} onChange={e => field("sku",e.target.value)} /></label><label className="form-label">Category<select className="field" value={form.category_id} onChange={e => field("category_id",e.target.value)}><option value="">Uncategorised</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
        <div className="grid sm:grid-cols-2 gap-4"><label className="form-label">Price (USD, blank for quote)<input className="field" type="number" min="0" max="9999999999.99" step="0.01" value={form.price} onChange={e => field("price",e.target.value)} /></label><label className="form-label">Availability<select className="field" value={form.stock_status} onChange={e => field("stock_status",e.target.value as Product["stock_status"])}>{Object.entries(stockLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label></div>
        <label className="form-label">Description<textarea className="field min-h-28" value={form.description} onChange={e => field("description",e.target.value)} /></label>
        <label className="form-label">Specifications (one Name: Value per line)<textarea className="field min-h-24" placeholder={"Processor: Intel Core i5\nMemory: 16 GB\nWarranty: 12 months"} value={form.specifications} onChange={e => field("specifications",e.target.value)} /></label>
        <label className="form-label">Image URL<input className="field" placeholder="https://…" value={form.image_url} onChange={e => field("image_url",e.target.value)} /></label>
        <label className="flex gap-2 items-center text-sm text-primary cursor-pointer"><Upload size={16} /> {uploading ? "Uploading…" : "Or upload an image (JPG, PNG, WebP · max 5 MB)"}<input aria-label="Upload product image" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || busy} className="max-w-52 text-xs" onChange={e => upload(e.target.files?.[0])} /></label>
        <div className="flex gap-6"><label className="flex gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e => field("published",e.target.checked)} /> Published</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={e => field("featured",e.target.checked)} /> Featured on homepage</label></div>
        <div className="flex justify-end gap-3 border-t pt-5"><Button type="button" variant="outline" disabled={busy || uploading} onClick={() => setOpen(false)}>Cancel</Button><Button disabled={busy || uploading}>{busy ? "Saving…" : "Save product"}</Button></div>
      </form>
    </DialogContent></Dialog>
    <Dialog open={!!deleting} onOpenChange={v => {if(!v && !busy) setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle>Delete this product?</DialogTitle><DialogDescription>“{deleting?.title}” will be permanently removed from the catalogue. Existing inquiries will be retained.</DialogDescription></DialogHeader><div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={remove}>{busy ? "Deleting…" : "Delete product"}</Button></div></DialogContent></Dialog>
  </div>;
}

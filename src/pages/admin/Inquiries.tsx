import { useState } from "react";
import { useInquiries, Inquiry } from "@/lib/catalogue";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Mail, Inbox } from "lucide-react";
import { toast } from "sonner";

export default function Inquiries() {
  const {data = [],isLoading,error,refetch} = useInquiries();
  const [status,setStatus] = useState("");
  const [busy,setBusy] = useState<string | null>(null);
  const client = useQueryClient();
  const update = async (id: string, status: Inquiry["status"]) => {
    setBusy(id);
    try {const {error} = await supabase.from("inquiries").update({status}).eq("id",id).select("id").single(); if(error) throw error; await client.invalidateQueries({queryKey:["inquiries"]}); toast.success("Status updated");}
    catch {toast.error("Couldn't update inquiry.");} finally {setBusy(null);}
  };
  return <div className="space-y-7"><div><p className="eyebrow">CUSTOMER CONNECTIONS</p><h2 className="text-3xl font-semibold mt-2 tracking-tight">Inquiries & quotes</h2><p className="mt-2 text-muted-foreground">Turn a conversation into the right solution.</p></div>
    <select className="field w-auto" aria-label="Filter inquiries" value={status} onChange={e => setStatus(e.target.value)}><option value="">All inquiries</option>{["new","in_progress","quoted","resolved"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}</select>
    {isLoading ? <p role="status">Loading inquiries…</p> : error ? <div className="empty-state" role="alert"><h3>Couldn't load inquiries</h3><p>Check your database migration and access permissions.</p><Button onClick={() => refetch()}>Retry</Button></div> :
    !data.filter(i => !status || i.status === status).length ? <div className="empty-state admin-panel"><Inbox /><h3>No inquiries here yet.</h3><p>Requests from your website will appear here.</p></div> :
    <div className="space-y-4">{data.filter(i => !status || i.status === status).map(i => <article className="admin-panel" key={i.id}><div className="flex flex-wrap justify-between gap-4"><div><h3 className="font-semibold text-lg">{i.name}</h3><p className="text-sm text-muted-foreground">{i.email}{i.phone && ` · ${i.phone}`}</p><p className="eyebrow mt-3">{i.service || "General inquiry"} · {new Date(i.created_at).toLocaleDateString()}</p></div><select className="field w-auto self-start" aria-label={`Status for ${i.name}`} disabled={busy !== null} value={i.status} onChange={e => update(i.id,e.target.value as Inquiry["status"])}>{["new","in_progress","quoted","resolved"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}</select></div><p className="whitespace-pre-wrap text-sm text-slate-600 my-5">{i.message}</p><Button asChild variant="outline" size="sm"><a href={`mailto:${encodeURIComponent(i.email)}?subject=${encodeURIComponent("Your Compufy Investments inquiry")}`}><Mail size={15} /> Reply by email</a></Button></article>)}</div>}
  </div>;
}

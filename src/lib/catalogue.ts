import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInput = Database["public"]["Tables"]["products"]["Insert"];
export type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];
export const stockLabels = { in_stock: "In stock", low_stock: "Low stock", out_of_stock: "Out of stock" };
export const formatPrice = (price: number | null) => price === null ? "Price on request" :
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
export const safeImage = (url: string) => {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try { return new URL(url).protocol === "https:" ? url : "/placeholder.svg"; } catch { return "/placeholder.svg"; }
};
export function useProducts(admin = false) {
  return useQuery({
    queryKey: ["products", admin],
    queryFn: async () => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!admin) query = query.eq("published", true);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}
export function useInquiries() {
  return useQuery({
    queryKey: ["inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

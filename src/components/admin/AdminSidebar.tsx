import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Inbox, ArrowUpRight, LogOut, Command } from "lucide-react";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AdminSidebar = () => {
  const {user,signOut} = useAuth();
  return <Sidebar><SidebarHeader className="p-6 border-b"><div className="flex gap-3 items-center"><span className="bg-primary rounded-xl text-white p-2"><Command size={22} /></span><div><p className="font-bold tracking-tight">compufy<span className="text-primary">.</span></p><p className="text-xs text-muted-foreground">Business workspace</p></div></div></SidebarHeader>
    <SidebarContent className="p-3"><p className="eyebrow px-3 pt-5 pb-3">MANAGE</p><SidebarMenu>{[{label:"Overview",to:"/admin",icon:LayoutDashboard},{label:"Product catalogue",to:"/admin/products",icon:Package},{label:"Inquiries & quotes",to:"/admin/inquiries",icon:Inbox}].map(item => <SidebarMenuItem key={item.to}><SidebarMenuButton asChild className="h-11"><NavLink to={item.to} end={item.to === "/admin"} className={({isActive}) => isActive ? "!bg-primary/10 !text-primary font-semibold" : ""}><item.icon size={18} /><span>{item.label}</span></NavLink></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent>
    <SidebarFooter className="border-t p-4"><a href="/" className="flex gap-2 items-center text-sm p-2 text-muted-foreground">Visit website <ArrowUpRight size={15} /></a><p className="text-xs text-muted-foreground truncate p-2">{user?.email}</p><Button variant="ghost" className="justify-start" onClick={() => signOut().catch(() => toast.error("Sign out failed. Please try again."))}><LogOut size={16} /> Sign out</Button></SidebarFooter>
  </Sidebar>;
};

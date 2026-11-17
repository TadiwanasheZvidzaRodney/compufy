import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export const AdminLayout = () => {
  const { hasRole, loading } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-background px-4 gap-3">
            <SidebarTrigger />
            <h1 className="font-medium text-sm text-muted-foreground">Compufy Investments <span className="text-slate-300 mx-2">/</span> Admin portal</h1>
          </header>
          <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-auto">
            {!loading && !hasRole("admin") ? (
              <div className="max-w-lg mx-auto mt-16">
                <Card className="p-6 text-center">
                  <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                  <h2 className="text-lg font-semibold mb-2">Awaiting access</h2>
                  <p className="text-sm text-muted-foreground">
                     This workspace requires an administrator role.
                     Please ask the site owner to grant you access.
                  </p>
                </Card>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

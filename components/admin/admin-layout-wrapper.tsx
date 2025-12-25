"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-20 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center gap-2">
            {/* You can add breadcrumbs or page title here */}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-2 sm:p-3 md:p-4 lg:p-6 pt-0 overflow-x-hidden w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


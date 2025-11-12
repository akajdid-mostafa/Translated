"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // If user is null (not logged in) and not on login page, redirect to login
      if (!user && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
      // If user is logged in and tries to access /admin directly, redirect to /admin/dashboard
      else if (user && pathname === "/admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [user, loading, router, pathname]);

  // Only render children if not loading or if user is logged in (to prevent flicker)
  if (loading || (pathname !== "/admin/login" && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}

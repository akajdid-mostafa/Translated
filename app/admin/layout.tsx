"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Track if component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      // If user is logged in and tries to access /admin directly, immediately redirect to dashboard
      if (user && pathname === "/admin") {
        router.replace("/admin/dashboard");
        return;
      }
      // If user is null (not logged in) and not on login page, redirect to login
      if (!user && pathname !== "/admin/login") {
        router.replace("/admin/login");
        return;
      }
    }
  }, [user, loading, router, pathname, mounted]);

  // Show loading state while checking auth or before mount (prevents hydration mismatch)
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" suppressHydrationWarning></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, show loading (redirect is happening)
  if (!user && pathname !== "/admin/login") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" suppressHydrationWarning></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}

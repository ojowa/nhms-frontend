"use client";

import { useAuth } from "@/contexts/AuthContext";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDashboardPath } from "@/utils/getDashboardPath";


export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, accessToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; 

    if (user && accessToken) {
      const dashboardPath = getDashboardPath(user);
      router.replace(dashboardPath); // replace prevents back-loop
    }
  }, [user, accessToken, loading, router]);

  if (loading) return null; // or spinner

  return <>{children}</>;
}
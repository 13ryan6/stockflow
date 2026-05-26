"use client";

import { useSession } from "next-auth/react";

export function useRole() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  return {
    role,
    isAdmin: role === "ADMIN",
    isOwner: role === "OWNER" || role === "ADMIN",
    isSeller: role === "SELLER",
    canViewDashboard: role === "OWNER" || role === "ADMIN",
    canManageInventory: role === "OWNER" || role === "ADMIN",
    canCreateSales: true,
    canViewSettings: role === "ADMIN",
  };
}
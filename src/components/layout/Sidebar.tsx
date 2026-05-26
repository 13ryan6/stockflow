"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  TrendingUp,
  Truck,
  UserCog,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, ownerOnly: true },
  { label: "Inventario", href: "/inventory", icon: Package, ownerOnly: true },
  { label: "Proveedores", href: "/providers", icon: Truck, ownerOnly: true },
  { label: "Ventas", href: "/sales", icon: ShoppingCart, ownerOnly: false },
  { label: "Clientes", href: "/customers", icon: Users, ownerOnly: false },
  { label: "Reportes", href: "/reports", icon: BarChart3, ownerOnly: true },
  { label: "Usuarios", href: "/settings/users", icon: UserCog, ownerOnly: true },
  { label: "Configuración", href: "/settings", icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOwner, isAdmin } = useRole();

  const visibleItems = navItems.filter((item: any) => {
    if (item.adminOnly) return isAdmin;
    if (item.ownerOnly) return isOwner;
    return true;
  });

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-400">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg">StockFlow</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <p className="text-xs text-slate-600 text-center">StockFlow v1.0</p>
      </div>
    </aside>
  );
}
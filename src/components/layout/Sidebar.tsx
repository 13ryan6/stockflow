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
  Truck,
  UserCog,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",     href: "/",               icon: LayoutDashboard, ownerOnly: true },
  { label: "Inventario",    href: "/inventory",       icon: Package,         ownerOnly: true },
  { label: "Proveedores",   href: "/providers",       icon: Truck,           ownerOnly: true },
  { label: "Ventas",        href: "/sales",           icon: ShoppingCart,    ownerOnly: false },
  { label: "Clientes",      href: "/customers",       icon: Users,           ownerOnly: false },
  { label: "Reportes",      href: "/reports",         icon: BarChart3,       ownerOnly: true },
  { label: "Usuarios",      href: "/settings/users",  icon: UserCog,         ownerOnly: true },
  { label: "Configuración", href: "/settings",        icon: Settings,        adminOnly: true },
];

// Grupos visuales para separar la nav
const NAV_GROUPS = [
  { label: "Principal",   hrefs: ["/", "/inventory", "/providers"] },
  { label: "Operaciones", hrefs: ["/sales", "/customers", "/reports"] },
  { label: "Sistema",     hrefs: ["/settings/users", "/settings"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOwner, isAdmin } = useRole();

  const visibleItems = navItems.filter((item: any) => {
    if (item.adminOnly) return isAdmin;
    if (item.ownerOnly) return isOwner;
    return true;
  });

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="hidden md:flex w-[220px] flex-col bg-[#0f1117] text-slate-400 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-white/[0.06]">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        <div>
          <span className="text-white font-semibold text-[15px] tracking-tight">StockFlow</span>
        </div>
      </div>

      {/* Nav con grupos */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => {
          const groupItems = visibleItems.filter((item) =>
            group.hrefs.includes(item.href)
          );
          if (groupItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-5">
              <p className="text-[10px] font-medium tracking-[0.08em] uppercase text-slate-600 px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-100 ${
                        active
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          active ? "text-blue-400" : "text-slate-500"
                        }`}
                      />
                      {item.label}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-[10px] text-slate-700 font-medium tracking-wider uppercase">
          v1.0 · StockFlow
        </p>
      </div>
    </aside>
  );
}

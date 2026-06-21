import { db } from "@/lib/db";
import { Plus, ShoppingCart, DollarSign, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SalesTable } from "@/components/sales/SalesTable";

export default async function SalesPage() {
  const sales = await db.sale.findMany({
    include: {
      customer: { select: { name: true } },
      seller: { select: { name: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const completedCount = sales.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wide mb-1">
          OPERACIONES
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
            <p className="text-gray-500 text-sm mt-1">
              {totalSales} ventas registradas
            </p>
          </div>
          <Link href="/sales/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva venta
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
            <p className="text-xs text-gray-500">Total ventas</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Total facturado</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-xs text-gray-500">Completadas</p>
          </div>
        </div>
      </div>

      <SalesTable sales={sales} />
    </div>
  );
}
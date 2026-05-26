import { db } from "@/lib/db";
import { Plus } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sales.length} ventas registradas
          </p>
        </div>
        <Link href="/sales/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva venta
          </Button>
        </Link>
      </div>

      <SalesTable sales={sales} />
    </div>
  );
}
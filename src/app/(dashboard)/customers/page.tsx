import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerTable } from "@/components/customers/CustomerTable";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({
    where: { active: true },
    include: {
      _count: { select: { sales: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {customers.length} clientes registrados
          </p>
        </div>
        <Link href="/customers/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo cliente
          </Button>
        </Link>
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
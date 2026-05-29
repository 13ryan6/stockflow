import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DownloadPDFButton } from "@/components/sales/DownloadPDFButton";

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
  const [sale, business] = await Promise.all([
    db.sale.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        seller: true,
        items: {
          include: { product: true },
        },
      },
    }),
    db.businessConfig.findFirst(),
  ]);

  if (!sale) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sales">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sale.number}</h1>
            <p className="text-gray-500 text-sm">
              {format(new Date(sale.createdAt), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <DownloadPDFButton sale={sale} business={business} />
        </div>
      </div>

      {/* Info venta */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Cliente</p>
          <p className="font-semibold text-gray-900">
            {sale.customer?.name ?? "Consumidor final"}
          </p>
          {sale.customer?.ruc && <p className="text-sm text-gray-500">RUC: {sale.customer.ruc}</p>}
          {sale.customer?.phone && <p className="text-sm text-gray-500">{sale.customer.phone}</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Vendedor</p>
          <p className="font-semibold text-gray-900">{sale.seller.name}</p>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Productos</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{item.product.name}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">${Number(item.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">${Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${Number(sale.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA (15%)</span>
            <span>${Number(sale.tax).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>${Number(sale.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
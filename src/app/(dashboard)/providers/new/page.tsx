import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProviderForm } from "@/components/providers/ProviderForm";

export default function NewProviderPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/providers"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 tracking-wide mb-2"
        >
          <ChevronLeft className="w-3 h-3" />
          PROVEEDORES
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo proveedor</h1>
        <p className="text-gray-500 text-sm mt-1">
          Completa los datos del proveedor
        </p>
      </div>

      <ProviderForm />
    </div>
  );
}
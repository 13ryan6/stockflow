import { ProviderForm } from "@/components/providers/ProviderForm";

export default function NewProviderPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo proveedor</h1>
        <p className="text-gray-500 text-sm mt-1">
          Completa los datos del proveedor
        </p>
      </div>

      <ProviderForm />
    </div>
  );
}
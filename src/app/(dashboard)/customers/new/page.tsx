import { CustomerForm } from "@/components/customers/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo cliente</h1>
        <p className="text-gray-500 text-sm mt-1">
          Completa los datos del cliente
        </p>
      </div>

      <CustomerForm />
    </div>
  );
}
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditCustomerForm } from "@/components/customers/EditCustomerForm";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customer = await db.customer.findUnique({
    where: { id: params.id },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar cliente</h1>
        <p className="text-gray-500 text-sm mt-1">{customer.name}</p>
      </div>
      <EditCustomerForm customer={customer} />
    </div>
  );
}
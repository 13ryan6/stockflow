import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EditProviderForm } from "@/components/providers/EditProviderForm";

export default async function EditProviderPage({ params }: { params: { id: string } }) {
  const provider = await db.provider.findUnique({
    where: { id: params.id },
  });

  if (!provider) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar proveedor</h1>
        <p className="text-gray-500 text-sm mt-1">{provider.name}</p>
      </div>
      <EditProviderForm provider={provider} />
    </div>
  );
}
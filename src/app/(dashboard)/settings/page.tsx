import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BusinessConfigForm } from "@/components/settings/BusinessConfigForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "OWNER") redirect("/");

  const config = await db.businessConfig.findFirst();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración del negocio</h1>
        <p className="text-gray-500 text-sm mt-1">
          Estos datos aparecerán en las facturas PDF
        </p>
      </div>
      <BusinessConfigForm config={config} />
    </div>
  );
}
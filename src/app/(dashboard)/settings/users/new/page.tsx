import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewUserForm } from "@/components/settings/NewUserForm";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "ADMIN" && role !== "OWNER") redirect("/");

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo usuario</h1>
        <p className="text-gray-500 text-sm mt-1">
          Crea un vendedor o propietario
        </p>
      </div>
      <NewUserForm currentRole={role} />
    </div>
  );
}
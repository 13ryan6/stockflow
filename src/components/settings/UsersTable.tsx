"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserX, UserCheck } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  OWNER: "Propietario",
  SELLER: "Vendedor",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  OWNER: "bg-blue-100 text-blue-700 border-blue-200",
  SELLER: "bg-gray-100 text-gray-700 border-gray-200",
};

export function UsersTable({ users, currentUserId }: {
  users: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleActive(id: string, active: boolean) {
    if (id === currentUserId) return;
    setLoading(id);
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={user.active
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-700 border-red-200"
                    }
                  >
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {user.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading === user.id}
                      onClick={() => toggleActive(user.id, user.active)}
                      className={user.active
                        ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                        : "text-green-500 hover:text-green-700 hover:bg-green-50"
                      }
                    >
                      {user.active
                        ? <><UserX className="w-4 h-4 mr-1" />Desactivar</>
                        : <><UserCheck className="w-4 h-4 mr-1" />Activar</>
                      }
                    </Button>
                  )}
                  {user.id === currentUserId && (
                    <span className="text-xs text-gray-400">Tu cuenta</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
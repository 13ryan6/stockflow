import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Solo se permite cambiar `active`; cualquier otro campo se rechaza
const patchSchema = z.object({ active: z.boolean("`active` debe ser booleano") }).strict();

// NOTA: si actualizas a Next 15+, `params` es una Promise: `const { id } = await params;`
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const actor = session.user;
  if (actor.role !== "ADMIN" && actor.role !== "OWNER") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { id } = params;

  // Nadie puede activar/desactivar su propia cuenta (evita quedarse sin administrador)
  if (actor.id === id) {
    return NextResponse.json(
      { error: "No puedes cambiar el estado de tu propia cuenta" },
      { status: 403 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  try {
    const target = await db.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // Un OWNER solo gestiona vendedores; no puede tocar a otros OWNER ni a ADMIN
    if (actor.role === "OWNER" && target.role !== "SELLER") {
      return NextResponse.json({ error: "Solo puedes gestionar vendedores" }, { status: 403 });
    }

    // `select` explícito: nunca devolver el hash de la contraseña
    const user = await db.user.update({
      where: { id },
      data: { active: parsed.data.active },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("PATCH /api/users/[id]", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

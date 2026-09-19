import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createUserSchema = z.object({
  name: z.string("El nombre es requerido").trim().min(1, "El nombre es requerido").max(100),
  email: z.email("Email inválido"),
  // bcrypt solo usa los primeros 72 bytes de la contraseña
  password: z
    .string("La contraseña es requerida")
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .max(72, "La contraseña es demasiado larga"),
  role: z.enum(["ADMIN", "OWNER", "SELLER"], "Rol inválido").default("SELLER"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const actorRole = session.user.role;
  if (actorRole !== "ADMIN" && actorRole !== "OWNER") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const { name, email, password, role } = parsed.data;

  // Owner solo puede crear Sellers
  if (actorRole === "OWNER" && role !== "SELLER") {
    return NextResponse.json({ error: "Solo puedes crear vendedores" }, { status: 403 });
  }

  try {
    const user = await db.user.create({
      data: { name, email, password: await bcrypt.hash(password, 12), role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "El email ya existe" }, { status: 400 });
    }
    console.error("POST /api/users", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}

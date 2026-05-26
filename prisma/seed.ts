import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient, Role } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Creando datos iniciales...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@stockflow.com" },
    update: {},
    create: {
      name: "Admin Sistema",
      email: "admin@stockflow.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const ownerPassword = await bcrypt.hash("owner123", 12);
  await prisma.user.upsert({
    where: { email: "owner@stockflow.com" },
    update: {},
    create: {
      name: "Juan Propietario",
      email: "owner@stockflow.com",
      password: ownerPassword,
      role: Role.OWNER,
    },
  });

  const sellerPassword = await bcrypt.hash("seller123", 12);
  await prisma.user.upsert({
    where: { email: "seller@stockflow.com" },
    update: {},
    create: {
      name: "María Vendedora",
      email: "seller@stockflow.com",
      password: sellerPassword,
      role: Role.SELLER,
    },
  });

  const category = await prisma.category.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General" },
  });

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      { name: "Coca Cola 600ml", price: 1.25, stock: 48, minStock: 12, sku: "COCA-600", categoryId: category.id },
      { name: "Agua 500ml", price: 0.75, stock: 3, minStock: 10, sku: "AGUA-500", categoryId: category.id },
      { name: "Arroz 5 libras", price: 3.50, stock: 20, minStock: 5, sku: "ARROZ-5", categoryId: category.id },
    ],
  });

  console.log("✅ Listo!");
  console.log("👤 admin@stockflow.com / admin123");
  console.log("👤 owner@stockflow.com / owner123");
  console.log("👤 seller@stockflow.com / seller123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
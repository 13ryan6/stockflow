import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SriElectronicInvoicingService } from "@/modules/sri";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const sriService = new SriElectronicInvoicingService();
    const result = await sriService.processInvoice(body);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message ?? "Error al procesar la facturación electrónica",
        code: error?.code,
        details: error?.details,
        messages: error?.messages,
      },
      { status: error?.status ?? 500 },
    );
  }
}
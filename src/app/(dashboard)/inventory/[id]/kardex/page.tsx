"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PackageMinus, PackagePlus } from "lucide-react";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  notes: string | null;
  createdAt: string;
  user: { name: string };
  sale: { number: string } | null;
}

export default function KardexPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productName = searchParams.get("name") ?? "Producto";

  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/kardex?productId=${id}`)
      .then((r) => r.json())
      .then((res) => {
        setMovements(res.data ?? []);
        setLoading(false);
      });
  }, [id]);

  const typeBadge = (type: string) => {
    const map: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
      SALE:     { label: "Venta",      variant: "destructive" },
      PURCHASE: { label: "Compra",     variant: "default" },
      ADJUST:   { label: "Ajuste",     variant: "secondary" },
      RETURN:   { label: "Devolución", variant: "secondary" },
    };
    const cfg = map[type] ?? { label: type, variant: "secondary" };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Kardex</h1>
          <p className="text-muted-foreground text-sm">{productName}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando movimientos...</p>
      ) : movements.length === 0 ? (
        <p className="text-muted-foreground">No hay movimientos registrados para este producto.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Stock Antes</TableHead>
                <TableHead className="text-right">Stock Después</TableHead>
                <TableHead>Venta</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm">
                    {new Date(m.createdAt).toLocaleString("es-EC")}
                  </TableCell>
                  <TableCell>{typeBadge(m.type)}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className="flex items-center justify-end gap-1">
                      {m.type === "SALE" ? (
                        <PackageMinus className="h-4 w-4 text-red-500" />
                      ) : (
                        <PackagePlus className="h-4 w-4 text-green-500" />
                      )}
                      {m.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{m.stockBefore}</TableCell>
                  <TableCell className="text-right font-semibold">{m.stockAfter}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.sale?.number ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">{m.user?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.notes ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
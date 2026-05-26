"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type Category = { id: string; name: string };
type Provider = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  price: any;
  stock: number;
  minStock: number;
  sku: string | null;
  categoryId: string | null;
  providerId: string | null;
  description: string | null;
};

export function EditProductForm({ product, categories, providers }: {
  product: Product;
  categories: Category[];
  providers: Provider[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: product.name,
    price: String(product.price),
    stock: String(product.stock),
    minStock: String(product.minStock),
    sku: product.sku ?? "",
    categoryId: product.categoryId ?? "",
    providerId: product.providerId ?? "",
    description: product.description ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        minStock: parseInt(form.minStock),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al actualizar");
      setLoading(false);
    } else {
      router.push("/inventory");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU / Código</Label>
          <Input id="sku" name="sku" value={form.sku} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio *</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="providerId">Proveedor</Label>
          <select
            id="providerId"
            name="providerId"
            value={form.providerId}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">Sin proveedor</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStock">Stock mínimo</Label>
          <Input id="minStock" name="minStock" type="number" min="0" value={form.minStock} onChange={handleChange} />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Guardar cambios"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, DollarSign, Boxes, Tag } from "lucide-react";

type Category = { id: string; name: string };

export function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    minStock: "5",
    sku: "",
    categoryId: "",
    description: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/products", {
      method: "POST",
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
      setError(data.error ?? "Error al crear producto");
      setLoading(false);
    } else {
      router.push("/inventory");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Sección: Información básica */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Información básica</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del producto *</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Ej: Coca Cola 600ml" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="flex items-center gap-1">
              <Tag className="w-3 h-3" /> SKU / Código
            </Label>
            <Input id="sku" name="sku" value={form.sku} onChange={handleChange} placeholder="Ej: COCA-600" />
          </div>
        </div>
      </div>

      {/* Sección: Precio y categoría */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Precio y categoría</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="price">Precio de venta *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="0.00"
                className="pl-7"
              />
            </div>
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
        </div>
      </div>

      {/* Sección: Inventario */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="bg-orange-100 p-1.5 rounded-lg">
            <Boxes className="w-4 h-4 text-orange-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Control de inventario</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="stock">Stock inicial *</Label>
            <Input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required placeholder="0" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStock">
              Stock mínimo
              <span className="text-gray-400 font-normal ml-1">— alerta cuando baje de aquí</span>
            </Label>
            <Input id="minStock" name="minStock" type="number" min="0" value={form.minStock} onChange={handleChange} placeholder="5" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Guardar producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

type Config = {
  id: string;
  name: string;
  ruc: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
} | null;

export function BusinessConfigForm({ config }: { config: Config }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: config?.name ?? "",
    ruc: config?.ruc ?? "",
    phone: config?.phone ?? "",
    address: config?.address ?? "",
    email: config?.email ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/business-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al guardar");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nombre del negocio *</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Ej: Tienda El Sol"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ruc">RUC del negocio</Label>
          <Input
            id="ruc"
            name="ruc"
            value={form.ruc}
            onChange={handleChange}
            placeholder="1234567890001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="0999999999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email del negocio</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="negocio@gmail.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Av. Principal y Calle 1"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">✅ Configuración guardada correctamente</div>}

      <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
        ) : (
          <><Save className="mr-2 h-4 w-4" />Guardar configuración</>
        )}
      </Button>
    </form>
  );
}
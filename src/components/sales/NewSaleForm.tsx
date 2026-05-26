"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus, Trash2, ShoppingCart, Loader2, UserPlus, X } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: any;
  stock: number;
  sku: string | null;
  category: { name: string } | null;
};

type Customer = {
  id: string;
  name: string;
  ruc: string | null;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

const IVA = 0.15;

export function NewSaleForm({ products, customers: initialCustomers, sellerId }: {
  products: Product[];
  customers: Customer[];
  sellerId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", ruc: "", address: "" });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(product: Product) {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      setCart(cart.map((i) =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        stock: product.stock,
      }]);
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    ));
  }

  function removeFromCart(productId: string) {
    setCart(cart.filter((i) => i.productId !== productId));
  }

  async function handleSaveCustomer() {
    if (!newCustomer.name) {
      setCustomerError("El nombre es requerido");
      return;
    }
    setSavingCustomer(true);
    setCustomerError("");

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    });

    const data = await res.json();

    if (!res.ok) {
      setCustomerError(data.error ?? "Error al crear cliente");
      setSavingCustomer(false);
    } else {
      const created = data.data;
      setCustomers([...customers, { id: created.id, name: created.name, ruc: created.ruc }]);
      setCustomerId(created.id);
      setNewCustomer({ name: "", phone: "", ruc: "", address: "" });
      setShowNewCustomer(false);
      setSavingCustomer(false);
    }
  }

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = subtotal * IVA;
  const total = subtotal + tax;

  async function handleSubmit() {
    if (cart.length === 0) {
      setError("Agrega al menos un producto");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerId || null,
        sellerId,
        notes,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        tax,
        total,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al crear venta");
      setLoading(false);
    } else {
      router.push(`/sales/${data.data.id}`);
      router.refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Productos */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Productos</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar producto..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">${Number(product.price).toFixed(2)}</p>
                  <Plus className="w-4 h-4 text-blue-400 ml-auto" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carrito */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Carrito</h2>
            {cart.length > 0 && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200" variant="outline">
                {cart.length}
              </Badge>
            )}
          </div>

          {/* Cliente */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Cliente</label>
              <button
                onClick={() => setShowNewCustomer(!showNewCustomer)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                {showNewCustomer ? (
                  <><X className="w-3 h-3" />Cancelar</>
                ) : (
                  <><UserPlus className="w-3 h-3" />Nuevo cliente</>
                )}
              </button>
            </div>

            {!showNewCustomer ? (
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Consumidor final</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Input
                  placeholder="Nombre *"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
                <Input
                  placeholder="Teléfono"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
                <Input
                  placeholder="RUC / Cédula"
                  value={newCustomer.ruc}
                  onChange={(e) => setNewCustomer({ ...newCustomer, ruc: e.target.value })}
                />
                <Input
                  placeholder="Dirección"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
                {customerError && (
                  <p className="text-xs text-red-600">{customerError}</p>
                )}
                <Button
                  onClick={handleSaveCustomer}
                  disabled={savingCustomer}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                >
                  {savingCustomer ? (
                    <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Guardando...</>
                  ) : (
                    "Guardar cliente"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Items del carrito */}
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Agrega productos</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)}>
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Totales */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 pt-3 space-y-1 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IVA (15%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Notas</label>
            <Input
              placeholder="Notas opcionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}

          <Button
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
            ) : (
              `Confirmar venta $${total.toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
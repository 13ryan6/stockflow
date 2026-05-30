import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    seguridad: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 1,
    },
  },
};

const BASE_URL = "https://stockflow-7zus.vercel.app";

export default function () {

  console.log("🔐 PRUEBA 1 — Acceso sin autenticación a páginas protegidas");

  // Intentar acceder al dashboard sin login
  const dashboard = http.get(`${BASE_URL}/`, {
    redirects: 0,
  });
  check(dashboard, {
    "dashboard redirige al login sin auth": (r) => r.status === 307 || r.status === 302 || r.status === 308,
  });
  console.log(`Dashboard sin auth: ${dashboard.status}`);

  // Intentar acceder al inventario sin login
  const inventory = http.get(`${BASE_URL}/inventory`, {
    redirects: 0,
  });
  check(inventory, {
    "inventario redirige sin auth": (r) => r.status === 307 || r.status === 302 || r.status === 308,
  });
  console.log(`Inventario sin auth: ${inventory.status}`);

  // Intentar acceder a ventas sin login
  const sales = http.get(`${BASE_URL}/sales`, {
    redirects: 0,
  });
  check(sales, {
    "ventas redirige sin auth": (r) => r.status === 307 || r.status === 302 || r.status === 308,
  });
  console.log(`Ventas sin auth: ${sales.status}`);

  // Intentar acceder a reportes sin login
  const reports = http.get(`${BASE_URL}/reports`, {
    redirects: 0,
  });
  check(reports, {
    "reportes redirige sin auth": (r) => r.status === 307 || r.status === 302 || r.status === 308,
  });
  console.log(`Reportes sin auth: ${reports.status}`);

  console.log("🔐 PRUEBA 2 — Acceso sin autenticación a APIs");

  // Intentar llamar API de productos sin token
  const apiProducts = http.get(`${BASE_URL}/api/products`);
  check(apiProducts, {
    "API productos bloquea sin auth": (r) => r.status === 401 || r.status === 403,
  });
  console.log(`API productos sin auth: ${apiProducts.status}`);

  // Intentar llamar API de clientes sin token
  const apiCustomers = http.get(`${BASE_URL}/api/customers`);
  check(apiCustomers, {
    "API clientes bloquea sin auth": (r) => r.status === 401 || r.status === 403,
  });
  console.log(`API clientes sin auth: ${apiCustomers.status}`);

  // Intentar llamar API de ventas sin token
  const apiSales = http.get(`${BASE_URL}/api/sales`);
  check(apiSales, {
    "API ventas bloquea sin auth": (r) => r.status === 401 || r.status === 403,
  });
  console.log(`API ventas sin auth: ${apiSales.status}`);

  // Intentar llamar API de usuarios sin token
  const apiUsers = http.get(`${BASE_URL}/api/users`);
  check(apiUsers, {
    "API usuarios bloquea sin auth": (r) => r.status === 401 || r.status === 403,
  });
  console.log(`API usuarios sin auth: ${apiUsers.status}`);
}
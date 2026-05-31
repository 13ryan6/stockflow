import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
};

const BASE_URL = "https://stockflow-7zus.vercel.app";

function getCSRFAndLogin(email, password) {
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  const csrfToken = csrfRes.json("csrfToken");

  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      email,
      password,
      csrfToken,
      json: "true",
    },
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cookies: csrfRes.cookies,
      redirects: 0,
    }
  );

  return loginRes.cookies;
}

export default function () {
  console.log("🔐 Iniciando sesión como SELLER...");
  const sellerCookies = getCSRFAndLogin("seller@stockflow.com", "seller123");

  // 1. Seller intenta crear un producto (solo Owner/Admin puede)
  console.log("🚨 PRUEBA 1 — Seller intenta crear producto");
  const createProduct = http.post(
    `${BASE_URL}/api/products`,
    JSON.stringify({ name: "Hack Product", price: 1.00, stock: 10 }),
    {
      headers: { "Content-Type": "application/json" },
      cookies: sellerCookies,
    }
  );
  console.log(`Crear producto como Seller: ${createProduct.status}`);
  check(createProduct, {
    "Seller NO puede crear productos": (r) => r.status === 403 || r.status === 401,
  });

  // 2. Seller intenta crear un usuario (solo Owner/Admin puede)
  console.log("🚨 PRUEBA 2 — Seller intenta crear usuario");
  const createUser = http.post(
    `${BASE_URL}/api/users`,
    JSON.stringify({ name: "Hacker", email: "hacker@test.com", password: "hack123", role: "ADMIN" }),
    {
      headers: { "Content-Type": "application/json" },
      cookies: sellerCookies,
    }
  );
  console.log(`Crear usuario como Seller: ${createUser.status}`);
  check(createUser, {
    "Seller NO puede crear usuarios": (r) => r.status === 403 || r.status === 401,
  });

  // 3. Seller intenta eliminar un producto
  console.log("🚨 PRUEBA 3 — Seller intenta eliminar producto");
  const deleteProduct = http.del(
    `${BASE_URL}/api/products/cualquier-id`,
    null,
    { cookies: sellerCookies }
  );
  console.log(`Eliminar producto como Seller: ${deleteProduct.status}`);
  check(deleteProduct, {
    "Seller NO puede eliminar productos": (r) => r.status === 403 || r.status === 401 || r.status === 404 || r.status === 405,
  });

  // 4. Seller intenta desactivar un usuario
  console.log("🚨 PRUEBA 4 — Seller intenta desactivar usuario");
  const deactivateUser = http.patch(
    `${BASE_URL}/api/users/cualquier-id`,
    JSON.stringify({ active: false }),
    {
      headers: { "Content-Type": "application/json" },
      cookies: sellerCookies,
    }
  );
  console.log(`Desactivar usuario como Seller: ${deactivateUser.status}`);
  check(deactivateUser, {
    "Seller NO puede desactivar usuarios": (r) => r.status === 403 || r.status === 401 || r.status === 404,
  });
}
import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
};

const BASE_URL = "https://stockflow-7zus.vercel.app";

function login(email, password) {

  // Obtener CSRF
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  const csrfToken = csrfRes.json("csrfToken");

  // Login NextAuth
  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      email,
      password,
      csrfToken,
      json: "true",
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cookies: csrfRes.cookies,
      redirects: 0,
    }
  );

  console.log(`LOGIN STATUS: ${loginRes.status}`);

  return loginRes.cookies;
}

export default function () {

  console.log("⚠️ PRUEBA STORED XSS");

  const cookies = login(
    "owner@stockflow.com",
    "owner123"
  );

  // Payloads XSS almacenados
  const payloads = [
    "<script>alert('stored-xss')</script>",
    "<img src=x onerror=alert('stored-xss')>",
    "<svg/onload=alert('stored-xss')>",
    "<iframe src='javascript:alert(1)'></iframe>",
  ];

  payloads.forEach((payload) => {

    // Crear producto malicioso
    const res = http.post(
      `${BASE_URL}/api/products`,
      JSON.stringify({
        name: payload,
        sku: payload,
        price: 1,
        stock: 1,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        cookies,
      }
    );

    console.log(`Payload: ${payload}`);
    console.log(`CREATE STATUS: ${res.status}`);

    check(res, {

      // Backend estable
      "No crash 500": (r) => r.status !== 500,

      // Inserción controlada
      "Respuesta válida": (r) =>
        r.status === 201 ||
        r.status === 400 ||
        r.status === 403,
    });
  });

  console.log("====================================");
  console.log("🔍 AHORA PRUEBA MANUAL:");
  console.log("1. Abre el inventario en navegador");
  console.log("2. Busca los productos creados");
  console.log("3. Verifica si:");
  console.log("   ✅ Se muestran como texto");
  console.log("   🚨 O se ejecuta JavaScript");
  console.log("====================================");
}
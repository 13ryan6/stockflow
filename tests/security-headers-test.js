import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
};

const BASE_URL = "https://stockflow-7zus.vercel.app";

export default function () {

  console.log("🛡️ SECURITY HEADERS TEST");

  const res = http.get(BASE_URL);

  console.log(`STATUS: ${res.status}`);

  // Mostrar headers completos
  console.log("=================================");
  console.log(JSON.stringify(res.headers, null, 2));
  console.log("=================================");

  check(res, {

    // Seguridad HTTPS
    "Tiene HSTS": (r) =>
      r.headers["Strict-Transport-Security"] !== undefined,

    // Prevención clickjacking
    "Tiene X-Frame-Options": (r) =>
      r.headers["X-Frame-Options"] !== undefined,

    // Protección MIME
    "Tiene X-Content-Type-Options": (r) =>
      r.headers["X-Content-Type-Options"] !== undefined,

    // CSP
    "Tiene CSP": (r) =>
      r.headers["Content-Security-Policy"] !== undefined,

    // Política referrer
    "Tiene Referrer-Policy": (r) =>
      r.headers["Referrer-Policy"] !== undefined,

    // Permissions Policy
    "Tiene Permissions-Policy": (r) =>
      r.headers["Permissions-Policy"] !== undefined,
  });
}
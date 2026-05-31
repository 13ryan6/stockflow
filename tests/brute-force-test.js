import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  iterations: 20,
};

const BASE_URL = "https://stockflow-7zus.vercel.app";

// Contraseñas comunes que un atacante probaría
const passwords = [
  "123456",
  "password",
  "admin",
  "12345678",
  "qwerty",
  "abc123",
  "111111",
  "letmein",
  "monkey",
  "1234567890",
  "password123",
  "admin123",
  "root",
  "test",
  "usuario",
  "contraseña",
  "stockflow",
  "owner",
  "owner1234",
  "123456789",
];

export default function () {
  const password = passwords[Math.floor(Math.random() * passwords.length)];

  // Obtener CSRF token
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  const csrfToken = csrfRes.json("csrfToken");

  // Intentar login con contraseña incorrecta
  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      email: "owner@stockflow.com",
      password: password,
      csrfToken: csrfToken,
      json: "true",
    },
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cookies: csrfRes.cookies,
      redirects: 0,
    }
  );

  console.log(`Intento con "${password}": ${loginRes.status}`);

  check(loginRes, {
    "Fuerza bruta bloqueada o redirigida": (r) =>
      r.status === 401 ||
      r.status === 403 ||
      r.status === 302 ||
      r.status === 307,
  });

  sleep(0.5);
}
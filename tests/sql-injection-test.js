import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 3,
  iterations: 30,
};

const BASE_URL = "https://stockflow-7zus.vercel.app";

function getCSRFAndLogin(email, password) {
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  const csrfToken = csrfRes.json("csrfToken");  
  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    { email, password, csrfToken, json: "true" },
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cookies: csrfRes.cookies,
      redirects: 0,
    }
  );
  return loginRes.cookies;
}

// Payloads agresivos de SQL Injection
const sqlPayloads = [
  // Clásicos
  "' OR '1'='1",
  "' OR '1'='1' --",
  "' OR '1'='1' /*",
  "' OR 1=1--",
  "' OR 1=1#",
  "' OR 1=1/*",
  "') OR ('1'='1",
  // DROP
  "'; DROP TABLE users; --",
  "'; DROP TABLE products; --",
  "'; DROP TABLE sales; --",
  "1; DROP TABLE users--",
  // UNION
  "' UNION SELECT null, null, null--",
  "' UNION SELECT username, password FROM users--",
  "' UNION ALL SELECT null, table_name FROM information_schema.tables--",
  "1 UNION SELECT * FROM users--",
  // Blind SQL Injection
  "' AND 1=1--",
  "' AND 1=2--",
  "' AND SLEEP(5)--",
  "1; WAITFOR DELAY '0:0:5'--",
  "' AND (SELECT * FROM users)--",
  // Stacked queries
  "'; SELECT * FROM users--",
  "'; INSERT INTO users VALUES ('hacker','hacker@hack.com','hack')--",
  "'; UPDATE users SET role='ADMIN'--",
  "'; DELETE FROM users--",
  // XSS combinado
  "<script>alert('xss')</script>",
  "<img src=x onerror=alert('xss')>",
  "javascript:alert('xss')",
  // Path traversal
  "../../etc/passwd",
  "../../../windows/system32",
  // NoSQL
  "{ $gt: '' }",
  "{ $where: 'sleep(5000)' }",
  // Especiales
  "NULL",
  "undefined",
  "true OR true",
  "%27 OR %271%27=%271",
];

export default function () {
  const cookies = getCSRFAndLogin("owner@stockflow.com", "owner123");
  const payload = sqlPayloads[Math.floor(Math.random() * sqlPayloads.length)];

  // Ataque en nombre de producto
  const productRes = http.post(
    `${BASE_URL}/api/products`,
    JSON.stringify({ name: payload, price: 1.00, stock: 1, sku: payload }),
    {
      headers: { "Content-Type": "application/json" },
      cookies,
    }
  );

  check(productRes, {
    "No crash 500 en producto": (r) => r.status !== 500,
    "Respuesta controlada en producto": (r) =>
      r.status === 201 || r.status === 400 || r.status === 401 || r.status === 403,
  });

  // Ataque en nombre de cliente
  const customerRes = http.post(
    `${BASE_URL}/api/customers`,
    JSON.stringify({ name: payload, email: `${Math.random()}@test.com`, phone: payload }),
    {
      headers: { "Content-Type": "application/json" },
      cookies,
    }
  );

  check(customerRes, {
    "No crash 500 en cliente": (r) => r.status !== 500,
    "Respuesta controlada en cliente": (r) =>
      r.status === 201 || r.status === 400 || r.status === 401 || r.status === 403,
  });

  // Ataque en login
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
  const csrfToken = csrfRes.json("csrfToken");
  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    { email: payload, password: payload, csrfToken, json: "true" },
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cookies: csrfRes.cookies,
      redirects: 0,
    }
  );

  check(loginRes, {
    "Login no vulnerable": (r) =>
      r.status === 401 || r.status === 302 || r.status === 307,
  });

  console.log(`Payload: "${payload}" → Producto:${productRes.status} Cliente:${customerRes.status} Login:${loginRes.status}`);
}
import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  scenarios: {
    resistencia: {
      executor: "constant-vus",
      vus: 10,
      duration: "30m",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = "https://stockflow-7zus.vercel.app";

export default function () {
  const loginPage = http.get(`${BASE_URL}/login`);
  check(loginPage, {
    "login page carga OK": (r) => r.status === 200,
  });
  sleep(1);

  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    JSON.stringify({
      email: "owner@stockflow.com",
      password: "owner123",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(loginRes, {
    "login responde": (r) => r.status < 500,
  });
  sleep(1);

  const productsRes = http.get(`${BASE_URL}/api/products`);
  check(productsRes, {
    "products API responde": (r) => r.status < 500,
  });
  sleep(1);

  const customersRes = http.get(`${BASE_URL}/api/customers`);
  check(customersRes, {
    "customers API responde": (r) => r.status < 500,
  });
  sleep(1);
}
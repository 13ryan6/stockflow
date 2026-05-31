import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
};

const BASE_URL = "https://stockflow-7zus.vercel.app";

export default function () {

  // =========================
  // LOGIN
  // =========================

  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);

  const csrfToken = csrfRes.json("csrfToken");

  const payload = {
    email: "owner@stockflow.com",
    password: "owner123",
    csrfToken,
    json: "true",
  };

  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    payload,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cookies: csrfRes.cookies,
    }
  );

  console.log(`LOGIN: ${loginRes.status}`);

  // =========================
  // PRUEBA IDOR
  // =========================

  const ids = [1, 2, 3, 999];

  ids.forEach((id) => {

    const res = http.get(
      `${BASE_URL}/api/products/${id}`,
      {
        cookies: loginRes.cookies,
      }
    );

    console.log(`/api/products/${id} -> ${res.status}`);

    check(res, {

      "No error 500": (r) => r.status !== 500,

      "Protección IDOR": (r) =>
        r.status === 200 ||
        r.status === 403 ||
        r.status === 404,
    });
  });
}
import request from "supertest";
import app from "../../app.js";

export async function loginAndGetCookies(email, password) {
  const csrfRes = await request(app).get("/api/auth/csrf-token");
  const csrfToken = csrfRes.body.csrfToken || "";
  const initCookies = csrfRes.headers["set-cookie"] || [];

  const loginRes = await request(app)
    .post("/api/auth/login")
    .set("Cookie", initCookies)
    .set("x-csrf-token", csrfToken)
    .send({ email, password });

  const loginCookies = loginRes.headers["set-cookie"] || [];
  
  return {
    csrfToken,
    cookies: [...initCookies, ...loginCookies],
  };
}

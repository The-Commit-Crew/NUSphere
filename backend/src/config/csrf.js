import { doubleCsrf } from "csrf-csrf";

const csrfOptions = {
  getSecret: () => process.env.CSRF_SECRET || "default_secret",
  cookieName: "csrfToken",
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  },
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getSessionIdentifier: () => "anonymous",
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
};

export const {
  doubleCsrfProtection,
  invalidCsrfTokenError,
  generateCsrfToken,
} = doubleCsrf(csrfOptions);

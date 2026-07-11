import { invalidCsrfTokenError } from "../config/csrf.js";

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    return res.status(403).json({
      message: "Security token expired or invalid. Please refresh the page.",
    });
  }
  res.status(500).json({
    message: err.message || "An internal server error occurred.",
  });
};

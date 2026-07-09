import jwt from "jsonwebtoken";
export const authenticateToken = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return next();
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (!error) {
      req.user = user;
    }
    next();
  });
};

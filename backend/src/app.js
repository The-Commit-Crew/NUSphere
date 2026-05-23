import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import authRoutes from "./routes/authRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "NUSphere API running...",
  });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default app;

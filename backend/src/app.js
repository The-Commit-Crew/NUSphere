import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "NUSphere API running...",
  });
});

export default app;

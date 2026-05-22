import { getAllTopics, getTopicById } from "../controllers/topicController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllTopics);
router.get("/:id", getTopicById);

export default router;

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { addComment } from "../controllers/commentController.js";

const router = express.Router();

router.post("/", authMiddleware, addComment);

export default router;

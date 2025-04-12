import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { toggleLike } from "../controllers/likeController.js";

const router = express.Router();

router.post("/", authMiddleware, toggleLike);

export default router;

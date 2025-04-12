import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import flexAuthMiddleware from "../middlewares/flexAuthMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, uploadMiddleware, createPost);
router.get("/", flexAuthMiddleware, getPosts); // Publicly viewable posts
router.get("/:id", flexAuthMiddleware, getPostById); // Publicly viewable single post
router.put("/:id", authMiddleware, uploadMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;

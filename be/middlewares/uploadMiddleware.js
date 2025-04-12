import multer from "multer";
import { supabase } from "../config/supabaseClient.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const uploadMiddleware = (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return next();
    }

    const { file } = req;
    const userId = req.user?.id;
    const fileName = `${userId}-${Date.now()}-${file.originalname}`;
    const filePath = `images/${fileName}`;

    try {
      const { error: storageError } = await supabase.storage
        .from("posts")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (storageError) {
        console.error("Upload error:", storageError);
        return res.status(500).json({ message: "Upload failed" });
      }
      const publicUrl = supabase.storage.from("posts").getPublicUrl(filePath)
        .data.publicUrl;

      req.imageUrl = publicUrl;

      next();
    } catch (e) {
      console.error("Supabase upload failed:", e);
      res.status(500).json({ message: "Internal error" });
    }
  });
};

export default uploadMiddleware;

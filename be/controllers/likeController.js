// controllers/likeController.js
import { supabase } from "../config/supabaseClient.js";

export const toggleLike = async (req, res) => {
  const { postId } = req.body; // Get post ID from URL parameter
  const userId = req.user.id;

  try {
    // Check if the like already exists
    const { data: existingLike, error: findError } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle(); // Returns the like object or null

    if (findError && findError.code !== "PGRST116") {
      // Ignore 'No rows found'
      console.error("Error checking like:", findError);
      return res.status(500).json({ message: "Database error checking like" });
    }

    if (existingLike) {
      // Like exists, so delete it (unlike)
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);

      if (deleteError) {
        console.error("Error unliking post:", deleteError);
        return res.status(500).json({ message: "Failed to unlike post" });
      }
      res.status(200).json({ message: "Post unliked", liked: false });
    } else {
      // Like doesn't exist, so create it (like)
      // Optional: Check if post exists before liking
      const { data: postExists, error: postCheckError } = await supabase
        .from("posts")
        .select("id")
        .eq("id", postId)
        .maybeSingle();

      if (postCheckError || !postExists) {
        return res.status(404).json({ message: "Post not found, cannot like" });
      }

      const { error: insertError } = await supabase
        .from("likes")
        .insert([{ user_id: userId, post_id: postId }]);

      if (insertError) {
        // Handle potential errors like foreign key violation if post_id is invalid
        console.error("Error liking post:", insertError);
        return res.status(500).json({ message: "Failed to like post" });
      }
      res.status(201).json({ message: "Post liked", liked: true });
    }
  } catch (error) {
    console.error("Server error toggling like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

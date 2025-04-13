import { supabase } from "../config/supabaseClient.js";

// Add Comment
export const addComment = async (req, res) => {
  const { postId, content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: "Comment content cannot be empty" });
  }

  try {
    // Optional: Check if post exists before commenting
    const { data: postExists, error: postCheckError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .maybeSingle();

    if (postCheckError || !postExists) {
      return res
        .status(404)
        .json({ message: "Post not found, cannot comment" });
    }

    // Insert the comment
    const { data, error } = await supabase
      .from("comments")
      .insert([{ user_id: userId, post_id: postId, content }])
      .select(
        `
                id, content, created_at, updated_at,
                user: users ( id, username )
            `
      ) // Return the new comment with user details
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return res.status(500).json({ message: "Failed to add comment" });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Server error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
                id, content, created_at, updated_at,
                user: users ( id, username )
            `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ message: "Failed to fetch comments" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error("Server error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    // Delete the comment only if the user ID matches
    const { data, error, count } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId); // Important: Ensure ownership

    if (error) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ message: "Failed to delete comment" });
    }

    if (count === 0) {
      // Comment not found or user didn't own it
      return res.status(404).json({
        message: "Comment not found or you do not have permission to delete it",
      });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Server error deleting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

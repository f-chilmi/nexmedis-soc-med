import { supabase } from "../config/supabaseClient.js";

export const createPost = async (req, res) => {
  const { title, content } = req.body;

  const image = req.file; // From multer
  const userId = req.user.id; // From authMiddleware

  if (!title || !content) {
    return res
      .status(400)
      .json({ message: "Post title and content are required" });
  }

  try {
    let imageUrl = null;
    if (image) {
      imageUrl = req.imageUrl;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([{ user_id: userId, title, content, image_url: imageUrl }])
      .select(
        `
              id, title, content, image_url, created_at, updated_at,
              users!posts_user_id_fkey ( id, username )
          `
      )
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ message: "Failed to create post" });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Server error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPosts = async (req, res) => {
  // Pagination parameters (optional)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const userId = req.user?.id; // Assuming req.user is set by authMiddleware

  try {
    // Fetch posts with associated user data
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(
        `
        id,
        title,
        content,
        image_url,
        created_at,
        updated_at,
        user_id,
        user: users!posts_user_id_fkey ( id, username )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return res.status(500).json({ message: "Failed to fetch posts" });
    }

    // Fetch likes, comments counts, and isLiked status for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const { count: likeCount, error: likeError } = await supabase
          .from("likes")
          .select("post_id", { count: "exact", head: true })
          .eq("post_id", post.id);

        if (likeError) {
          console.error(
            `Error fetching like count for post ${post.id}:`,
            likeError
          );
        }

        const { count: commentCount, error: commentError } = await supabase
          .from("comments")
          .select("post_id", { count: "exact", head: true })
          .eq("post_id", post.id);

        if (commentError) {
          console.error(
            `Error fetching comment count for post ${post.id}:`,
            commentError
          );
        }

        let isLiked = false;

        if (userId) {
          const { data: likedData, error: likedError } = await supabase
            .from("likes")
            .select("post_id")
            .eq("post_id", post.id)
            .eq("user_id", userId);

          if (likedError) {
            console.error(
              `Error fetching like status for post ${post.id}:`,
              likedError
            );
          } else {
            isLiked = likedData && likedData.length > 0;
          }
        }

        return {
          ...post,
          like_count: likeCount || 0,
          comment_count: commentCount || 0,
          is_liked: isLiked,
        };
      })
    );

    // Get total count for pagination info
    const { count, error: countError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true }); // head: true only gets count

    if (countError) {
      console.error("Error fetching total post count:", countError);
    }

    res.status(200).json({
      posts: postsWithCounts,
      totalPosts: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Server error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Single Post (similar, fetch post and its comments/likes)
export const getPostById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // Get logged in user ID if available

  try {
    // Fetch post details including user
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        `
                id, title, content, image_url, created_at, updated_at,
                user: users!posts_user_id_fkey ( id, username )
            `
      )
      .eq("id", id)
      .single();

    if (postError) {
      console.error("Error fetching post:", postError);
      return res.status(postError.code === "PGRST116" ? 404 : 500).json({
        message:
          postError.code === "PGRST116"
            ? "Post not found"
            : "Failed to fetch post",
      });
    }

    // Fetch comments for the post
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(
        `
                id, content, created_at, updated_at,
                user: users ( id, username )
            `
      )
      .eq("post_id", id)
      .order("created_at", { ascending: false });

    // Fetch like count and check if current user liked it
    const { count: likeCount, error: likeCountError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", id);

    let isLiked = false;
    if (userId) {
      const { data: likeData, error: likeCheckError } = await supabase
        .from("likes")
        .select("user_id")
        .eq("post_id", id)
        .eq("user_id", userId)
        .maybeSingle();
      isLiked = !!likeData;
    }

    if (commentsError || likeCountError /* || likeCheckError (handle null) */) {
      console.error("Error fetching post details:", {
        commentsError,
        likeCountError,
      });
      // Decide if you want to return partial data or fail
    }

    res.status(200).json({
      ...post,
      comments: comments || [],
      comment_count: comments.length || 0,
      like_count: likeCount || 0,
      is_liked: isLiked, // Add flag for frontend UI
    });
  } catch (error) {
    console.error(`Server error fetching post ${id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Post
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const image = req.file;
  const userId = req.user.id;

  if (!title && !content) {
    return res
      .status(400)
      .json({ message: "Updated title or content is required" });
  }

  try {
    // Optional: Check if the post exists and belongs to the user first
    const { data: existingPost, error: findError } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (findError || !existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (existingPost.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own posts" });
    }

    // Perform the update
    let imageUrl = null;
    if (image) {
      imageUrl = req.imageUrl;
    }
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (imageUrl) updateData.image_url = imageUrl;
    updateData.updated_at = new Date();

    const { data, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId) // Ensure user owns the post
      .select(
        `
                 id, title, content, image_url, created_at, updated_at,
                 users!posts_user_id_fkey ( id, username )
            `
      )
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return res.status(500).json({ message: "Failed to update post" });
    }
    if (!data) {
      // This might happen if the row doesn't match the WHERE clause (e.g., wrong user)
      // The initial check should prevent this, but good to be aware
      return res
        .status(404)
        .json({ message: "Post not found or access denied" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Server error updating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Post
export const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Delete the post only if the user ID matches
    const { data, error, count } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Important: Ensure ownership

    if (error) {
      console.error("Error deleting post:", error);
      return res.status(500).json({ message: "Failed to delete post" });
    }

    if (count === 0) {
      // Post not found or user didn't own it
      return res.status(404).json({
        message: "Post not found or you do not have permission to delete it",
      });
    }

    // Note: ON DELETE CASCADE in DB schema handles related likes/comments
    res.status(200).json({ message: "Post deleted successfully" }); // 204 No Content is also common
  } catch (error) {
    console.error("Server error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

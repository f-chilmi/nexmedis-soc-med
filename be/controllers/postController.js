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

    return res.status(201).json(data);
  } catch (error) {
    console.error("Server error creating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const userId = req.user?.id;

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
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching total post count:", countError);
    }

    return res.status(200).json({
      posts: postsWithCounts,
      totalPosts: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Server error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get Single Post (similar, fetch post and its comments/likes)
export const getPostById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  let post, comments, likeCount, isLiked;

  try {
    // 1. Fetch post
    const { data: postData, error: postError } = await supabase
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
      if (postError.code === "PGRST116") {
        return res.status(404).json({ message: "Post not found" });
      }
      return res.status(500).json({ message: "Failed to fetch post" });
    }

    post = postData;

    // 2. Fetch comments (in parallel with other queries)
    const commentsPromise = supabase
      .from("comments")
      .select(
        `
        id, content, created_at, updated_at,
        user: users ( id, username )
      `
      )
      .eq("post_id", id)
      .order("created_at", { ascending: false });

    // 3. Fetch likes count (in parallel)
    const likesCountPromise = supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", id);

    // 4. Check if user liked (in parallel)
    let userLikedPromise = Promise.resolve({ data: null });
    if (userId) {
      userLikedPromise = supabase
        .from("likes")
        .select("user_id")
        .eq("post_id", id)
        .eq("user_id", userId)
        .maybeSingle();
    }

    // Wait for all queries to complete
    const [commentsResult, likesCountResult, userLikedResult] =
      await Promise.all([commentsPromise, likesCountPromise, userLikedPromise]);

    comments = commentsResult.data || [];
    likeCount = likesCountResult.count || 0;
    isLiked = !!userLikedResult.data;

    // Construct response object
    const response = {
      ...post,
      comments,
      comment_count: comments.length,
      like_count: likeCount,
      is_liked: isLiked,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(`Server error fetching post ${id}:`, error);
    return res.status(500).json({ message: "Internal server error" });
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
      return res
        .status(404)
        .json({ message: "Post not found or access denied" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Server error updating post:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Server error deleting post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

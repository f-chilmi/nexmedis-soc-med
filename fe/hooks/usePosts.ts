import { useState } from "react";
import {
  createPost,
  deletePost,
  getPosts as fetchPosts,
  getPost as fetchPost,
  updatePost as updatePostApi,
  likePost as likePostApi,
} from "../lib/api";
import { Post, PostFormData } from "../lib/types";

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosts = async () => {
    setLoading(true);
    setError(null);

    const response = await fetchPosts();

    if (response.success && response.data) {
      setPosts(response.data);
    } else {
      setError(response.error || "Failed to fetch posts");
    }

    setLoading(false);
    return response.success;
  };

  const getPost = async (postId: string) => {
    setLoading(true);
    setError(null);

    const response = await fetchPost(postId);

    if (response.success && response.data) {
      setPost(response.data);
    } else {
      setError(response.error || "Failed to fetch post");
    }

    setLoading(false);
    return response.success;
  };

  const addPost = async (postData: PostFormData) => {
    setLoading(true);
    setError(null);

    const response = await createPost(postData);

    if (response.success && response.data) {
      setPosts((prevPosts) => [response.data!, ...prevPosts]);
    } else {
      setError(response.error || "Failed to create post");
    }

    setLoading(false);
    return { success: response.success, post: response.data };
  };

  const updatePost = async (postId: string, postData: PostFormData) => {
    setLoading(true);
    setError(null);

    const response = await updatePostApi(postId, postData);

    if (response.success && response.data) {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? response.data! : p))
      );
      setPost(response.data);
    } else {
      setError(response.error || "Failed to update post");
    }

    setLoading(false);
    return { success: response.success, post: response.data };
  };

  const removePost = async (postId: string) => {
    setLoading(true);
    setError(null);

    const response = await deletePost(postId);

    if (response.success) {
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      if (post?.id === postId) {
        setPost(null);
      }
    } else {
      setError(response.error || "Failed to delete post");
    }

    setLoading(false);
    return response.success;
  };

  const likePost = async (postId: string) => {
    setError(null);

    const response = await likePostApi(postId);

    if (response.success && response.data) {
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likedByUser: response.data!.liked,
              totalLikes: response.data!.liked
                ? p.totalLikes + 1
                : p.totalLikes - 1,
            };
          }
          return p;
        })
      );

      if (post?.id === postId) {
        setPost({
          ...post,
          likedByUser: response.data.liked,
          totalLikes: response.data.liked
            ? post.totalLikes + 1
            : post.totalLikes - 1,
        });
      }
    } else {
      setError(response.error || "Failed to like post");
    }

    return response.success;
  };

  return {
    posts,
    post,
    loading,
    error,
    getPosts,
    getPost,
    addPost,
    updatePost,
    removePost,
    likePost,
  };
};

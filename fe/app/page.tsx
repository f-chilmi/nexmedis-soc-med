"use client";

import React, { useEffect, useState } from "react";
import PostCard from "./components/post/PostCard";
import { deletePost, getPosts, likePost } from "./actions/postActions";
import { Post } from "@/lib/types";
import Loading from "./components/common/Loading";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    setLoading(true);
    setError(null);

    const response = await getPosts();

    if (response.success && response.data) {
      setPosts(response.data.posts);
    } else {
      setError(response.error || "Failed to fetch posts");
    }

    setLoading(false);
    return response.success;
  };

  const onRemovePost = async (postId: string) => {
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

  const onLikePost = async (postId: string) => {
    setError(null);

    const response = await likePost(postId);

    if (response.success && response.data) {
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              is_liked: response.data!.liked,
              like_count: response.data!.liked
                ? p.like_count + 1
                : p.like_count - 1,
            };
          }
          return p;
        })
      );

      if (post?.id === postId) {
        setPost({
          ...post,
          is_liked: response.data.liked,
          like_count: response.data.liked
            ? post.like_count + 1
            : post.like_count - 1,
        });
      }
    } else {
      setError(response.error || "Failed to like post");
    }

    return response.success;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-6">Recent Posts</h1>
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => (window.location.href = "/post/create")}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition duration-200"
          >
            + Create
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && posts.length === 0 ? (
        <Loading />
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={onLikePost}
              onDelete={onRemovePost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No posts yet. Be the first to create a post!
          </p>
        </div>
      )}
    </div>
  );
}

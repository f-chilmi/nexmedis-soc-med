"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import Button from "@/app/components/common/Button";
import Card from "@/app/components/common/Card";
import CommentSection from "@/app/components/post/CommentSection";
import LikeButton from "@/app/components/post/LikeButton";
import { useAuth } from "@/hooks/useAuth";
import { deletePost, getPost, likePost } from "@/app/actions/postActions";
import { Post } from "@/lib/types";
import Avatar from "@/app/components/common/Avatar";

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthor = user?.id === post?.user.id;

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setError(null);

      const response = await getPost(id as string);

      if (response.success && response.data) {
        setPost(response.data);
      } else {
        setError(response.error || "Failed to fetch post");
      }

      setLoading(false);
      return response.success;
    };
    initData();
  }, []);

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this post?")) {
      const success = await onRemovePost(id as string);
      if (success) {
        router.push("/");
      }
    }
  };

  const onRemovePost = async (postId: string) => {
    setLoading(true);
    setError(null);

    const response = await deletePost(postId);

    if (response.success) {
      // setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      // if (post?.id === postId) {
      //   setPost(null);
      // }
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

  if (loading && !post) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <p className="text-gray-500 mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar username={user?.username ?? ""} />
            <div>
              <p className="font-medium">{post.user.username}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at))} ago
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>

          <p className="text-gray-700 whitespace-pre-wrap mb-4">
            {post.content}
          </p>

          {post.image_url && (
            <div className="mb-4">
              <Image
                src={post.image_url}
                alt="Post image"
                width={800}
                height={500}
                className="rounded-lg max-h-96 object-contain"
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-4">
              <LikeButton
                isLiked={post.is_liked}
                count={post.like_count}
                onClick={() => onLikePost(post.id)}
              />

              <div className="flex items-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span>{post.comment_count} comments</span>
              </div>
            </div>

            {isAuthor && (
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/post/edit/${post.id}`)}
                >
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <CommentSection postId={post.id} comments={post.comments ?? []} />
    </div>
  );
}

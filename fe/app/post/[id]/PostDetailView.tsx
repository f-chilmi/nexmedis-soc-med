"use client";
import Avatar from "@/app/components/common/Avatar";
import Card from "@/app/components/common/Card";
import CommentSection from "@/app/components/post/CommentSection";
import LikeButton from "@/app/components/post/LikeButton";
import { Post } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { deletePost, likePost } from "@/app/actions/postActions";
import { useRouter } from "next/navigation";
import PostError from "@/app/components/post/PostError";
import Loading from "@/app/components/common/Loading";

function PostDetailView({ post }: { post: Post }) {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthor = user?.id === post?.user.id;
  const handleDelete = async () => {
    if (!post.id) return;
    if (confirm("Are you sure you want to delete this post?")) {
      const success = await onRemovePost(post.id);
      if (success) {
        router.push("/");
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/post/edit/${post.id}`);
  };

  const onRemovePost = async (postId: string) => {
    setLoading(true);
    setError(null);

    const response = await deletePost(postId);

    if (!response.success) {
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
      }
    } else {
      setError(response.error || "Failed to like post");
    }

    return response.success;
  };

  if (error) return <PostError error={error} />;
  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4 w-full">
            <Avatar username={user?.username ?? ""} />
            <div>
              <p className="font-medium">{post.user.username}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at))} ago
              </p>
            </div>
            {isAuthor && (
              <div className="flex ml-auto gap-3">
                <button
                  onClick={handleEdit}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>

          <p className="text-gray-700 whitespace-pre-wrap mb-4">
            {post.content}
          </p>

          {post.image_url && (
            <div className="w-full mb-4">
              <Image
                src={post.image_url}
                alt="Post image"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto rounded-lg"
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
          </div>
        </div>
      </Card>

      <CommentSection postId={post.id} comments={post.comments ?? []} />
    </div>
  );
}

export default PostDetailView;

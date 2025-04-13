import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Card from "../common/Card";
import { Post } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import LikeButton from "./LikeButton";
import Avatar from "../common/Avatar";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => Promise<boolean>;
  onDelete?: (postId: string) => Promise<boolean>;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDelete }) => {
  const { user } = useAuth();
  const router = useRouter();
  const isAuthor = user?.id === post.user_id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onDelete) return;

    if (window.confirm("Are you sure you want to delete this post?")) {
      const success = await onDelete(post.id);
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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Avatar
            username={post.user.username}
            profilePicture={post.user.profilePicture}
          />
        </div>

        <div className="flex-1 min-w-0">
          <Link href={`/post/${post.id}`} className="block">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-900 truncate">
                {post.title}
              </p>
              {isAuthor && (
                <div className="flex space-x-2">
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

            <div className="flex items-center text-sm text-gray-500">
              <span>Posted by {post.user.username}</span>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
            </div>

            <div className="mt-2 text-base text-gray-600">
              {post.content.length > 200
                ? `${post.content.substring(0, 200)}...`
                : post.content}
            </div>

            {post.image_url && (
              <div className="mt-3">
                <Image
                  src={post.image_url}
                  alt="Post image"
                  width={500}
                  height={300}
                  className="rounded-lg max-h-80 object-cover"
                />
              </div>
            )}

            <div className="mt-4 flex items-center space-x-4">
              <LikeButton
                isLiked={post.is_liked}
                count={post.like_count}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLike(post.id);
                }}
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
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;

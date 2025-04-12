import React, { useState, useEffect } from "react";

import Button from "../common/Button";
import Card from "../common/Card";
import { useAuth } from "@/hooks/useAuth";
import { CommentFormData, Comment } from "@/lib/types";
import CommentComponent from "./Comment";
import { createComment } from "@/app/actions/commentActions";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments: baseComments,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(baseComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmitting(true);

    const commentData: CommentFormData = {
      content: newComment,
      postId,
    };

    const response = await createComment(postId, commentData);

    if (response.success && response.data) {
      setComments((prev) => [response.data!, ...prev]);
      setNewComment("");
    } else {
      setError(response.error || "Failed to create comment");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {user ? (
        <Card className="mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a comment..."
              rows={3}
            ></textarea>
            <div className="mt-2 flex justify-end">
              <Button type="submit" isLoading={isSubmitting}>
                Comment
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="mb-6 text-center py-4">
          <p>
            Please{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              login
            </a>{" "}
            to comment
          </p>
        </Card>
      )}

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};

export default CommentSection;

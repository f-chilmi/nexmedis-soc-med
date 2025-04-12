import React from "react";
import { formatDistanceToNow } from "date-fns";
import Card from "../common/Card";
import { Comment } from "@/lib/types";
import Avatar from "../common/Avatar";

interface CommentComponentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentComponentProps> = ({ comment }) => {
  return (
    <Card>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Avatar username={comment.user.username} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-900">
              {comment.user.username}
            </p>
            <span className="mx-1 text-gray-500">•</span>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at))} ago
            </p>
          </div>
          <p className="text-gray-700 mt-1">{comment.content}</p>
        </div>
      </div>
    </Card>
  );
};

export default CommentComponent;

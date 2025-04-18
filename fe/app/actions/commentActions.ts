"use server";

import { apiClient } from "@/lib/apiClient";
import { Comment, CommentFormData, ApiResponse } from "@/lib/types";

export async function createComment(
  postId: string,
  commentData: CommentFormData
): Promise<ApiResponse<Comment>> {
  return apiClient.post<Comment>(`/comments`, commentData, false, [
    "posts",
    postId,
  ]);
}

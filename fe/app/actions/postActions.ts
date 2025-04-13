"use server";

import { apiClient } from "@/lib/apiClient";
import { ApiResponse, Post, PostResponse } from "@/lib/types";

export async function getPosts(): Promise<ApiResponse<PostResponse>> {
  return apiClient.get<PostResponse>("/posts", ["/posts"], ["/posts"]);
}

export async function getPost(postId: string): Promise<ApiResponse<Post>> {
  return apiClient.get<Post>(`/posts/${postId}`, undefined, ["posts", postId]);
}

export async function createPost(
  postData: FormData
): Promise<ApiResponse<Post>> {
  return apiClient.post<Post>(
    "/posts",
    postData,
    true, // isFormData
    ["/posts"] // revalidate paths
  );
}

export async function updatePost(
  postId: string,
  postData: FormData
): Promise<ApiResponse<Post>> {
  return apiClient.put<Post>(
    `/posts/${postId}`,
    postData,
    true, // isFormData
    ["posts", postId] // revalidate paths
  );
}

export async function deletePost(postId: string): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/posts/${postId}`, ["/posts"]);
}

export async function likePost(
  postId: string
): Promise<ApiResponse<{ liked: boolean }>> {
  return apiClient.post<{ liked: boolean }>(
    `/likes`,
    { postId },
    false, // not FormData
    ["posts", postId] // revalidate paths
  );
}

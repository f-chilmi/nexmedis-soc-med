// app/actions/postActions.ts
"use server";

import { apiClient } from "@/lib/apiClient";
import { ApiResponse, Post, PostFormData, PostResponse } from "@/lib/types";

export async function getPosts(): Promise<ApiResponse<PostResponse>> {
  return apiClient.get<PostResponse>("/posts", ["/posts"], ["/posts"]);
}

export async function getPost(postId: string): Promise<ApiResponse<Post>> {
  return apiClient.get<Post>(
    `/posts/${postId}`,
    [`/posts/${postId}`],
    [`/posts/${postId}`]
  );
}

export async function createPost(
  postData: PostFormData
): Promise<ApiResponse<Post>> {
  const formData = new FormData();
  formData.append("title", postData.title);
  formData.append("content", postData.content);
  if (postData.image) {
    formData.append("image", postData.image);
  }

  return apiClient.post<Post>(
    "/posts",
    formData,
    true, // isFormData
    ["/posts"] // revalidate paths
  );
}

export async function updatePost(
  postId: string,
  postData: PostFormData
): Promise<ApiResponse<Post>> {
  const formData = new FormData();
  formData.append("title", postData.title);
  formData.append("content", postData.content);
  if (postData.image && postData.image instanceof File) {
    formData.append("image", postData.image);
  }

  return apiClient.put<Post>(
    `/posts/${postId}`,
    formData,
    true, // isFormData
    [`/posts/${postId}`, "/posts"] // revalidate paths
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
    [`/posts/${postId}`, "/posts"] // revalidate paths
  );
}

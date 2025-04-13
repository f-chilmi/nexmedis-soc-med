"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostForm from "@/app/components/post/PostForm";
import { useAuth } from "@/hooks/useAuth";
import { Post } from "@/lib/types";
import { getPost } from "@/app/actions/postActions";
import Loading from "@/app/components/common/Loading";

export default function EditPostPage() {
  const { id: postId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const initData = async () => {
      setLoading(true);
      setError(null);

      const response = await getPost(postId as string);

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

  useEffect(() => {
    if (post && user && post.user.id !== user.id) {
      router.push(`/post/${postId}`);
    }
  }, [post, user, router, postId]);

  if (authLoading || loading || !user || !post) {
    return <Loading />;
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

  return (
    <div className="max-w-3xl mx-auto py-6">
      <PostForm initialData={post} isEditing={true} />
    </div>
  );
}

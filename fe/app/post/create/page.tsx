"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PostForm from "@/app/components/post/PostForm";
import { useAuth } from "@/hooks/useAuth";

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <PostForm />
    </div>
  );
}

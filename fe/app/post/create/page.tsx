"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PostForm from "@/app/components/post/PostForm";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/app/components/common/Loading";

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <PostForm />
    </div>
  );
}

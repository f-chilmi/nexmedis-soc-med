"use client";

import { useRouter } from "next/navigation";
import Button from "@/app/components/common/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Post not found</h1>
      <p className="text-gray-500 mb-6">
        The post you're looking for doesn't exist or has been removed.
      </p>
      <Button onClick={() => router.push("/")}>Back to Home</Button>
    </div>
  );
}

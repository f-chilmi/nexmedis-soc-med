"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/app/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="max-w-md mx-auto py-12">
      <RegisterForm />
    </div>
  );
}

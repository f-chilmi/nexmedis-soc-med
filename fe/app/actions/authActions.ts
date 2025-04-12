"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  ApiResponse,
  User,
} from "@/lib/types";
import { apiClient } from "@/lib/apiClient";

export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<AuthUser>> {
  const response = await apiClient.post<AuthUser>("/auth/login", credentials);

  if (response.success && response.data?.token) {
    // Store in HTTP-only cookie for server usage
    (
      await // Store in HTTP-only cookie for server usage
      cookies()
    ).set("token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  return response;
}

export async function register(
  credentials: RegisterCredentials
): Promise<ApiResponse<AuthUser>> {
  const response = await apiClient.post<AuthUser>(
    "/auth/register",
    credentials
  );

  if (response.success && response.data?.token) {
    // Store in HTTP-only cookie for server usage
    (
      await // Store in HTTP-only cookie for server usage
      cookies()
    ).set("token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  return response;
}

export async function logout() {
  (await cookies()).delete("token");

  // For client-side
  const clientLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return { success: true, clientLogout };
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiClient.get<User>("/auth/me");
}

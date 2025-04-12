import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ApiResponse } from "./types";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    let token: string | undefined | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token");
    } else {
      token = (await cookies()).get("token")?.value;
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic method to handle API requests
   */
  private async request<T>(
    endpoint: string,
    method: string,
    data?: any,
    isFormData: boolean = false,
    shouldRevalidate?: string | string[],
    tags?: string[]
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = await this.getAuthHeaders();

      const options: RequestInit = {
        method,
        headers,
        cache: "no-store", // For SSR freshness
        next: {
          tags,
        },
      };

      if (data) {
        if (isFormData) {
          // For FormData, remove Content-Type to let browser set it with boundary
          delete headers["Content-Type"];
          options.body = data;
        } else {
          options.body = JSON.stringify(data);
        }
      }

      const response = await fetch(url, options);

      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error:
            responseData.message || `Failed with status: ${response.status}`,
        };
      }

      // Handle path revalidation if paths are provided
      if (shouldRevalidate) {
        if (Array.isArray(shouldRevalidate)) {
          shouldRevalidate.forEach((path) => revalidatePath(path));
        } else {
          revalidatePath(shouldRevalidate);
        }
      }

      return { success: true, data: responseData };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  }

  // Convenience methods
  async get<T>(
    endpoint: string,
    revalidatePaths?: string | string[],
    tags?: string[]
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      "GET",
      undefined,
      false,
      revalidatePaths,
      tags
    );
  }

  async post<T>(
    endpoint: string,
    data: any,
    isFormData: boolean = false,
    revalidatePaths?: string | string[],
    tags?: string[]
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      "POST",
      data,
      isFormData,
      revalidatePaths,
      tags
    );
  }

  async put<T>(
    endpoint: string,
    data: any,
    isFormData: boolean = false,
    revalidatePaths?: string | string[]
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "PUT", data, isFormData, revalidatePaths);
  }

  async delete<T>(
    endpoint: string,
    revalidatePaths?: string | string[]
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      "DELETE",
      undefined,
      false,
      revalidatePaths
    );
  }
}

// Create a singleton instance for use throughout the app
export const apiClient = new ApiClient();

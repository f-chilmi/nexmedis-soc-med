"use client";
import { createContext, useEffect, useState, ReactNode } from "react";
import { User } from "../lib/types";

import { LoginCredentials, RegisterCredentials } from "../lib/types";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  login,
  logout,
  register,
} from "@/app/actions/authActions";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    credentials: RegisterCredentials
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const response = await getCurrentUser();

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        localStorage.removeItem("token");
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const loginUser = async (credentials: LoginCredentials) => {
    setLoading(true);
    const response = await login(credentials);
    setLoading(false);

    if (response.success && response.data) {
      setUser(response.data);
      router.push("/");
      return { success: true };
    }

    return { success: false, error: response.error };
  };

  const registerUser = async (credentials: RegisterCredentials) => {
    setLoading(true);
    const response = await register(credentials);
    setLoading(false);

    if (response.success && response.data) {
      setUser(response.data);
      router.push("/");
      return { success: true };
    }

    return { success: false, error: response.error };
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

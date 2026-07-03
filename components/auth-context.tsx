"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  accountNumber: string;
  cvu: string;
  balance: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // If token is invalid or expired
        localStorage.removeItem("dmh_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("dmh_token");
      if (token) {
        await fetchProfile(token);
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = (token: string, userProfile: UserProfile) => {
    localStorage.setItem("dmh_token", token);
    setUser(userProfile);
    router.push("/home");
  };

  const logout = () => {
    localStorage.removeItem("dmh_token");
    setUser(null);
    window.location.href = "/";
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("dmh_token");
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

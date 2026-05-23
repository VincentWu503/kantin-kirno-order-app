"use client";
import { authMe, refreshAccessToken } from "@/lib/users";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { ApiErrorData, TokenData } from "@/utils/types";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<{
  isLoggedIn: boolean;
  isLoading: boolean;
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
  login: (token: string) => void;
  logout: () => void;
}>({
  isLoggedIn: false,
  isLoading: true,
  isNavigating: false,
  setIsNavigating: () => {},
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("token") ? true : false;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [, setError] = useState<Error | null>(null);

  const isUserAuthorized = async () => {
    const token = localStorage.getItem('token') || "";
    try {
      const response = await authMe(token);

      if (response.status === 200) {
        if (!isLoggedIn) setIsLoggedIn(true);
      }
    } catch (err: any) {
      const details = JSON.parse(err.message);

      if (details.statusCode === 401 || details.statusCode === 403) {
          logout();
          return;
      }

      setError(() => {
        throw err as Error;
      })
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    isUserAuthorized();
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, isNavigating, setIsNavigating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
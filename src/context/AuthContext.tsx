/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { authMe, handleLogoutApi, refreshAccessToken } from "@/lib/users";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { ApiErrorData, TokenData } from "@/utils/types";
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext<{
  isLoggedIn: boolean;
  isLoading: boolean;
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
  login: (token: string) => void;
  logout: () => void;
  getToken: () => string | null;
  getUserPayload: () => any;
}>({
  isLoggedIn: false,
  isLoading: true,
  isNavigating: false,
  setIsNavigating: () => { },
  login: () => { },
  logout: () => { },
  getToken: () => null,
  getUserPayload: () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [, setError] = useState<Error | null>(null);
  const [token, setToken] = useState("");
  const [userPayload, setUserPayload] = useState(null);

  const isUserAuthorized = async (token: string) => {
    try {
      const response = await authMe(token);

      if (response.status === 200) {
        if (!isLoggedIn) setIsLoggedIn(true);
      }
    } catch (err: any) {
      console.log(err.message)
      if (err.message === 'Fetch Error: Failed to fetch') {
        throw err;
      }

      let details;
      try {
        details = JSON.parse(err.message);
      } catch (err) {
        throw new Error(JSON.stringify({
          message: "Terjadi kesalahan!"
        }));
      }

      // refresh token gagal
      if (details.statusCode === 401 || details.statusCode === 403) {
        logout();
        setIsLoading(false);
        return;
      }

      setError(() => {
        throw err as Error
      })
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token") || "";
      setToken(storedToken);

      if (storedToken) {
        isUserAuthorized(storedToken);
        const decoded = jwtDecode(storedToken);
        setUserPayload(decoded as any);
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && typeof window !== "undefined") {
      isUserAuthorized(token);
      try {
        const decoded = jwtDecode(token);
        setUserPayload(decoded as any);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, [token]); // rerender saat token berubah

  const login = (token: string) => {
    if (token) {
      setToken(token);

      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);

      setUserPayload(decoded as any);

      setIsLoggedIn(true);
    }
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserPayload(null);
  };

  const getToken = () => {
    return token
  };

  const getUserPayload = () => {
    return userPayload;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, isNavigating, setIsNavigating, login, logout, getToken, getUserPayload }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
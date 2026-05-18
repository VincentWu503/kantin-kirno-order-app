"use client";
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
    try {
      const token = localStorage.getItem('token')
      const response = await fetch("http://localhost:5000/api/auth/user/me", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server tidak mengirimkan JSON. Periksa apakah backend menyala.");
      }

      if (response.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      } else if (response.status === 200) {
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error("Detail Error:", err);
      setError(() => {
        throw err;
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
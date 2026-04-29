"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  isLoggedIn: false,
  login: (token: string) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("token") ? true : false;
  });

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
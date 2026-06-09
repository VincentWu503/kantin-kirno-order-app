"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Badge } from "@mui/material";
import { fetchCartItems } from "@/lib/cart";
import { CartResponseData } from "@/utils/types";
import { ResponseObject } from "@/utils/interfaces";

export default function TopHeader() {
  const { isLoggedIn } = useAuth();
  const [menuCount, setMenuCount] = useState(0);

  useEffect(() => {
    async function fetchCartCount() {
      if (!isLoggedIn) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetchCartItems(token) as ResponseObject;
        if (response && response.data) {
          const data = response.data as CartResponseData;
          setMenuCount(data?.items?.length || 0);
        }
      } catch (err) {
        console.error("Failed to fetch cart items for header", err);
      }
    }
    
    fetchCartCount();
  }, [isLoggedIn]);

  return (
    <header className="flex justify-between items-center px-4 py-2 md:px-6 md:py-2 border-b bg-white sticky top-0 z-30 h-14 md:h-16">
      {/* Empty Left Side to Balance Center */}
      <div className="flex-1"></div>

      {/* Center Logo */}
      <div className="flex-1 flex justify-center">
        <Link href="/">
          <Image
            src="/kirno_logo_name.png"
            alt="Kirno Logo"
            width={140}
            height={44}
            className="object-contain h-9 md:h-11 w-auto"
          />
        </Link>
      </div>

      {/* Right Side: Cart / Login */}
      <div className="flex-1 flex justify-end">
        {isLoggedIn ? (
          <Badge color="secondary" badgeContent={menuCount}>
            <Link href="/cart" className="p-1.5 md:p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-sm active:scale-90 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </Link>
          </Badge>
        ) : (
          <Link href="/auth/login" className="px-4 md:px-6 py-1.5 md:py-2 bg-blue-500 text-white rounded-full font-bold text-xs md:text-sm hover:bg-blue-600 transition-all shadow-sm active:scale-95">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { ENV } from '@/config/env';

const fetchUser = async (accessToken: string) => {
  const [, setError] = useState<Error | null>(null);
  try {
    const response = await fetch(`${ENV.API_URL}/api/auth/user/profile`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
       },
    });

    // Cek apakah respons berupa JSON sebelum di-parse
    const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server tidak mengirimkan JSON. Periksa apakah backend menyala.");
    }

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      // alert(`${data.code}: ${data.description}`);
      // ini kita gak usah alert, ntar bikin bingung user aja
      return;
    }
  } catch (err) {
      console.error("Detail Error:", err);
      setError(() => {
        throw err;
      })
  }
}

export default function HomePage() {
  const loggedInImage = "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628039/samples/animals/cat.jpg";
  const guestImage = "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628048/samples/shoe.jpg";

  const [accessToken] = useState(() => localStorage.getItem('token') || "");
  const { isLoggedIn } = useAuth();
  const [ profile, setProfile ] = useState({
    name: "User",
    profileUrl: loggedInImage,
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (isLoggedIn && accessToken) {
        const data = await fetchUser(accessToken);
        
        if (data) {
          setProfile({
            name: data.username || profile.name,
            profileUrl: data.profile_image_url || profile.profileUrl 
          });
        }
      }
    };

    loadProfile();
  }, [isLoggedIn, accessToken]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 border-b bg-white sticky top-0 z-30">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Profile Image Logic */}
          <div className="relative w-10 h-10 md:w-14 md:h-14 overflow-hidden rounded-full border-2 border-gray-100 shadow-sm">
            <Image 
              src={isLoggedIn ? profile.profileUrl : guestImage} 
              alt="Profile" 
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-xl font-serif font-bold text-black leading-tight">
              {isLoggedIn ? `Halo, ${profile.name}` : "Sahera Pak Kirno"}
            </h1>
            {isLoggedIn && <span className="text-[10px] md:text-xs text-gray-500">Selamat Makan!</span>}
          </div>
        </div>

        <div>
          {isLoggedIn ? (
            <Link href="/cart" className="p-2 md:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-md active:scale-90 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
            </Link>
          ) : (
            <Link href="/auth/login" className="px-5 md:px-8 py-2 md:py-2.5 bg-blue-500 text-white rounded-full font-bold text-sm md:text-base hover:bg-blue-600 transition-all shadow-sm active:scale-95">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3 md:px-6 md:py-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari makanan..." 
            className="w-full p-3 md:p-4 text-sm md:text-base bg-gray-100 rounded-2xl md:rounded-3xl pl-10 md:pl-12 focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder-gray-400" 
          />
          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-lg md:text-xl">🔍</span>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="px-4 py-4 md:px-6 md:py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex flex-col gap-2 md:gap-3">
            <div className="bg-gray-200 p-3 md:p-4 rounded-2xl md:rounded-3xl">
              <div className="w-full aspect-square bg-red-600 rounded-xl md:rounded-2xl mb-2 md:mb-3"></div>
              <p className="text-xs md:text-sm lg:text-base font-medium line-clamp-2 text-black">Nama Makanan</p>
              <p className="text-xs md:text-sm text-black">Rp 20.000</p>
            </div>
            <button className="w-full py-2 md:py-2.5 lg:py-3 bg-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm lg:text-base font-medium hover:bg-gray-300 transition active:scale-95 text-black">
              add to cart
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
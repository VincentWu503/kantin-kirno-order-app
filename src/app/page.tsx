"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 border-b">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs md:text-sm font-bold text-black">Logo</span>
          </div>
          <h1 className="text-base md:text-2xl font-serif font-bold text-black">Sahera Pak Kirno</h1>
        </div>

        <div>
          {isLoggedIn ? (
            <button className="p-2 md:p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
            </button>
          ) : (
            <Link href="/login" className="px-4 md:px-6 py-2 md:py-2.5 bg-gray-200 rounded-full font-medium text-sm md:text-base hover:bg-gray-300 transition text-black">
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
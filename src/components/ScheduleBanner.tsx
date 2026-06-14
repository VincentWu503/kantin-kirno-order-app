"use client";

import { useState, useEffect } from "react";

interface ScheduleBannerProps {
  scheduleText?: string;
}

export default function ScheduleBanner({ 
  scheduleText = "Jadwal Buka: Senin - Jumat (08:00 - 16:00)" 
}: ScheduleBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Menghindari error hydration di Next.js
    setIsClient(true);
    
    const hasSeen = sessionStorage.getItem("hasSeenSchedule");

    if (!hasSeen) {
      setIsVisible(true);
      sessionStorage.setItem("hasSeenSchedule", "true");

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      // Membersihkan timeout jika komponen unmount
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isClient || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full z-[999] bg-yellow-50 text-yellow-800 border-b border-yellow-200 px-4 py-3 shadow-md flex justify-between items-center transition-all duration-300">
      <div className="flex-1 text-center text-sm sm:text-base font-medium">
        <p>{scheduleText}</p>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 text-yellow-600 hover:text-yellow-900 focus:outline-none p-1 rounded-md hover:bg-yellow-100 transition-colors"
        aria-label="Tutup"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
}

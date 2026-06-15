"use client";

import { useState, useEffect } from "react";
import { fetchRestaurantData } from "@/lib/restaurant";

export default function ScheduleBanner() {
  const [scheduleText, setScheduleText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let timer: NodeJS.Timeout;

    // Intip localStorage untuk cek token login
    const token = localStorage.getItem("token");
    const hasToken = !!token;
    setIsLoggedIn(hasToken);

    const loadData = async (sessionKey: string) => {
      try {
        const res = await fetchRestaurantData();
        if (res && res.data && res.data.physical_place) {
          const physical = res.data.physical_place;
          const openStr = physical.open ? physical.open.substring(0, 5) : "08:00";
          const closeStr = physical.close ? physical.close.substring(0, 5) : "15:00";
          const dayClosed = physical.day_closed || [];

          // API mengirim dalam bahasa Inggris
          const daysEn = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
          const daysIndo = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

          // Cari hari apa saja yang BUKA dalam bahasa Inggris
          const openDaysEn = daysEn.filter(d => !dayClosed.includes(d));

          let dayRange = "";
          if (openDaysEn.length === 0) {
            dayRange = "Tidak ada jadwal buka";
          } else {
            let fromEn = openDaysEn[0];
            let toEn = openDaysEn[openDaysEn.length - 1];

            // Cek urutan hari buka (mengikuti logika halaman Admin)
            for (let i = 0; i < openDaysEn.length - 1; i++) {
              const currIdx = daysEn.indexOf(openDaysEn[i]);
              const nextIdx = daysEn.indexOf(openDaysEn[i + 1]);
              if (nextIdx !== currIdx + 1) {
                toEn = openDaysEn[i];
                fromEn = openDaysEn[i + 1];
                break;
              }
            }

            // Terjemahkan hari From dan To ke bahasa Indonesia
            const fromIndo = daysIndo[daysEn.indexOf(fromEn)];
            const toIndo = daysIndo[daysEn.indexOf(toEn)];

            if (fromIndo === toIndo) {
              dayRange = fromIndo;
            } else {
              dayRange = `${fromIndo} - ${toIndo}`;
            }
          }

          setScheduleText(`Jadwal Buka: ${dayRange} (${openStr} - ${closeStr})`);
        } else {
          setScheduleText("Jadwal Buka: Senin - Sabtu (08:00 - 17:00)");
        }
      } catch (err) {
        setScheduleText("Jadwal Buka: Senin - Sabtu (08:00 - 17:00)");
      } finally {
        setLoading(false);
        setIsVisible(true);
        // Simpan state banner untuk spesifik user ini
        sessionStorage.setItem(sessionKey, "true");
        timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    };

    if (hasToken) {
      // Buat kunci unik berdasarkan token user agar muncul per-akun
      const sessionKey = `hasSeenBanner_${token.substring(0, 15)}`;
      const hasSeen = sessionStorage.getItem(sessionKey);
      
      if (!hasSeen) {
        loadData(sessionKey);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isClient || loading || !isVisible || !isLoggedIn) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] bg-yellow-50 text-yellow-800 border-b border-yellow-200 px-4 py-3 shadow-md flex justify-between items-center transition-all duration-300">
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
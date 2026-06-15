"use client";

import { useState, useEffect } from "react";
import { fetchRestaurantData } from "@/lib/restaurant";
import { useAuth } from "@/context/AuthContext";

export default function ScheduleBanner() {
  const [scheduleText, setScheduleText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth(); // Ambil status user dari AuthContext

  useEffect(() => {
    setIsClient(true);
    let timer: NodeJS.Timeout;

    const loadData = async () => {
      try {
        const res = await fetchRestaurantData();
        if (res && res.data && res.data.physical_place) {
          const physical = res.data.physical_place;
          const openStr = physical.open ? physical.open.substring(0, 5) : "08:00";
          const closeStr = physical.close ? physical.close.substring(0, 5) : "15:00";
          const dayClosed = physical.day_closed || [];

          const daysIndo = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
          const openDays = daysIndo.filter(d => !dayClosed.includes(d));

          let dayRange = "";
          if (openDays.length === 0) {
            dayRange = "Tidak ada jadwal buka";
          } else {
            let from = openDays[0];
            let to = openDays[openDays.length - 1];
            for (let i = 0; i < openDays.length - 1; i++) {
              const currIdx = daysIndo.indexOf(openDays[i]);
              const nextIdx = daysIndo.indexOf(openDays[i + 1]);
              if (nextIdx !== currIdx + 1) {
                to = openDays[i];
                from = openDays[i + 1];
                break;
              }
            }
            const fromIndo = daysIndo[daysIndo.indexOf(from)];
            const toIndo = daysIndo[daysIndo.indexOf(to)];
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
        sessionStorage.setItem("hasSeenSchedule", "true");
        timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    };

    // Cek apakah user sudah login dan belum melihat banner
    if (user) {
        const hasSeen = sessionStorage.getItem("hasSeenSchedule");
        if (!hasSeen) {
        loadData();
        } else {
        setLoading(false);
        }
    } else {
        // Jika tidak ada user (belum login), set loading false agar tidak nge-block tapi tidak tampil
        setLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Komponen TIDAK BOLEH dirender jika loading masih true ATAU jika isVisible false (karena hasSeenSchedule sudah ada atau timer habis)
  if (!isClient || loading || !isVisible || !user) {
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

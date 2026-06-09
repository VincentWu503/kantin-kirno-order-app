"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SVGProps } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { fetchUser } from '@/lib/users';
import Image from 'next/image';

const Home = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ClipboardList = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>;
const UserIcon = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const navItems = [
  { name: 'Beranda', icon: Home, href: '/' },
  { name: 'Riwayat', icon: ClipboardList, href: '/status' },
  { name: 'Profil', icon: UserIcon, href: '/profile' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  
  const loggedInImage = "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628039/samples/animals/cat.jpg";
  const guestImage = "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628048/samples/shoe.jpg";

  const [profile, setProfile] = useState({
    name: "User",
    profileUrl: loggedInImage,
  });
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    setAccessToken(localStorage.getItem('token') || "");
  }, [isLoggedIn]);

  useEffect(() => {
    const loadProfile = async () => {
      if (isLoggedIn && accessToken) {
        try {
          const response = await fetchUser(accessToken);
          if (response && response.status === 200) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = response.data as any;
            setProfile({
              name: data.username || profile.name,
              profileUrl: data.profile_image_url || profile.profileUrl
            });
          }
        } catch (err: unknown) {
          console.error(err);
        }
      }
    };

    loadProfile();
  }, [isLoggedIn, accessToken]);

  return (
    <nav className="fixed z-50 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)] group
                    max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:h-20 max-md:pb-2 max-md:border-t max-md:border-gray-100
                    md:top-0 md:left-0 md:h-full md:border-r md:border-gray-200 md:flex md:flex-col
                    md:w-16 hover:md:w-64 transition-all duration-300 overflow-hidden">
      
      {/* Profile Section (Desktop Only) */}
      <div className="hidden md:flex flex-col items-center pt-6 pb-4 border-b border-gray-100 w-full min-h-[100px]">
        <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-gray-100 shadow-sm shrink-0">
          <Image
            src={isLoggedIn ? profile.profileUrl : guestImage}
            alt="Profile"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center w-[220px]">
          <h1 className="text-sm font-bold text-black text-center break-words line-clamp-2 w-full px-2">
            {isLoggedIn ? profile.name : "Guest"}
          </h1>
          {isLoggedIn && <span className="text-[10px] text-gray-500 mt-0.5">Selamat Makan!</span>}
        </div>
      </div>

      <div className="flex h-full items-center justify-around px-4 
                      md:flex-col md:justify-start md:px-0 md:py-4 md:gap-2 md:items-start md:w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/status' && pathname?.startsWith('/order/'));
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center justify-center space-y-1.5 transition-all group/nav 
                         max-md:flex-col max-md:w-full max-md:h-full 
                         md:w-full md:px-4 md:py-3 md:flex-row md:justify-start md:space-y-0 md:gap-4 hover:bg-gray-50"
            >
              <div className="flex justify-center w-6 shrink-0">
                <item.icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110 drop-shadow-sm' : 'text-gray-400 group-hover/nav:text-gray-600 group-hover/nav:scale-105'}`} />
              </div>
              <span className={`text-[10px] md:text-sm font-bold tracking-wide transition-all duration-300
                                max-md:block md:whitespace-nowrap md:opacity-0 group-hover:md:opacity-100
                                ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover/nav:text-gray-700'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SVGProps } from 'react';

const Home = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ClipboardList = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>;
const User = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const navItems = [
  { name: 'Beranda', icon: Home, href: '/' },
  { name: 'Riwayat', icon: ClipboardList, href: '/status' },
  { name: 'Profil', icon: User, href: '/profile' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)]
                    md:top-0 md:border-t-0 md:border-b md:h-16 
                    max-md:bottom-0 max-md:h-20 max-md:pb-2">
      <div className="flex h-full items-center justify-around px-4 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          // Cek apakah tab aktif (termasuk halaman detail order untuk tab Riwayat)
          const isActive = pathname === item.href || (item.href === '/status' && pathname?.startsWith('/order/'));
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all group"
            >
              <item.icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-blue-600 scale-110 drop-shadow-sm' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'}`} />
              <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
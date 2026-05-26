import Link from 'next/link';
import type { SVGProps } from 'react';

const Home = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const ClipboardList = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M9 2H7c-1.1 0-2 .9-2 2v2h2V4h2V2zm4 0h2V0h-2v2zm5 0h2V4h2V2c0-1.1-.9-2-2-2h-2v2zM3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6H3zm8 7H7v2h4v-2zm6 0h-4v2h4v-2z"/></svg>;
const History = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.41C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.46-.78-3.54-2.12V8H12z"/></svg>;
const User = (props: SVGProps<SVGSVGElement>) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;

const navItems = [
  { name: 'Beranda', icon: Home, href: '/' },
  { name: 'Pesanan', icon: ClipboardList, href: '/orders' },
  { name: 'Riwayat', icon: History, href: '/history' },
  { name: 'Profil', icon: User, href: '/profile' },
];

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 z-40 bg-[#0084ff] text-white shadow-lg 
                    md:top-0 md:h-16 z-50
                    max-md:bottom-0 max-md:h-20">
      <div className="flex h-full items-center justify-around px-4 max-w-screen-xl mx-auto">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className="flex flex-col items-center justify-center space-y-1 group transition-all"
          >
            <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
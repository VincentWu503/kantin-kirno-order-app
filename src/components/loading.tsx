import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0084ff]">
      <div className="relative w-36 h-36 animate-pulse">
        <Image 
          src="/kirno_logo_512.png"
          alt="Loading"
          fill
          loading="eager"
          className="object-contain"
        />
      </div>
      <div className="mt-4 flex space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
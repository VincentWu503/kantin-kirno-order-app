import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0084ff]">
      <div className="relative w-64 h-64 animate-pulse">
        <Image 
          src="https://res.cloudinary.com/dmzqupudd/image/upload/v1775628039/samples/animals/cat.jpg"
          alt="Loading"
          fill
          loading="eager"
          sizes="(max-width: 768px) 256px, 256px"
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
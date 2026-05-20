"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setError] = useState<Error | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
  
    try {
        const response = await fetch("http://localhost:5000/api/auth/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        // Cek apakah respons berupa JSON sebelum di-parse
        const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server tidak mengirimkan JSON. Periksa apakah backend menyala.");
        }

        const data = await response.json();

        if (response.ok) {
          login(data.token);
          router.push("/"); 
        } 
      } catch (err) {
          console.error("Detail Error:", err);
          setError(() => {
            throw err;
          })
      }
    };
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-500 h-32 md:h-48 lg:h-56 flex items-center justify-center">
        <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-yellow-400 rounded-full border-4 md:border-6 border-white flex items-center justify-center text-center p-2 mb-6">
        </div>
      </div>

      <div className="flex-1 bg-white p-4 md:p-8 -mt-6 md:-mt-8 rounded-t-3xl md:rounded-t-4xl">
        <form onSubmit={handleLogin} className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto">
          <div>
            <label className="block text-xs md:text-sm lg:text-base font-medium mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm lg:text-base font-medium mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <Link href="/auth/forgot-password" className= "py-2 hover:text-blue-600 text-xs hover:underline md:text-sm font-medium text-left transition">
              Lupa Password
            </Link>
            <Link href="/auth/register" className=" py-2 hover:text-blue-600 text-xs hover:underline md:text-sm font-medium text-left transition">
              Registrasi
            </Link>
          </div>

          <button type="submit" className="w-full py-2.5 md:py-3 lg:py-4 bg-white rounded-full text-base md:text-lg lg:text-2xl font-serif font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md hover:bg-gray-50 transition active:scale-95">
            Sign in
          </button>
          <span className="text-center"><p>Atau</p></span>
          <GoogleSignIn></GoogleSignIn>
        </form>
      </div>
    </div>
  );
}
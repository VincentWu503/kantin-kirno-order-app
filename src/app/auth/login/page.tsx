"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import GoogleSignIn from "@/components/GoogleSignIn";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { Divider } from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  // const [error, setError] = useState<Error | null>(null); // error root layer sebagai last resort
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      const data = await fetchWrapper("/auth/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      // avoid `any` by only using typed access
      const token =
        typeof (data?.data as Record<string, unknown>)?.token === "string"
          ? ((data.data as Record<string, unknown>)?.token as string)
          : "";
      login(token);
      router.push("/");
    } catch (err: unknown) {
      console.error("Detail Error:", err);

      // pastikan error yg dilempar fetchWrapper berbentuk json, biar ini gk error
      const errMessage = err instanceof Error ? err.message : String(err);
      const errData = JSON.parse(errMessage);

      setErrorMessage(errData.message || "Terjadi kesalahan saat percobaan login!");
      // setError(() => {
      //   throw err;
      // })
    }
  };
  return (
    <div className="min-h-screen flex flex-col text-black">
      <div className="w-full bg-blue-500 h-32 md:h-48 lg:h-56 items-center justify-center flex pb-7 md:pb-8 lg:pb-10">
        <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 flex items-center justify-center">
          <Image
            src="/kirno_logo_512.png"
            alt="Kirno Logo"
            fill
            loading="eager"
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex-1 bg-white p-4 md:p-8 -mt-6 md:-mt-8 rounded-t-3xl md:rounded-t-4xl">
        <form onSubmit={handleLogin} className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto lg:max-w-lg">
          {/* Back button */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-500 hover:opacity-70 transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 font-medium">Back</span>
          </div>

          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700 text-center mb-4">Login</h2>

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

            <div className="mt-2 text-[11px] leading-4 text-gray-500">
              <div className="font-semibold text-gray-700">Ketentuan password:</div>
              <ul className="list-disc pl-5">
                <li>Minimal 12 karakter (maks 30)</li>
                <li>Harus ada huruf besar, huruf kecil, angka, dan spesial <span className="font-mono">#@$!%*?&</span></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col text-gray-500 mb-0">
            <Link href="/auth/forgot-password" className="py-2 hover:text-blue-600 text-xs hover:underline md:text-sm font-medium text-left transition">
              Lupa Password
            </Link>
            <Link href="/auth/register" className=" py-2 hover:text-blue-600 text-xs hover:underline md:text-sm font-medium text-left transition">
              Registrasi
            </Link>
          </div>

          {errorMessage && <span className="text-xs md:text-sm lg:text-base font-medium text-red-500">{errorMessage}</span>}

          <Divider className="mt-2 mb-0"></Divider>

          <button type="submit" 
          className="w-full py-2.5 md:py-3 lg:py-4 bg-white rounded-full text-base md:text-lg text-black
          font-semibold mt-4 shadow-sm hover:shadow-md hover:bg-gray-50 transition active:scale-95">
            Sign in
          </button>
          
          <div className="relative flex py-2 items-center">
             <div className="flex-grow border-t border-gray-300"></div>
             <span className="flex-shrink-0 mx-4 text-gray-400 text-xs md:text-sm font-medium">Atau</span>
             <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <GoogleSignIn/>
        </form>
      </div>
    </div>
  );
}
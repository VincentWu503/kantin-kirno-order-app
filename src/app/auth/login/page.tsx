"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      login((data.data as any).token);
      router.push("/");
    } catch (err: any) {
      console.error("Detail Error:", err);

      // pastikan error yg dilempar fetchWrapper berbentuk json, biar ini gk error
      const errData = JSON.parse(err.message);

      setErrorMessage(errData.message || "Terjadi kesalahan saat percobaan login!");
      // setError(() => {
      //   throw err;
      // })
    }
  };
  return (
    <div className="min-h-screen flex flex-col text-black">
      <div className="bg-blue-500 h-32 md:h-48 lg:h-56 flex items-center justify-center">
        <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-yellow-400 rounded-full border-4 md:border-6 border-white flex items-center justify-center text-center p-2 mb-6">
        </div>
      </div>

      <div className="flex-1 bg-white p-4 md:p-8 -mt-6 md:-mt-8 rounded-t-3xl md:rounded-t-4xl">
        <form onSubmit={handleLogin} className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto lg:max-w-lg">
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
          className="w-full py-2.5 md:py-3 lg:py-4 bg-white rounded-full text-base md:text-lg lg:text-xl 
          font-serif font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md hover:bg-gray-50 transition active:scale-95">
            Sign in
          </button>
          <span className="text-center text-sm"><p>Atau</p></span>
          <GoogleSignIn/>
        </form>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = enter email, 2 = reset password
  const router = useRouter();

  const handleSendReset = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server tidak mengirimkan JSON. Periksa apakah backend menyala.");
      }

      const data = await response.json();

      if (response.ok) {
        alert("Link reset password telah dikirim ke email Anda");
        setStep(2);
      } else {
        alert(data.message || "Email tidak ditemukan");
      }
    } catch (err) {
      console.error("Detail Error:", err);
      alert("Terjadi kesalahan: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Password tidak sama!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          newPassword
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server tidak mengirimkan JSON. Periksa apakah backend menyala.");
      }

      const data = await response.json();

      if (response.ok) {
        alert("Password berhasil direset! Silakan login dengan password baru.");
        router.push("/login");
      } else {
        alert(data.message || "Reset password gagal");
      }
    } catch (err) {
      console.error("Detail Error:", err);
      alert("Terjadi kesalahan: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-500 h-32 md:h-48 lg:h-56 flex items-center justify-center">
        <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-yellow-400 rounded-full border-4 md:border-6 border-white flex items-center justify-center text-center p-2">
          <span className="text-xs md:text-sm lg:text-base font-bold text-black">SAHERA PAK KIRNO</span>
        </div>
      </div>

      <div className="flex-1 bg-white p-4 md:p-8 -mt-6 md:-mt-8 rounded-t-3xl md:rounded-t-4xl">
        <form 
          onSubmit={step === 1 ? handleSendReset : handleResetPassword} 
          className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto"
        >
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black text-center">
            {step === 1 ? "Lupa Password" : "Reset Password"}
          </h2>

          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
                  required
                />
              </div>

              <p className="text-xs md:text-sm text-black">
                Masukkan email Anda dan kami akan mengirimkan link untuk reset password
              </p>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 md:py-3 lg:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-base md:text-lg lg:text-2xl font-serif font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Password Baru</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 md:py-3 lg:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-base md:text-lg lg:text-2xl font-serif font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mereset..." : "Reset Password"}
              </button>
            </>
          )}

          <p className="text-center text-xs md:text-sm text-black">
            Ingat password Anda? 
            <Link href="/auth/login" className="hover:text-blue-500 hover:underline text-black ml-1">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

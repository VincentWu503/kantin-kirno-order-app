"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ENV } from "@/config/env";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = enter email, 2 = verify otp, 3 = reset password
  const [otpRequestLoading, setOtpRequestLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Kode OTP telah dikirim ke email Anda");
        setStep(2);
        setError("");
      } else {
        setError(data.message || "Gagal mengirim OTP");
      }
    } catch (err) {
      console.error("Detail Error:", err);
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewOTP = async () => {
    setOtpRequestLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/user/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Kode OTP baru telah dikirim ke email Anda");
        setOtpCode("");
      } else {
        alert(data.message || "Gagal mengirim OTP baru");
      }
    } catch (err) {
      console.error("Detail Error:", err);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setOtpRequestLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!otpCode.trim()) {
      setError("Kode OTP wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/otp/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp_code: otpCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP terverifikasi. Silakan buat password baru");
        setStep(3);
        setError("");
      } else {
        setError(data.message || "Kode OTP tidak valid");
      }
    } catch (err) {
      console.error("Detail Error:", err);
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newPassword) {
      setError("Password wajib diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi tidak sesuai");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${ENV.API_URL}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp_code: otpCode.trim(),
          password: newPassword,
          confirm_password: confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password berhasil direset! Silakan login dengan password baru.");
        router.push("/auth/login");
      } else {
        setError(data.message || "Reset password gagal");
      }
    } catch (err) {
      console.error("Detail Error:", err);
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-black">
      <div className="bg-blue-500 h-32 md:h-48 lg:h-56 flex items-center justify-center">
        <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-yellow-400 rounded-full border-4 md:border-6 border-white flex items-center justify-center text-center p-2 mb-6">
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-white p-4 md:p-8 -mt-6 md:-mt-8 rounded-t-3xl md:rounded-t-4xl">
        <form 
          onSubmit={
            step === 1 ? handleSendOTP : 
            step === 2 ? handleVerifyOTP : 
            handleResetPassword
          } 
          className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto"
        >
          {/* Back button */}
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                  setError("");
                } else {
                  router.back();
                }
              }}
              className="text-gray-500 hover:opacity-70 transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 font-medium">
              {step === 1 && "Langkah 1 dari 3"}
              {step === 2 && "Langkah 2 dari 3"}
              {step === 3 && "Langkah 3 dari 3"}
            </span>
          </div>

          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700 text-center">
            {step === 1 && "Lupa Password"}
            {step === 2 && "Verifikasi OTP"}
            {step === 3 && "Reset Password"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs md:text-sm lg:text-base font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
                  required
                />
              </div>

              <p className="text-xs md:text-sm text-gray-500">
                Masukkan email Anda dan kami akan mengirimkan kode OTP untuk memverifikasi akun
              </p>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 md:py-3 lg:py-4 bg-white hover:bg-gray-50 text-black rounded-full text-base md:text-lg font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : "Kirim Kode OTP"}
              </button>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-xs md:text-sm lg:text-base font-medium mb-2">Kode OTP</label>
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center tracking-widest font-mono" 
                  required
                />
              </div>

              <p className="text-xs md:text-sm text-gray-500">
                Kode OTP telah dikirim ke <span className="font-semibold">{email}</span>
              </p>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 md:py-3 lg:py-4 bg-white hover:bg-gray-50 text-black rounded-full text-base md:text-lg font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memverifikasi..." : "Verifikasi OTP"}
              </button>

              <button
                type="button"
                onClick={handleRequestNewOTP}
                disabled={otpRequestLoading}
                className="w-full py-2 text-gray-500 hover:text-blue-600 text-sm md:text-base font-semibold underline transition disabled:opacity-50"
              >
                {otpRequestLoading ? "Mengirim..." : "Kirim Ulang Kode OTP"}
              </button>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-xs md:text-sm lg:text-base font-medium mb-2">Password Baru</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm lg:text-base font-medium mb-2">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Masukkan ulang password"
                  className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 md:py-3 lg:py-4 bg-white hover:bg-gray-50 text-black rounded-full text-base md:text-lg font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mereset..." : "Reset Password"}
              </button>
            </>
          )}

          {/* Footer Link */}
          <p className="text-center text-xs md:text-sm text-gray-500">
            {step === 1 && (
              <>
                Ingat password Anda? 
                <Link href="/auth/login" className="hover:text-blue-600 hover:underline text-gray-500 ml-1 font-semibold">
                  Login
                </Link>
              </>
            )}
            {(step === 2 || step === 3) && (
              <>
                Kembali ke 
                <button type="button" onClick={() => { setStep(1); setError(""); }} className="hover:text-blue-600 hover:underline text-gray-500 ml-1 font-semibold">
                  Login
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchWrapper } from "@/utils/fetchWrapper";
import ErrorDialog from "@/components/ErrorDialog";

export default function RegisterPage() {

  const PW_REGEX = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#@$!%*?&])[A-Za-z\\d#@$!%*?&]{12,30}$');

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [step, setStep] = useState(1); // 1 = register, 2 = check otp, 3 = verify email
  const [otpCode, setOtpCode] = useState("");
  const [otpRequestLoading, setOtpRequestLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Error: Terjadi kesalahan dengan data registrasi atau email sudah pernah digunakan sebelumnya");
  const [openDialog, setOpen] = useState(false);

  const [validity, setValidity] = useState<{ username: boolean, email: boolean, password: boolean, confirm: boolean, phone: boolean }>({ username: true, email: true, password: true, confirm: true, phone: true });
  const router = useRouter();

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setValidity({ ...validity });

    if (password !== confirmPassword) {
      alert("Password tidak sama!");
      return;
    }

    setLoading(true);

    try {
      await fetchWrapper("/auth/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password,
          confirm_password: confirmPassword,
          phone_number: phone
        }),
      });

      // Request OTP setelah registrasi berhasil
      await fetchWrapper("/auth/user/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      alert("Registrasi berhasil! Kode OTP telah dikirim ke email Anda.");
      setStep(2);

    } catch (err: any) {
      console.error("Detail Error:", err);
      try {
        const errorData = JSON.parse(err.message);
        setErrorMessage(errorData.message || "Terjadi kesalahan dengan data registrasi!");
      } catch {
        setErrorMessage(err.message || "Terjadi kesalahan dengan data registrasi!");
      }
      setError(err as Error);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetchWrapper("/auth/user/otp/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });
      alert("OTP terverifikasi. Silakan selesaikan verifikasi email.");
      setStep(3);
    } catch (err: any) {
      console.error("Detail Error:", err);
      try {
        const errorData = JSON.parse(err.message);
        setErrorMessage(errorData.message || "Kode OTP salah atau kedaluwarsa!");
      } catch {
        setErrorMessage(err.message || "Verifikasi OTP gagal!");
      }
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetchWrapper("/auth/user/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });
      alert("Verifikasi email berhasil! Silakan login.");
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Detail Error:", err);
      try {
        const errorData = JSON.parse(err.message);
        setErrorMessage(errorData.message || "Verifikasi email gagal!");
      } catch {
        setErrorMessage(err.message || "Verifikasi email gagal!");
      }
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewOTP = async () => {
    setOtpRequestLoading(true);
    try {
      await fetchWrapper("/auth/user/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      alert("Kode OTP baru telah dikirim ke email Anda");
      setOtpCode("");
    } catch (err: any) {
      console.error("Detail Error:", err);
      setErrorMessage("Gagal mengirim OTP baru");
      setOpen(true);
    } finally {
      setOtpRequestLoading(false);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (newName.length > 32 || newName.length < 4) {
      setValidity({ ...validity, username: false });
    } else {
      setValidity({ ...validity, username: true });
    }
  }
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!newEmail.includes('@')) {
      setValidity({ ...validity, email: false });
    } else {
      setValidity({ ...validity, email: true });
    }
  }
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhone(newPhone);
    if (newPhone.length >= 11) {
      setValidity({ ...validity, phone: true });
    } else {
      setValidity({ ...validity, phone: false });
    }
  }
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (PW_REGEX.test(newPassword)) {
      setValidity({ ...validity, password: true });
    } else {
      setValidity({ ...validity, password: false });
    }
  }
  const handleConfirmChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (newConfirmPassword === password) {
      setValidity({ ...validity, confirm: true });
    } else {
      setValidity({ ...validity, confirm: false });
    }
  }
  const handleCloseDialog = () => setOpen(false);


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
        {step === 1 ? (
          <form onSubmit={handleRegister} className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto">
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
              <span className="text-xs text-gray-500 font-medium">Langkah 1 dari 3</span>
            </div>

            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black text-center">Registrasi</h2>

            <div>
              <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Nama Panggilan</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            {validity.username ? null : (<span className="text-red-400 block text-xs">Nama harus memiliki 5-32 karakter!</span>)}

            <div>
              <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            {validity.email ? null : (<span className="text-red-400 block text-xs">Email tidak valid!</span>)}

            <div>
              <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Nomor Telepon</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            {validity.phone ? null : (<span className="text-red-400 block text-xs">Nomor HP tidak valid!</span>)}

            <div>
              <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            {validity.password ? null : (<span className="text-red-400 block text-xs">Password harus memiliki simbol, huruf kapital, dan huruf kecil dengan panjang minimal 12 karakter!</span>)}

            <div>
              <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmChange}
                className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
            {validity.confirm ? null : (<span className="text-red-400 block text-xs">Password tidak sama!</span>)}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 md:py-3 lg:py-4 bg-white rounded-full text-base md:text-lg lg:text-2xl font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md hover:bg-gray-50 transition active:scale-95 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </button>

            <p className="text-center text-xs md:text-sm text-black">
              Sudah punya akun?
              <Link href="/auth/login" className="hover:text-blue-500 hover:underline text-black ml-1">
                Login
              </Link>
            </p>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleCheckOTP} className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto">
            {/* Back button */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpCode("");
                }}
                className="text-gray-500 hover:opacity-70 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-gray-500 font-medium">Langkah 2 dari 3</span>
            </div>

            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700 text-center">Verifikasi OTP</h2>
            
            <div>
              <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Kode OTP</label>
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
              disabled={loading || otpRequestLoading}
              className="w-full py-2.5 md:py-3 lg:py-4 bg-white hover:bg-gray-50 text-black rounded-full text-base md:text-lg font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memverifikasi..." : "Verifikasi OTP"}
            </button>

            <button
              type="button"
              onClick={handleRequestNewOTP}
              disabled={loading || otpRequestLoading}
              className="w-full py-2 md:py-2.5 text-xs md:text-sm lg:text-base text-blue-500 hover:text-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpRequestLoading ? "Mengirim OTP..." : "Kirim OTP baru"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyEmail} className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto">
            {/* Back button */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                }}
                className="text-gray-500 hover:opacity-70 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-gray-500 font-medium">Langkah 3 dari 3</span>
            </div>

            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700 text-center">Verifikasi Email</h2>
            <p className="text-xs md:text-sm text-center text-gray-600">Email Anda telah diverifikasi dengan OTP. Klik tombol di bawah untuk menyelesaikan registrasi.</p>

            {errorMessage && <span className="text-xs md:text-sm lg:text-base font-medium text-red-500">{errorMessage}</span>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 md:py-3 lg:py-4 bg-white hover:bg-gray-50 text-black rounded-full text-base md:text-lg font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Menyelesaikan..." : "Selesaikan Registrasi"}
            </button>
          </form>
        )}
      </div>

      <ErrorDialog
        openState={openDialog}
        handleClose={handleCloseDialog}
        title="Registrasi Pengguna Gagal!"
        message={errorMessage}
      />
    </div >
  );
}

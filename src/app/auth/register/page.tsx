"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWrapper } from "@/utils/fetchWrapper";
import ErrorDialog from "@/components/ErrorDialog";

export default function RegisterPage() {

  const PW_REGEX = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#@$!%*?&])[A-Za-z\\d#@$!%*?&]{3,30}$');

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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
      alert("Registrasi berhasil! Silakan login.");
      router.push("/auth/login");

    } catch (err) {
      console.error("Detail Error:", err);
      setError(err as Error);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setName(e.target.value);
    if (name.length > 32 || name.length < 4) {
      setValidity({ ...validity, username: false });
    } else {
      setValidity({ ...validity, username: true });
    }
  }
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!email.includes('@')) {
      setValidity({ ...validity, email: false });
    } else {
      setValidity({ ...validity, email: true });
    }
  }
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setPhone(e.target.value);
    if (phone.length >= 11) {
      setValidity({ ...validity, phone: true });
    } else {
      setValidity({ ...validity, phone: false });
    }
  }
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setPassword(e.target.value);
    if (PW_REGEX.test(password)) {
      setValidity({ ...validity, password: true });
    } else {
      setValidity({ ...validity, password: false });
    }
  }
  const handleConfirmChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (confirmPassword === password) {
      setValidity({ ...validity, confirm: true });
    } else {
      setValidity({ ...validity, confirm: false });
    }
  }
  const handleCloseDialog = () => setOpen(false);


  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-500 h-32 md:h-48 lg:h-56 flex items-center justify-center">
        <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-yellow-400 rounded-full border-4 md:border-6 border-white flex items-center justify-center text-center p-2">
          <span className="text-xs md:text-sm lg:text-base font-bold text-black">SAHERA PAK KIRNO</span>
        </div>
      </div>

      <div className="flex-1 bg-white p-4 md:p-8 -mt-6 md:-mt-8 rounded-t-3xl md:rounded-t-4xl">
        <form onSubmit={handleRegister} className="bg-gray-200 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 max-w-md mx-auto">
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
            className="w-full py-2.5 md:py-3 lg:py-4 bg-white rounded-full text-base md:text-lg lg:text-2xl font-serif font-semibold mt-4 md:mt-6 shadow-sm hover:shadow-md hover:bg-gray-50 transition active:scale-95 text-black disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      <ErrorDialog
        openState={openDialog}
        handleClose={handleCloseDialog}
        title="Registrasi Pengguna Gagal!"
        message="Error: Terjadi kesalahan dengan data regsitrasi atau email sudah pernah digunakan sebelumnya"
      />
    </div >
  );
}

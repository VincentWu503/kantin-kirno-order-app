"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import ErrorDialog from "@/components/ErrorDialog";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [openDialog, setOpen] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();

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
          name,
          email,
          password,
          confirm_password: confirmPassword,
          phone
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
            <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

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

          <div>
            <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Nomor Telepon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 md:p-3 lg:p-4 text-sm md:text-base bg-white rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm lg:text-base font-medium mb-2 text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

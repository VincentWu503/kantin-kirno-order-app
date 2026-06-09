"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { handleLogoutApi, fetchUser } from "@/lib/users";

const ProfilePage: React.FC = () => {
  const { isLoggedIn, logout, getUserPayload, setIsNavigating } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<{
    namaPelanggan: string;
    nim: string;
    profileImageUrl: string;
  }>({
    namaPelanggan: "Guest",
    nim: "-",
    profileImageUrl: "",
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isPhotoPopupOpen, setIsPhotoPopupOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const result = await fetchUser(token);
        if (result.status === 200) {
          const data = result.data as any;
          setProfile({
            namaPelanggan: data.username || "Tanpa Nama",
            nim: data.phone_no || "",
            profileImageUrl: data.profile_image_url || "",
          });
        }
      } else {
        const payload = getUserPayload();
        if (payload) {
          setProfile({
            namaPelanggan: payload.username || "Tanpa Nama",
            nim: "",
            profileImageUrl: payload.profile_image_url || "",
          });
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data profil", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [isLoggedIn]);

  const onLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await handleLogoutApi(token);
      }
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      router.push("/auth/login");
    }
  };

  const handleEditProfileClick = () => {
    router.push("/profile/edit");
  };

  const handlePhotoUploadSubmit = async () => {
    if (!newPhotoUrl.trim()) {
      setErrorMsg("URL gambar tidak boleh kosong");
      return;
    }
    setIsUploading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profile.namaPelanggan,
          phone_number: profile.nim,
          profile_image_url: newPhotoUrl
        })
      });

      if (response.ok || response.status === 204) {
        setProfile((prev) => ({ ...prev, profileImageUrl: newPhotoUrl }));
        setIsPhotoPopupOpen(false);
        setNewPhotoUrl("");
      } else {
        setErrorMsg("Gagal memperbarui foto profil");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan sistem");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingProfile && isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:pt-16 flex justify-center items-start md:items-center">
      <div className="w-full max-w-md md:max-w-lg bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Profile Section */}
        <div className="bg-blue-500 pt-10 pb-20 px-6 relative">
          <h1 className="text-2xl font-bold text-white text-center tracking-wide">
            Profil Saya
          </h1>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-8 relative">
          {/* Avatar Area */}
          <div className="flex justify-center -mt-16 mb-4 relative">
            <div 
              className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-md cursor-pointer group flex items-center justify-center overflow-hidden"
              onClick={() => {
                if (isLoggedIn) setIsPhotoPopupOpen(true);
              }}
            >
              <img 
                src={profile.profileImageUrl || (isLoggedIn ? "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628039/samples/animals/cat.jpg" : "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628048/samples/shoe.jpg")} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              
              {/* Hover Overlay */}
              {isLoggedIn && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {profile.namaPelanggan}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              NIM: {profile.nim || "Belum diisi"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {isLoggedIn && (
              <button 
                onClick={handleEditProfileClick}
                className="w-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 font-semibold py-3 px-4 rounded-xl transition duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Data Profil
              </button>
            )}

            {!isLoggedIn && (
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600 mb-3">Silakan login untuk melihat dan mengubah profil Anda.</p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition duration-300"
                >
                  Login Sekarang
                </button>
              </div>
            )}

            {isLoggedIn && (
              <button 
                onClick={onLogout}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-4 rounded-xl transition duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Popup */}
      {isPhotoPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ubah Foto Profil</h3>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                {errorMsg}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Gambar Baru</label>
              <input 
                type="text" 
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-2">Untuk saat ini, silakan masukkan URL gambar foto profil Anda.</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsPhotoPopupOpen(false)}
                disabled={isUploading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-xl transition duration-300 disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handlePhotoUploadSubmit}
                disabled={isUploading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                {isUploading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

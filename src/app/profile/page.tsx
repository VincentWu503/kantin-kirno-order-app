"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { handleLogoutApi, fetchUser } from "@/lib/users";

const ProfilePage: React.FC = () => {
  const { isLoggedIn, logout, getUserPayload } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<{
    namaPelanggan: string;
    nomorHp: string;
    profileImageUrl: string;
  }>({
    namaPelanggan: "Guest",
    nomorHp: "-",
    profileImageUrl: "",
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const result = await fetchUser(token);
        if (result.status === 200) {
          const data = result.data as any;
          setProfile({
            namaPelanggan: data.username || "Tanpa Nama",
            nomorHp: data.phone_no || "",
            profileImageUrl: data.profile_image_url || "",
          });
        }
      } else {
        const payload = getUserPayload();
        if (payload) {
          setProfile({
            namaPelanggan: payload.username || "Tanpa Nama",
            nomorHp: "",
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
              className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-200 shadow-md flex items-center justify-center overflow-hidden"
            >
              <img 
                src={profile.profileImageUrl || (isLoggedIn ? "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628039/samples/animals/cat.jpg" : "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628048/samples/shoe.jpg")} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {profile.namaPelanggan}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Nomor HP: {profile.nomorHp || "Belum diisi"}
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
    </div>
  );
};

export default ProfilePage;
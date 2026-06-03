"use client"
import Link from "next/link";
import React, { useState, useEffect } from "react";
import EditProfileModal from "./edit";
import { useAuth } from "@/context/AuthContext";
import { handleLogoutApi } from '@/lib/users';

const ProfilePage: React.FC = () => {
  // State untuk mengecek apakah user sudah login
  const { isLoggedIn, getUserPayload } = useAuth();

  // State untuk data profil
  const [profile, setProfile] = useState({
    name: "Nama Lengkap",
    profileUrl: '',
    token: null as string|null,
  });

  useEffect(() => {
    if(!isLoggedIn) {
      return;
    }

    setProfile( {
        name: getUserPayload()['name'],
        profileUrl: getUserPayload()['picture'],
        token: localStorage.getItem('token'),
      });
  },[isLoggedIn]);

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fungsi untuk handle edit
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // Fungsi untuk menyimpan edit dari modal
  const handleSaveEdit = (updatedProfile: { name: string;}) => {
    setProfile({
      ...profile,
      name: updatedProfile.name,
    });
  };

  // Tampilan saat belum login
  if (!isLoggedIn || !profile) {
    return (
      <div className="min-h-screen bg-white p-8 md:p-10 pb-20 pt-20 px-4">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">
          Profile
        </h1>

        {/* profileUrl Profil (default) */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
        </div>

        {/* Pesan Belum Login */}
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-600">Anda belum login</p>
          <p className="text-md text-gray-400">Silakan login untuk melihat profil Anda</p>
          
          {/* Tombol Login */}
          <Link href="/auth/login"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-md transition duration-300 mt-4"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Tampilan saat sudah login
  return (
    <div className="min-h-screen bg-white p-8 md:p-10 pb-20 pt-20 px-4">
      {/* Header dengan tombol edit */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Profile
        </h1>
        <button
          onClick={handleEdit}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-300 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Edit
        </button>
      </div>

      {/* profileUrl Profil */}
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center relative">
          {profile.profileUrl ? (
            <img
              src={profile.profileUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <svg
              className="w-16 h-16 text-gray-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Informasi Profil */}
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold text-gray-800">
          {profile.name}
        </p>
      </div>

      {/* Tombol Log Out */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => handleLogoutApi(profile.token)}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-md transition duration-300"
        >
          Log Out
        </button>
      </div>

      {/* Modal Edit Profile */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        currentData={{
          name: profile.name,
        }}
      />
    </div>
  );
};

export default ProfilePage;
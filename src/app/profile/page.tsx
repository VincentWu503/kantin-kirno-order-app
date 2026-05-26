import React from "react";

const ProfilePage: React.FC = () => {
  // Data profil (contoh)
  const profile = {
    namaPelanggan: "Nama pelanggan",
    nim: "Nim",
  };

  return (
    <div className="min-h-screen bg-white p-8 md:p-10 pb-20 pt-20 px-4">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">
        Profile
      </h1>

      {/* Foto Profil */}
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

      {/* Informasi Profil */}
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold text-gray-800">
          {profile.namaPelanggan}
        </p>
        <p className="text-md text-gray-500">
          {profile.nim}
        </p>
      </div>

      {/* Tombol Log Out */}
      <div className="mt-10 flex justify-center">
        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-md transition duration-300">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
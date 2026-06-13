"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchUser } from "@/lib/users";
import { SESSION_STORAGE_EVENT } from "@/utils/constants";
import { ENV } from "@/config/env";

export default function EditProfilePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      sessionStorage.setItem(
        "error",
        "Anda harus login terlebih dahulu untuk mengedit profil!",
      );
      window.dispatchEvent(new Event(SESSION_STORAGE_EVENT));
      router.replace("/profile");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const result = await fetchUser(token);
        if (result.status === 200) {
          const data = result.data as Record<string, unknown>;
          const usernameValue =
            typeof data.username === "string" ? data.username : "";
          const phoneNoValue =
            typeof data.phone_no === "string" ? data.phone_no : "";
          const profileImageValue =
            typeof data.profile_image_url === "string"
              ? data.profile_image_url
              : "";

          setUsername(usernameValue);
          setPhoneNumber(phoneNoValue);
          setProfileImageUrl(profileImageValue);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  const parseErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message);
        return parsed.message || parsed.description || error.message;
      } catch {
        return error.message;
      }
    }
    return String(error || "Terjadi kesalahan pada sistem.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    // simpan nilai lama untuk rollback jika PATCH gagal
    const oldProfileImageUrl = profileImageUrl;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      let updatedProfileImageUrl = profileImageUrl;

      if (profileImageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("profile_image", profileImageFile);

        const rawApiUrl = `${ENV.API_URL}`.replace(/\/+$/, "");
        const apiUrl = rawApiUrl.endsWith("/api")
          ? rawApiUrl
          : `${rawApiUrl}/api`;

        const uploadResponse = await fetch(
          `${apiUrl}/auth/user/profile-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          },
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse
            .json()
            .catch(() => ({}));
          throw new Error(
            errorData.message || "Gagal mengupload foto profil.",
          );
        }

        const uploadData = await uploadResponse.json();
        const nextUrl = uploadData?.profile_image_url;

        if (typeof nextUrl !== "string" || nextUrl.trim() === "") {
          const fallbackMessage =
            typeof uploadData?.message === "string" ? uploadData.message : "";

          throw new Error(
            fallbackMessage ||
              "Upload berhasil tetapi URL foto profil tidak didapatkan.",
          );
        }

        updatedProfileImageUrl = nextUrl;
      }

      const response = await fetch(`${ENV.API_URL}/auth/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username,
          phone_number: phoneNumber,
          profile_image_url: updatedProfileImageUrl,
        }),
      });

      if (response.ok || response.status === 204) {
        router.push("/profile");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Gagal memperbarui profil.");

        // rollback UI agar image tidak terlihat berubah saat update gagal
        setProfileImageUrl(oldProfileImageUrl);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(parseErrorMessage(err));

      // rollback UI agar image tidak terlihat berubah saat error
      setProfileImageUrl(oldProfileImageUrl);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:pt-16 flex justify-center items-start md:items-center">
      <div className="w-full max-w-md md:max-w-lg bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-500 py-6 px-6 relative flex items-center">
          <button 
            onClick={() => router.back()} 
            className="text-white hover:bg-orange-600 p-2 rounded-full transition absolute left-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white text-center w-full tracking-wide">
            Edit Profil
          </h1>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor HP
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                placeholder="Masukkan Nomor HP Anda (opsional)"
              />
              <p className="text-xs text-gray-500 mt-2">Dapat dibiarkan kosong jika tidak ada.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto Profil
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  if (profileImagePreview) {
                    URL.revokeObjectURL(profileImagePreview);
                  }

                  setProfileImageFile(file);
                  setProfileImagePreview(file ? URL.createObjectURL(file) : "");
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
              />

              {(profileImagePreview || profileImageUrl) ? (
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={profileImagePreview || profileImageUrl}
                    alt="Preview Foto Profil"
                    className="w-20 h-20 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <p className="text-sm text-gray-700">
                      {profileImagePreview ? "Preview foto baru" : "Foto saat ini"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pilih file baru jika ingin mengganti foto profil.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  Anda belum memiliki foto profil.
                </p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Upload gambar dari perangkat Anda.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-300 disabled:opacity-50 flex items-center justify-center shadow-sm"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

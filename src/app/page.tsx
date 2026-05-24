"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, Suspense, ChangeEvent } from "react";
import { ENV } from '@/config/env';
import { apiRoute, fetchMenu } from "@/utils/fetchUtils";
import { ApiErrorData, MenuData, MenuResponseData, UserData } from "@/utils/types";
import { Alert, CircularProgress, Pagination, Snackbar } from "@mui/material";

function MenuCard({ menu, handle }: { menu: MenuData, handle: (menu: MenuData) => void }) {
  // return <div className="border border-black flex flex-col gap-3 md:gap-4 p-2 pt-3 pb-3 shadow-md rounded-lg md:rounded-xl">
  return <div className="border border-black/4 flex flex-col gap-4 mb-2 md:mb-3 md:gap-4 p-2 pt-3 pb-3 shadow-lg/shadow-2xl rounded-lg md:rounded-xl">
    <div className="p-2 md:p-3 rounded-2xl md:rounded-3xl ">
      <div className="w-full aspect-square bg-red-600 rounded-sm md:rounded-lg mb-2 md:mb-3">
        {menu.image_url ? (
          <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover rounded-xl md:rounded-2xl" />
        ) : (
          <div className="w-full h-full bg-red-400" />
        )}
      </div>{/* Fix this after dealing with cloudinary */}
      <p className="text-xs md:text-sm lg:text-base font-medium line-clamp-2 text-black">{menu.name}</p>
      <p className="text-xs md:text-sm text-black">Rp {menu.price}</p>
    </div>
    <button
      className={`mx-3 py-2 md:py-2.5 lg:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm lg:text-base font-medium ${menu.is_available ? " bg-gray-200 hover:bg-gray-300 transition active:scale-95 text-black" : 'bg-gray-400 text-gray-300'}`}
      disabled={!menu.is_available}
      onClick={() => handle(menu)}
    >
      {menu.is_available ? "Add to Cart" : "Unavailable"}
    </button>
    { /* Maybe add a special message if item cant be bought*/}
  </div>
}

export default function HomePage() {
  const loggedInImage = "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628039/samples/animals/cat.jpg";
  const guestImage = "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628048/samples/shoe.jpg";

  const OFFSET_DEFAULT = 0;
  const LIMIT_DEFAULT = 12;
  const TIMEOUT_MS = 500;


  const [, setError] = useState<Error | null>(null);

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('token') || ""); // takut ngehapus ini, takutnya ngebreak code, biarin aj kalo kurang clean
  const { isLoggedIn, getUserPayload } = useAuth();
  const [profile, setProfile] = useState({
    name: "User",
    profileUrl: loggedInImage,
  })

  const [snackbarOpen, setSnackbar] = useState(false);

  const [offset, setOffset] = useState(() => OFFSET_DEFAULT)
  const [limit, setLimit] = useState(LIMIT_DEFAULT)
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>(() => "")
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [menu, setMenu] = useState<MenuResponseData | null>(() => null);
  const [menuLoading, setMenuLoading] = useState(true);

  function handleSearchTimeout(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => { setSearch(e.target.value); setOffset(0) }, TIMEOUT_MS))
  }

  function handlePageChange(event: ChangeEvent<unknown, Element>, page: number) {
    console.log(page);
    setOffset((page - 1) * limit);
    setPage(page);
  }

  async function handleAddToCart(menu: MenuData) {//TODO: Add Handling add to cart, do after admin menu management is done


    setSnackbar(true);
  }

  useEffect(() => {
    const loadProfile = async () => {
      if (isLoggedIn && accessToken) {
        try {
          // biar gk hit api tiap saat (panggil endpoint profile di profile saja)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = getUserPayload() as any; // gak peduli w
          if (data) {
            setProfile({
              name: data.username || profile.name,
              profileUrl: data.profile_image_url || profile.profileUrl
            });
          }
        } catch (err: unknown) {
          setError(() => {
            throw err;
          })
        }
      }
    };

    loadProfile();
  }, [isLoggedIn, accessToken]);

  useEffect(() => {
    const menuData = async () => {
      setMenuLoading(true);
      const menus = await fetchMenu(offset, limit, search || undefined);
      setMenu(menus as MenuResponseData);
      setMenuLoading(false);
    }
    menuData();
  }, [offset, limit, search])

  return (
    <div className="min-h-screen bg-white ">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 border-b bg-white sticky top-0 z-30">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Profile Image Logic */}
          <div className="relative w-10 h-10 md:w-14 md:h-14 overflow-hidden rounded-full border-2 border-gray-100 shadow-sm">
            <Image
              src={isLoggedIn ? profile.profileUrl : guestImage}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-xl font-serif font-bold text-black leading-tight">
              {isLoggedIn ? `Halo, ${profile.name}` : "Sahera Pak Kirno"}
            </h1>
            {isLoggedIn && <span className="text-[10px] md:text-xs text-gray-500">Selamat Makan!</span>}
          </div>
        </div>

        <div>
          {isLoggedIn ? (
            <Link href="/cart" className="p-2 md:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-md active:scale-90 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </Link>
          ) : (
            <Link href="/auth/login" className="px-5 md:px-8 py-2 md:py-2.5 bg-blue-500 text-white rounded-full font-bold text-sm md:text-base hover:bg-blue-600 transition-all shadow-sm active:scale-95">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3 md:px-6 md:py-4 lg:w-lg md:w-md sm:w-sm xl:w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari makanan..."
            className="w-full p-3 md:p-4 text-sm md:text-base bg-gray-100 rounded-2xl md:rounded-3xl pl-10 md:pl-12 focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder-gray-400"
            onChange={handleSearchTimeout}
          />
          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-lg md:text-xl"><Image width={20} height={20} src="/search.svg" alt="Search symbol"></Image></span>
        </div>
      </div>

      {/* Menu Grid */}
      {menuLoading ?
        (<CircularProgress aria-label="Loading…" size={'5rem'} className="mx-auto size-fit flex" />) :
        (<>
          <main className="self-center px-4 py-4 md:px-6 md:py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 max-w-7xl mx-auto">
            {menu!.data.map((item) => <MenuCard key={item.menu_id} menu={item} handle={handleAddToCart} />)}
          </main>

          <Pagination
            className="size-fit py-3 mx-auto text-2xl"
            count={Math.ceil(menu!.count / limit)}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            page={page}
          />
        </>)
      }
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbar(false)}
        onClick={() => setSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClick={() => setSnackbar(false)}>
          Item added successfully to cart
        </Alert>
      </Snackbar>
    </div>
  );
}
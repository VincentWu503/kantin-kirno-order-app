"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, ChangeEvent } from "react";
import { fetchMenu } from "@/lib/menu";
import { CartResponseData, MenuData, MenuResponseData } from "@/utils/types";
import { Alert, AlertColor, Badge, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Pagination, Snackbar, Stack } from "@mui/material";
import { formatIDR } from "@/utils/utils";
import { addToCart, fetchCartItems } from "@/lib/cart";
import BottomSnackbar from "@/components/BottomSnackbar";
import { ResponseObject } from "@/utils/interfaces";

function MenuCard({ menu, handle }: { menu: MenuData, handle: (menu: MenuData) => void }) {
  return <div className="bg-white flex flex-col justify-between mb-2 md:mb-3 p-3 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 rounded-xl md:rounded-2xl h-full">
    <div>
      <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
        {menu.image_url ? (
          <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover absolute inset-0 transition-transform duration-300 hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gray-200 absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 mb-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm md:text-base font-bold text-gray-800 line-clamp-2 leading-tight">
            {menu.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm md:text-base font-bold text-blue-600">
            {formatIDR(menu.price)}
          </p>
          {menu.is_available ? (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
              Tersedia
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
              Habis
            </span>
          )}
        </div>
      </div>
    </div>

    <button
      className={`mt-auto w-full py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
        menu.is_available 
          ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm" 
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
      disabled={!menu.is_available}
      onClick={() => handle(menu)}
    >
      {menu.is_available ? "Add to Cart" : "Unavailable"}
    </button>
  </div>
}

function LoginPromptDialog({ open, handleClose, }: { open: boolean, handleClose: () => void, }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Anda Perlu Login Terlebih Dahulu!
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Untuk menambahkan menu ke dalam Cart dan membuat sebuah pesanan, and perlu melakukan login terlebih dahulu.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" autoFocus>
          Kembali
        </Button>
        <Link href="/auth/login">
          <Button variant="outlined" autoFocus>
            Login
          </Button>
        </Link>
      </DialogActions>
    </Dialog>
  )
}

function AddToCartPromptDialog({ menu, quantity, handleQuantityChange, handleClose, handleConfirm }: { menu: MenuData | null, quantity: number, handleQuantityChange: (n: number) => void, handleClose: () => void, handleConfirm: () => void }) {
  return (
    <Dialog open={menu !== null} onClose={handleClose} maxWidth="sm" fullWidth>
      {
        menu == null ?
          undefined :
          <>
            <DialogTitle className="text-lg md:text-xl font-bold pb-2">
              Add To Cart
            </DialogTitle>
            <DialogContent dividers className="px-4 py-4 md:px-6 md:py-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                <div className="w-full sm:w-1/3 aspect-square shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm relative">
                  {menu.image_url ? (
                    <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover absolute inset-0" />
                  ) : (
                    <div className="w-full h-full bg-red-400 absolute inset-0" />
                  )}
                </div>
                <div className="w-full sm:w-2/3 flex flex-col gap-3">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-tight">
                    {menu.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button 
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors text-lg"
                        onClick={() => handleQuantityChange(quantity - 1)}
                      >-</button>
                      <input 
                        type="number" 
                        value={quantity} 
                        className="w-12 sm:w-16 text-center py-1 text-sm sm:text-base focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        min={1} 
                        max={100} 
                        onChange={(e) => handleQuantityChange(+e.target.value)} 
                      />
                      <button 
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors text-lg"
                        onClick={() => handleQuantityChange(quantity + 1)}
                      >+</button>
                    </div>
                    <span className="text-sm sm:text-base text-gray-600 font-medium whitespace-nowrap">
                      x {formatIDR(menu.price)}
                    </span>
                  </div>
                  <div className="mt-2 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-500 font-medium">Total:</span>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-blue-600">
                      {formatIDR(quantity * menu.price)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions className="px-4 py-3 md:px-6 md:py-4 bg-gray-50/50">
              <Button onClick={handleClose} variant="outlined" color="inherit" className="text-sm sm:text-base rounded-lg py-1.5 px-4 normal-case font-medium">
                Kembali
              </Button>
              <Button onClick={handleConfirm} variant="contained" color="primary" disableElevation className="text-sm sm:text-base rounded-lg py-1.5 px-6 normal-case font-medium bg-blue-600 hover:bg-blue-700">
                Tambah
              </Button>
            </DialogActions>
          </>
      }
    </Dialog>
  )
}

export default function HomePage() {
  const loggedInImage = "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628039/samples/animals/cat.jpg";
  const guestImage = "https://res.cloudinary.com/dmzqupudd/image/upload/v1775628048/samples/shoe.jpg";

  const OFFSET_DEFAULT = 0;
  const LIMIT_DEFAULT = 8;
  const TIMEOUT_MS = 500;


  const [, setError] = useState<Error | null>(null);

  const { isLoggedIn, getUserPayload } = useAuth();
  const [profile, setProfile] = useState({
    name: "User",
    profileUrl: loggedInImage,
  })

  const [snackbarOpen, setSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [loginDialogOpen, setLoginDialog] = useState(false);

  const [offset, setOffset] = useState(() => OFFSET_DEFAULT)
  const [limit, setLimit] = useState(LIMIT_DEFAULT)
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>(() => "")
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [menu, setMenu] = useState<MenuResponseData | null>(() => null);
  const [menuLoading, setMenuLoading] = useState(true);

  const [currentMenu, setCurrentMenu] = useState<MenuData | null>(null);
  const [menuQuantity, setQuantity] = useState(1);

  const [menuCount, setMenuCount] = useState(0);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    // stale token problem (auth context masih nyimpan token lama waktu refresh), eksperimen ganti langsung akses localstorage
    setAccessToken(localStorage.getItem('token') || "");
  }, [isLoggedIn])

  async function handleMenuConfirm() {
    if (currentMenu !== null) {
      if (!accessToken || accessToken.trim() === "") {
        setSeverity("error");
        setSnackbarMessage("Sesi Anda telah berakhir! Harap login ulang.");
        setSnackbar(true);
        setCurrentMenu(null);
        return;
      }

      let status;
      try {
        const result = await addToCart(currentMenu, menuQuantity, accessToken);
        status = result.status;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.name === 'TypeError' && err.message === 'NetworkError when attempting to fetch resource.') {
          setError(() => {
            // THROW BUAT DIHANDLE error.tsx!!!
            throw err;
          })
        }

        const errData = JSON.parse(err.message);

        status = errData.status;
      }
      if (status === 200 || status === 204) {
        setSeverity("success");
        setSnackbarMessage("Menu berhasil dimasukkan!");
      } else {
        if (status === 409) {
          setSeverity("error");
          setSnackbarMessage("Item telah ada di keranjang, silakan tambah kuantitas di halaman keranjang!")
        } else {
          setSeverity("error");
          setSnackbarMessage("Menu gagal dimasukkan!");
        }
      }
      setSnackbar(true);
    }
    setCurrentMenu(null);
  }

  function handleSearchTimeout(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => { setSearch(e.target.value); setOffset(0); setPage(1) }, TIMEOUT_MS))
  }

  function handlePageChange(event: ChangeEvent<unknown, Element>, page: number) {
    console.log(page);
    setOffset((page - 1) * limit);
    setPage(page);
  }

  function handleAddToCart(menu: MenuData) {
    if (!isLoggedIn) {
      return setLoginDialog(true);
    }
    else return setCurrentMenu(menu);
  }

  useEffect(() => setQuantity(1), [currentMenu]);
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
          // bakal dihandle sama error.tsx root layout
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

      try {
        const menus = await fetchMenu(offset, limit, search || undefined);
        if (menus && (menus as MenuResponseData).data) {
          setMenu(menus as MenuResponseData);
        }
        setMenuLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setMenuLoading(false);
        if (err.name === 'TypeError' && err.message === 'NetworkError when attempting to fetch resource.') {
          setError(() => {
            // THROW BUAT DIHANDLE error.tsx!!!
            throw err;
          })
        }
      }

    }
    menuData();
  }, [offset, limit, search]);

  useEffect(() => {
    async function doProcess() {
      if (currentMenu == null) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const response = await fetchCartItems(token) as ResponseObject;
          const data = response.data as CartResponseData;
          if (response && response.data) {
            setMenuCount(data!.items?.length || 0)
          }
        } catch (err) {
          setError(() => {
            throw err;
          })
        }
      }
    }
    doProcess();
  }, [currentMenu, isLoggedIn]);

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
              loading="eager"
              sizes="(max-width: 768px) 40px, 56px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-xl font-bold text-black leading-tight">
              {isLoggedIn ? `Halo, ${profile.name}` : "Sahera Pak Kirno"}
            </h1>
            {isLoggedIn && <span className="text-[10px] md:text-xs text-gray-500">Selamat Makan!</span>}
          </div>
        </div>

        <div>
          {isLoggedIn ? (
            <Badge color="secondary" badgeContent={menuCount}>
              <Link href="/cart" className="p-2 md:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-md active:scale-90 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6">
                  <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </Link>
            </Badge>
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
        (menu && menu.data ? (
          <>
            <main className="self-center px-4 py-4 md:px-6 md:py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 max-w-7xl mx-auto">
              {(menu.data ?? []).map((item) => <MenuCard key={item.menu_id} menu={item} handle={handleAddToCart} />)}
            </main>

            {page >= Math.ceil(menu.count / limit) && <Divider className="text-xs px-6 mb-2">Anda telah mencapai akhir halaman~</Divider>}

            <Pagination
              className="size-fit py-3 mx-auto text-2xl"
              count={Math.ceil((menu.count ?? 0) / limit)}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              page={page}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">Tidak ada menu tersedia</div>
        ))
      }

      {/* Popups */}
      <AddToCartPromptDialog
        menu={currentMenu}
        quantity={menuQuantity}
        handleClose={() => setCurrentMenu(null)}
        handleQuantityChange={(n) => setQuantity(n <= 0 ? 0 : (n >= 101 ? 100 : n))}
        handleConfirm={handleMenuConfirm}
      />
      <LoginPromptDialog handleClose={() => setLoginDialog(false)} open={loginDialogOpen} />
      {/* <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbar(false)}
        onClick={() => setSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={severity as AlertColor} onClick={() => setSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar> */}
      <BottomSnackbar
        open={snackbarOpen}
        severity={severity}
        snackbarMessage={snackbarMessage}
        closeAction={() => setSnackbar(false)}
      >
      </BottomSnackbar>
    </div>
  );
}
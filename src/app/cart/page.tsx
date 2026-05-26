"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { CartResponseData } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import { fetchAllMenus } from "@/utils/fetchUtils";
import { ResponseObject } from "@/utils/interfaces";
import { Box, CircularProgress } from "@mui/material";
import { formatIDR } from "@/utils/utils";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function CartPage() {

    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('token') || "");
    const { isLoggedIn, getUserPayload } = useAuth();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [cart, setCart] = useState<CartResponseData | null>();

    function countMenuPriceTotal() {
        if (cart) {
            let res = 0;
            for (const item of cart!.items) {
                res += item.price * item.quantity!;
            }
            return res;
        }
        return 0;
    }

    useEffect(() => {
        async function doProcess() {
            setLoading(true);
            const response = await fetchAllMenus(accessToken);
            if (response != null) setCart((response as CartResponseData));
            setLoading(false);
        }
        doProcess();
    }, [])

    const cartItems = [
        {
            id: 1,
            nama: "Nasi Goreng",
            jumlah: 1,
        },
        {
            id: 2,
            nama: "Tahu Goreng",
            jumlah: 2,
        },
        {
            id: 3,
            nama: "Es Teh",
            jumlah: 1,
        }
    ];

    if (isLoading) return (
        <div className="min-h-screen min-w-screen flex flex-col justify-center items-center align-middle bg-white p-6 pb-20 font-serif text-black">
            <CircularProgress />
            <div>Sedang memuat...</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white p-6 pb-20 font-serif text-black">
            {/* Tombol back */}
            <div className="mb-4 max-w-7xl mx-auto">
                <Link href="/" className="inline-block">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>
            </div>

            {/* isi halaman */}
            <h1 className="text-5xl md:text-4xl font-bold mb-8 tracking-tight max-w-7xl mx-auto">Cart</h1>

            <div className="space-y-4 mb-10 max-w-7xl mx-auto">
                {cart!.items.map((item) => (
                    <div key={item.menu_id} className="bg-gray-200 rounded-lg p-4 shadow-md justify-between flex items-center">
                        <span className="text-2xl font-medium">{item.name}</span>
                        <div className="flex items-center gap-3">
                            <button className="focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <span className="text-lg font-medium">{item.quantity}</span>
                            <button className="focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className=" mb-10 text-3xl max-w-7xl mx-auto">
                <div className="flex items-center" >
                    <span className="flex-1">Total</span>
                    <span className="font-mono w-fit">{formatIDR(countMenuPriceTotal())}</span>
                </div>
            </div>

            {/* tombol checkout */}
            <div className="flex justify-center flex-row gap-4 max-w-7xl mx-auto">
                <Link href="/cart/takeaway" className="flex-1">
                    <button className={`${montserrat.className} w-full bg-red-500 text-white py-7 rounded-2xl text-5xl font-bold hover:bg-blue-700 transition`}>
                        Take Away
                    </button>
                </Link>
                <Link href="/cart/delivery" className="flex-1">
                    <button className={`${montserrat.className} w-full bg-red-500 text-white py-7 rounded-2xl text-5xl font-bold hover:bg-blue-700 transition`}>
                        Delivery UNTAR 1
                    </button>
                </Link>
            </div>
        </div>);
}
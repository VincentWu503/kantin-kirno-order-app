"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { CartResponseData, MenuData } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import { deleteCartItem, updateCartItem } from "@/lib/cart";
import { CircularProgress } from "@mui/material";
import { formatIDR } from "@/utils/utils";
import { Delete } from "@mui/icons-material";
import { fetchCartItems } from "@/lib/cart";

const montserrat = Montserrat({ subsets: ["latin"] });

function CartCard({ menu, handleChange, handleDelete }: { menu: MenuData, handleChange: (menu: MenuData, quantity: number) => Promise<void>, handleDelete: (menu: MenuData) => Promise<boolean> }) {
    const [currentCount, setCount] = useState<number>(menu.quantity!);
    const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);
        if (updateTimeout) clearTimeout(updateTimeout);
        setUpdateTimeout(setTimeout(async () => {
            setUpdateTimeout(null);
            await handleChange(menu, currentCount);
            setIsLoading(false);
        }, 2000));
    }, [currentCount]);


    return (<div className="border border-black/4 bg-white rounded-lg p-4 h-fit shadow-md grid grid-cols-3 gap-2">
        <div className="col-span-1">
            <img src={menu.image_url ? menu.image_url : ""} alt={"Image:" + menu.name} /> {/* VINCENT FIX THIS!!! */}
        </div>
        <div className="flex flex-col items-start gap-3 col-span-2">
            <div className="md:text-2xl font-medium text-sm">{menu.name}</div>
            <div className="md:text-1xl font-medium text-sm">Unit: {formatIDR(menu.price)}</div>
            <div className="flex align-middle gap-1 md:gap-2">
                <button className="focus:outline-none" onClick={() => setCount(currentCount - 1 <= 0 ? 1 : (currentCount > 100 ? 100 : currentCount - 1))}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="md:w-8 md:h-8 w-5 h-5">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z" clipRule="evenodd" />
                    </svg>
                </button>
                <input
                    type="number"
                    className="w-8 text-center appearance-none"
                    min={1}
                    max={100}
                    value={currentCount}
                    step={1}
                    onChange={(e) => isNaN(+e.target.value) ? setCount(currentCount) : +e.target.value > 100 ? setCount(100) : +e.target.value <= 0 ? setCount(1) : setCount(Math.floor(+e.target.value))}
                />
                <button className="focus:outline-none" onClick={() => setCount(currentCount + 1 >= 100 ? 100 : (currentCount <= 0 ? 1 : currentCount + 1))}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="md:w-8 md:h-8 w-5 h-5" >
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                    </svg>
                </button>
                {isLoading ? <CircularProgress color="info" className="ml-2" size={"2rem"} /> : undefined}
            </div>
            <div className="text-green-900 font-bold md:text-2xl md:border-t-2 md:px-2 md:pt-2 inline">{formatIDR(menu.price * currentCount)}</div>
            <button
                className="self-end border-2 border-red-500 hover:bg-red-200 focus:bg-red-800 transition p-2 rounded-xl block"
                onClick={() => handleDelete(menu)}
            >
                <Delete color="error" />
            </button>
        </div>
    </div>)
}

export default function CartPage() {

    const { isLoggedIn, getUserPayload, getToken } = useAuth();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [cart, setCart] = useState<CartResponseData | null>();
    const [totalPrice, setTotalPrice] = useState<number | null>();
    const [priceUpdateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);


    const [snackbarActive, setSnackbar] = useState<boolean>(false);

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

    async function refreshCart() {
        const accessToken = getToken(); // kayak gini aja, kalo set nilai access token per page ntar malah manggil refresh setiap page refresh 
        if (!accessToken) return;
        const response = await fetchCartItems(accessToken);
        if (response != null) setCart((response as CartResponseData));
    }
    useEffect(() => {
        const token = getToken();
        if (!token) return;
        async function doProcess() {
            setLoading(true);
            await refreshCart();
            setLoading(false);
        }
        doProcess();
    }, [isLoggedIn]);

    async function handleMenuChangeQuantity(menu: MenuData, quantity: number): Promise<void> {
        const accessToken = getToken();
        if (!accessToken) return;
        if (menu !== null && quantity != 0) { //Basic check
            if (await updateCartItem(menu!, quantity, accessToken)) {
                setSnackbar(true);
                setUpdateTimeout(setTimeout(async () => {
                    await refreshCart();
                    setUpdateTimeout(null);
                }, 2000));
                return;
            }
        }
        return;
    }

    async function handleMenuDelete(menu: MenuData): Promise<boolean> {
        const accessToken = getToken();
        if (!accessToken) return false;

        if (menu !== null) {
            if (await deleteCartItem(menu, accessToken)) {
                await refreshCart()
                return true
            }
        } return false;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setTotalPrice(countMenuPriceTotal()) }, [cart]);

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

            <div className="space-y-4 mb-6 md:mb-10 max-w-7xl mx-auto">
                {cart!.items.map((item) =>
                    <CartCard
                        key={item.menu_id}
                        menu={item}
                        handleChange={handleMenuChangeQuantity}
                        handleDelete={handleMenuDelete}
                    />)}
            </div>

            <div className="mb-6 md:mb-10 font-bold text-lg md:text-3xl max-w-7xl mx-auto">
                <div className="flex items-center" >
                    <span className="flex-1">Total</span>
                    <span className="font-mono w-fit">{priceUpdateTimeout == null ? undefined : <CircularProgress className="text-red" />}{formatIDR(totalPrice!)}</span>
                </div>
            </div>

            {/* tombol checkout */}
            <div className="flex justify-center flex-row gap-4 max-w-7xl mx-auto">
                <Link href="/cart/checkout" className="flex-1">
                    <button className={`${montserrat.className} w-full border-green-400 border-2 text-green-400 py-7 rounded-2xl text-5xl font-bold hover:bg-green-400 hover:text-white transition`}>
                        Checkout
                    </button>
                </Link>
            </div>
        </div>);
}
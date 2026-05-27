"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { CartResponseData, MenuData } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import { deleteCartItem, fetchAllMenus, fetchCartPrice, updateCartItem } from "@/utils/fetchUtils";
import { CircularProgress, Paper, Tooltip } from "@mui/material";
import { formatIDR } from "@/utils/utils";
import { Error } from "@mui/icons-material";

function CartItem({ menu }: { menu: MenuData }) {
    return (<div className="grid-cols-2 grid gap-1 h-fit px-2 pt-2">
        <div className="col-span-1">
            <img src={menu.image_url ? menu.image_url : ""} alt={"Image:" + menu.name} /> {/* VINCENT FIX THIS!!! */}
        </div>
        <div className="col-span-1 flex flex-col">
            <div className="h-auto">{menu.name}</div>
            <div className="text-right text-gray-400"><b className="text-black">{formatIDR(menu.price)} &#215; {menu.quantity}</b></div>
        </div>

    </div>)
}

export default function CartPage() {

    const { isLoggedIn, getUserPayload, getToken } = useAuth();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [cart, setCart] = useState<CartResponseData | null>();
    const [totalPrice, setTotalPrice] = useState<number | null>();

    const [accessToken, setAccessToken] = useState("");

    //Form states
    const [location, setLocation] = useState<{ building: string, floor: string, extra: string } | null>({} as { building: string, floor: string, extra: string });
    const [notes, setNotes] = useState<string>("");
    const [takeaway, setTakeaway] = useState<boolean>(false);


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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setAccessToken(getToken() || "");
        async function doProcess() {
            //set cart
            const response = await fetchAllMenus(accessToken);
            if (response != null) setCart((response as CartResponseData));
            //set price total
            const priceResponse = await fetchCartPrice(accessToken, location);
            if (priceResponse != null) setTotalPrice((priceResponse as { price: number }).price);
            setLoading(false);
        }
        doProcess();
    }, [])
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
            <h1 className="text-5xl w-fit md:text-4xl font-bold mb-8 tracking-tight max-w-7xl mx-auto">Checkout</h1>

            { /* Left Right split */}
            <div className="grid grid-cols-3 gap-2 max-w-7xl h-fit mx-auto">
                {/* Order details Form*/}
                <div className="col-span-2 h-fit">
                    <div className="px-2 py-2 h-fit font-bold text-2xl">Pemesanan</div>
                    <Paper className="col-span-2 h-fit">
                        <form>

                        </form>
                    </Paper>
                </div>

                {/* Order Items and price */}
                <div className="col-span-1 h-fit flex flex-col">
                    {/*Order Items*/}
                    <div className="px-2 py-2 h-fit font-bold text-2xl">Daftar Makanan</div>
                    <Paper className="h-fit pb-2" elevation={2} square>
                        {cart!.items.map((item) =>
                            <CartItem
                                key={item.menu_id}
                                menu={item}
                            />)}
                    </Paper>

                    {/*Cart Price*/}
                    <div className="px-2 py-2 pt-4 h-fit font-bold text-2xl">Harga Pesanan</div>
                    <Paper className="h-fit py-2 px-2 flex gap-2 flex-col" elevation={2}>
                        <div className="flex justify-between">
                            <span className="block">Biaya Makanan</span>
                            <span className="block">{formatIDR(countMenuPriceTotal())}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="block">Biaya Pengiriman</span>
                            <span className="block">
                                <Tooltip
                                    describeChild
                                    title={
                                        (
                                            <>
                                                Biaya admin dihitung berdasarkan lokasi pengiriman pesanan
                                            </>
                                        )
                                    }>
                                    <Error fontSize="small" color="disabled" />
                                </Tooltip>
                                &nbsp;{(totalPrice! - countMenuPriceTotal()) ? formatIDR(totalPrice! - countMenuPriceTotal()) : "Gratis"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="block">Total</span>
                            <span className="block">{formatIDR(totalPrice!)}</span>
                        </div>
                    </Paper>

                    {/*Order button*/}
                    <button className="h-fit p-2 text-2xl font-bold text-white bg-green-600 rounded-xl my-4 self-end">
                        Bayar Pesanan &rarr;
                    </button>
                </div>
            </div>
        </div>);
}
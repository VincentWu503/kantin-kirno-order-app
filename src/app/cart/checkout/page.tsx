/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { ChangeEvent, ReactNode, SyntheticEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { CartResponseData, MenuData } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import { Checkbox, CircularProgress, FormControl, FormControlLabel, FormGroup, FormLabel, Input, InputLabel, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Stack, TextField, Tooltip } from "@mui/material";
import { formatIDR } from "@/utils/utils";
import { CheckBox, Error } from "@mui/icons-material";
import { fetchAllMenus, fetchCartPrice } from "@/lib/cart";
import { jwtDecode } from "jwt-decode";
import { fetchUser } from "@/lib/users";

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

    const PHONE_REGEX = new RegExp('^(\\+62|62|0)[8123456789][0-9]{8,13}$');

    const { isLoggedIn, getUserPayload, getToken } = useAuth();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [cart, setCart] = useState<CartResponseData | null>();
    const [totalPrice, setTotalPrice] = useState<number | null>();

    const [accessToken, setAccessToken] = useState("");

    //Form states
    const [location, setLocation] = useState<{ building: string, floor: string, extra: string }>({ building: "Utama", floor: "1", extra: "" } as { building: string, floor: string, extra: string });
    const [notes, setNotes] = useState<string>("");
    const [takeaway, setTakeaway] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");
    const [name, setName] = useState<string>("");

    const [checked, setCheck] = useState<boolean>(false);

    const [error, setError] = useState<{
        phone: boolean,
        location: boolean,
    }>({
        phone: false,
        location: false,
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError({ ...error, phone: !PHONE_REGEX.test(phone) });
    }, [phone]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError({ ...error, location: location.building.length == 0 || location.floor.length == 0 });
    }, [location])

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

    function handlePhoneChanged(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setPhone(e.target.value);
    }

    function handleDeliverChoiceChanged(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setTakeaway(e.target.value === "deliver" ? false : true);
    }

    function handleBuildingChange(e: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: string; }, Element> | (Event & { target: { value: string; name: string; }; }), child: ReactNode) {
        setLocation({ ...location, building: e.target.value })
    }

    function handleFloorChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setLocation({ ...location, floor: e.target.value })
    }

    function handleExtraChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setLocation({ ...location, extra: e.target.value })
    }
    function handleNotesChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setNotes(e.target.value);
    }

    function handleCheckChange(e: SyntheticEvent<Element, Event>, checked: boolean) {
        setCheck(checked);
    }


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setAccessToken(getToken() || "");

        async function doProcess() {
            //set forms
            const data = ((await fetchUser(accessToken))).data as unknown as any;
            console.log(data);
            setPhone(data.phone_no || "+62");
            setName(data.username);


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
                    <Paper className="col-span-2 h-fit p-3" elevation={2}>
                        { /* Account Info Needs profile data */}
                        <Stack>
                            <div className="font-bold text-3xl">Informasi Pembeli</div>
                            <div className="flex gap-2 m-2 mt-4">
                                <TextField
                                    variant="outlined"
                                    label="Nama"
                                    slotProps={{ input: { readOnly: true, disabled: true, className: "h-fit w-fit p-0 bg-gray-200" } }}
                                    value={name}
                                    size="small"
                                    required
                                    helperText={
                                        "Nama profil"
                                    }
                                />
                                <TextField
                                    variant="outlined"
                                    label="Nomor Telp (WA)"
                                    slotProps={{ input: { className: "h-fit w-fit p-0" } }}
                                    value={phone}
                                    size="small"
                                    type="tel"
                                    onChange={handlePhoneChanged}
                                    error={error["phone"]}
                                    required
                                />
                            </div>
                        </Stack>

                        {/*Delivery info */}
                        <Stack className="gap-2">
                            <div className="font-bold text-3xl">Pengiriman</div>
                            <FormControl required>
                                <FormLabel>Opsi Pengiriman</FormLabel>
                                <RadioGroup row value={takeaway ? "takeaway" : "deliver"} onChange={handleDeliverChoiceChanged}>
                                    <FormControlLabel control={<Radio />} value={"deliver"} label="Antar ke Untar 1"></FormControlLabel>
                                    <FormControlLabel control={<Radio />} value={"takeaway"} label="Ambil di tempat"></FormControlLabel>
                                </RadioGroup>
                            </FormControl>
                            <Stack direction="row" className="gap-2">
                                <FormControl required className="w-fit" error={error.location && !takeaway}>
                                    <FormLabel className="text-center">Gedung</FormLabel>
                                    <Select value={location.building} onChange={handleBuildingChange} disabled={takeaway} className={`transition w-fit ${takeaway ? "bg-gray-200" : ""}`}>
                                        <MenuItem value="Utama">Utama</MenuItem>
                                        <MenuItem value="M">M</MenuItem>
                                        <MenuItem value="P">P</MenuItem>
                                        <MenuItem value="L">L</MenuItem>
                                        <MenuItem value="J">J</MenuItem>
                                        <MenuItem value="R">R</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl required className="w-fit" error={error.location && !takeaway}>
                                    <FormLabel className="text-center">Lantai</FormLabel>
                                    <OutlinedInput startAdornment="Lt. " value={location.floor} onChange={handleFloorChange} className={`transition w-fit ${takeaway ? "bg-gray-200" : ""}`} slotProps={{ input: { className: "text-center w-10" } }} disabled={takeaway}></OutlinedInput>
                                </FormControl>
                                <FormControl className="w-fit" >
                                    <FormLabel className="text-center">Informasi Tambahan</FormLabel>
                                    <OutlinedInput className={`transition w-fit ${takeaway ? "bg-gray-200" : ""}`} value={location.extra} onChange={handleExtraChange} slotProps={{ input: { className: "size-fit" } }} placeholder="Info Lokasi Tambahan" disabled={takeaway}></OutlinedInput>
                                </FormControl>
                            </Stack>
                            <FormControl>
                                <FormLabel>Catatan untuk penjual</FormLabel>
                                <TextField
                                    multiline
                                    label="Catatan untuk pesanan"
                                    variant="outlined"
                                    value={notes}
                                    onChange={handleNotesChange}
                                />
                            </FormControl>
                        </Stack>
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
                        <div className="flex justify-between font-bold text-2xl pt-2 border-t-[1]">
                            <span className="block">Total</span>
                            <span className="block">{formatIDR(totalPrice!)}</span>
                        </div>
                    </Paper>

                    {/* I Agree Checkboxes */}
                    <FormGroup className="h-fit p-2 text-xl font-bold rounded-xl my-4 mx-2">
                        <FormControlLabel label={<span className="text-blue-900">Saya setuju bahwa data yang saya masukkan sudah sesuai</span>} control={<Checkbox value={checked} onChange={handleCheckChange} />} required />
                    </FormGroup>

                    {/*Order button*/}
                    <button
                        className={`transition h-fit p-2 text-2xl font-bold rounded-xl my-4 self-end ${(!checked || error.location || error.phone) ? "bg-gray-600 text-gray-400" : "bg-green-400 text-white hover:bg-green-500 active:bg-green-600"}`}
                        disabled={checked}
                    >
                        Bayar Pesanan &rarr;
                    </button>
                </div>
            </div>
        </div >);
}
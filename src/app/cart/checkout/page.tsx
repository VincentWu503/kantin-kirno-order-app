/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { ChangeEvent, ReactNode, SyntheticEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CartResponseData, MenuData } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, FormLabel, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Stack, TextField, Tooltip } from "@mui/material";
import { formatIDR } from "@/utils/utils";
import { Error } from "@mui/icons-material";
import { fetchCartPrice, fetchCartItems } from "@/lib/cart";
import { fetchUser } from "@/lib/users";
import { fetchRestaurantStatus } from "@/lib/restaurant";

function CartItem({ menu }: { menu: MenuData }) {
    return (<div className="grid grid-cols-3 gap-2 h-fit px-2 py-2 border-b">
        <div className="col-span-1">
            <img src={menu.image_url ? menu.image_url : ""} alt={"Image:" + menu.name} className="w-full h-auto object-cover rounded" />
        </div>
        <div className="col-span-2 flex flex-col justify-between">
            <div className="font-medium text-sm md:text-base line-clamp-2">{menu.name}</div>
            <div className="text-right text-gray-600 text-sm"><b className="text-black">{formatIDR(menu.price)} &#215; {menu.quantity}</b></div>
        </div>
    </div>)
}

function ConfirmModal({ open, handleClose, takeaway, location, notes, price, handleConfirm }: { open: boolean, handleClose: () => void, takeaway: boolean, location: { building: string, floor: string, extra: string }, notes: string, price: number, handleConfirm: (e: never) => void }) {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>
                Konfirmasi Pemesanan
            </DialogTitle>
            <DialogContent>
                <div className="font-normal">
                    {takeaway ?
                        <>Anda mengambil makanan anda di lokasi <b>Kantin Sahera Pak Kirno</b> </> :
                        <>Lokasi pengiriman: <b>Gedung {location.building} Untar 1 lantai {location.floor}{location.extra.length > 0 ? ` (${location.extra})` : ""}.</b></>
                    }
                </div>
                <div className="mb-2">{notes.length > 0 ? (`Catatan: ${notes}`) : undefined}</div>
                <div className="font-bold">Anda akan membayar: <span className="text-green-800 font-extrabold">{formatIDR(price)}</span></div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined" color="error">
                    Batal
                </Button>
                <Button onClick={handleConfirm} variant="contained" autoFocus>
                    Bayar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default function CartPage() {

    const PHONE_REGEX = new RegExp('^(\\+62|62|0)[8123456789][0-9]{8,13}$');

    const { isLoggedIn, getUserPayload } = useAuth();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [cart, setCart] = useState<CartResponseData | null>();
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);

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

    const cannotOrder = !isOpen || !checked || (takeaway ? false : (error.location || error.phone));
    const [modalShow, setModalShow] = useState<boolean>(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError({ ...error, phone: !PHONE_REGEX.test(phone) });
    }, [phone]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError({ ...error, location: location.building.length == 0 || location.floor.length == 0 });
    }, [location])

    useEffect(() => {
        async function doFunction() {
            setIsOpen((await fetchRestaurantStatus())!.status);
        }
        doFunction();
    }, []);

    useEffect(() => {
        async function updatePrice() {
            if (!takeaway) {
                const priceResponse = await fetchCartPrice(accessToken, location);
                if (priceResponse != null) setTotalPrice((priceResponse as { price: number }).price);
            } else {
                setTotalPrice(countMenuPriceTotal());
            }
        }
        updatePrice();
    }, [location, takeaway, accessToken]);

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

    function handleNameChange(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setName(e.target.value.slice(0, 34));
    }

    function handleCheckChange(e: SyntheticEvent<Element, Event>, checked: boolean) {
        setCheck(checked);
    }

    function handleButtonClick(_e: never) {
        setModalShow(true);
    }

    function handleButtonConfirm(_e: never) {
        //TODO: THIS
    }


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setAccessToken(localStorage.getItem('token') || "");

        async function doProcess() {

            //set forms
            const data = ((await fetchUser(accessToken))).data as unknown as any;
            console.log(data);
            setPhone(data.phone_no || "+62");
            setName(data.username);


            //set cart
            const response = await fetchCartItems(accessToken);
            if (response != null) setCart((response.data as CartResponseData));

            //set price total
            const priceResponse = await fetchCartPrice(accessToken, location);
            if (priceResponse != null) setTotalPrice((priceResponse as { price: number }).price);
            setLoading(false);
        }
        doProcess();
    }, [])


    if (isLoading) return (
        <div className="min-h-screen min-w-screen flex flex-col justify-center items-center align-middle bg-white p-6 pb-20 text-black">
            <CircularProgress />
            <div>Sedang memuat...</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white p-6 pb-20 text-black">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl h-fit mx-auto">
                {/* Order details Form*/}
                <div className="md:col-span-2 h-fit">
                    <div className="px-2 py-2 h-fit font-bold text-xl md:text-2xl">Pemesanan</div>
                    <Paper className="h-fit p-3" elevation={2}>
                        { /* Account Info Needs profile data */}
                        <Stack>
                            <div className="font-bold text-2xl md:text-3xl">Informasi Pembeli</div>
                            <div className="flex flex-col sm:flex-row gap-3 m-2 mt-4">
                                <TextField
                                    variant="outlined"
                                    label="Nama"
                                    value={name}
                                    onChange={handleNameChange}
                                    size="small"
                                    required
                                    inputProps={{ maxLength: 34 }}
                                    helperText={`Nama pembeli (${name.length}/34)`}
                                    className="flex-1"
                                />
                                <TextField
                                    variant="outlined"
                                    label="Nomor Telp (WA)"
                                    value={phone}
                                    size="small"
                                    type="tel"
                                    onChange={handlePhoneChanged}
                                    error={error["phone"]}
                                    required
                                    helperText={error["phone"] ? "Format nomor tidak valid" : ""}
                                    className="flex-1"
                                />
                            </div>
                        </Stack>

                        {/*Delivery info */}
                        <Stack className="gap-2 mt-4">
                            <div className="font-bold text-3xl">Pengiriman</div>
                            <FormControl required>
                                <FormLabel>Opsi Pengiriman</FormLabel>
                                <RadioGroup row value={takeaway ? "takeaway" : "deliver"} onChange={handleDeliverChoiceChanged}>
                                    <FormControlLabel control={<Radio />} value={"deliver"} label="Antar ke Untar 1"></FormControlLabel>
                                    <FormControlLabel control={<Radio />} value={"takeaway"} label="Ambil di tempat"></FormControlLabel>
                                </RadioGroup>
                            </FormControl>
                            <Stack direction="row" className="gap-2 flex-wrap">
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
                                    placeholder="Catatan untuk pesanan"
                                    variant="outlined"
                                    value={notes}
                                    onChange={handleNotesChange}
                                />
                            </FormControl>
                        </Stack>
                    </Paper>
                </div>

                {/* Order Items and price */}
                <div className="md:col-span-1 h-fit flex flex-col">
                    {/*Order Items*/}
                    <div className="px-2 py-2 h-fit font-bold text-xl md:text-2xl">Daftar Makanan</div>
                    <Paper className="h-fit pb-2" elevation={2}>
                        {cart!.items.map((item) =>
                            <CartItem
                                key={item.menu_id}
                                menu={item}
                            />)}
                    </Paper>

                    {/*Cart Price*/}
                    <div className="px-2 py-2 pt-4 h-fit font-bold text-xl md:text-2xl">Harga Pesanan</div>
                    <Paper className="h-fit py-2 px-2 flex gap-2 flex-col" elevation={2}>
                        <div className="flex justify-between text-sm md:text-base">
                            <span className="block">Biaya Makanan</span>
                            <span className="block font-semibold">{formatIDR(countMenuPriceTotal())}</span>
                        </div>
                        <div className="flex justify-between text-sm md:text-base">
                            <span className="flex items-center gap-1">Biaya Pengiriman
                                <Tooltip
                                    describeChild
                                    title="Biaya admin dihitung berdasarkan lokasi pengiriman pesanan"
                                >
                                    <Error fontSize="small" color="disabled" />
                                </Tooltip>
                            </span>
                            <span className="block font-semibold">{takeaway ? "Gratis" : formatIDR(Math.max(0, totalPrice - countMenuPriceTotal()))}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg md:text-2xl pt-2 border-t border-gray-300">
                            <span className="block">Total</span>
                            <span className="block text-green-600">{formatIDR(totalPrice)}</span>
                        </div>
                    </Paper>

                    {/* I Agree Checkboxes */}
                    <FormGroup className="h-fit p-2 text-sm md:text-base font-semibold rounded-xl my-4 mx-2">
                        <FormControlLabel label={<span className="text-blue-900">Saya setuju bahwa data yang saya masukkan sudah sesuai</span>} control={<Checkbox checked={checked} onChange={handleCheckChange} />} required />
                    </FormGroup>

                    {/*Order button*/}
                    <button
                        className={`transition h-fit p-2 md:p-3 text-lg md:text-2xl font-bold rounded-xl my-4 w-full md:w-auto ${cannotOrder ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-green-400 text-white hover:bg-green-500 active:bg-green-600"}`}
                        disabled={cannotOrder}
                        onClick={handleButtonClick}
                    >
                        Bayar Pesanan &rarr;
                    </button>
                    <div className={`text-center text-sm md:text-base font-semibold rounded px-2 py-1 ${isOpen ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                        {isOpen ? "✓ Kantin sedang buka" : "✗ Kantin sedang tutup dan tidak melayani secara online"}
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={modalShow}
                handleClose={() => setModalShow(false)}
                location={location}
                takeaway={takeaway}
                notes={notes}
                price={totalPrice!}
                handleConfirm={handleButtonConfirm}
            />

        </div >
    );
}
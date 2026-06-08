/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { ChangeEvent, ReactNode, SyntheticEvent, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CartResponseData, MenuData } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, MenuItem, OutlinedInput, Radio, RadioGroup, Select, Stack, TextField, Tooltip } from "@mui/material";
import { formatIDR } from "@/utils/utils";
import { Error } from "@mui/icons-material";
import { fetchCartPrice, fetchCartItems } from "@/lib/cart";
import { fetchRestaurantStatus } from "@/lib/restaurant";
import { ResponseObject } from "@/utils/interfaces";
import { fetchCreateOrder } from "@/lib/order";
import { useRouter } from "next/navigation";

// <MenuItem value="Utama">Utama</MenuItem>
// <MenuItem value="M">M</MenuItem>
// <MenuItem value="P">P</MenuItem>
// <MenuItem value="L">L</MenuItem>
// <MenuItem value="J">J</MenuItem>
// <MenuItem value="R">R</MenuItem>

enum BuildingTypes {
    Utama = "Utama",
    M = "M",
    P = "P",
    L = "L",
    J = "J",
    R = "R",
}

function CartItem({ menu }: { menu: MenuData }) {
    return (<div className="grid grid-cols-3 gap-2 h-fit px-2 py-2">
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
    const router = useRouter();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [cart, setCart] = useState<CartResponseData | null>();

    // harga menu setelah perhitungan, perhitungan valid adalah perhitungan dari backend
    const [totalPrice, setTotalPrice] = useState<number | null>(null);

    // harga menu sebelum penambahan uang parkir
    const [subtotalPrice, setSubtotalPrice] = useState<number>(0);
    // uang parkir
    const [deliveryFee, setDeliveryFee] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    //Form states
    const [location, setLocation] = useState<{ building: BuildingTypes, floor: string, extra: string }>(
        { building: BuildingTypes.Utama, floor: "1", extra: "" } as
        { building: BuildingTypes, floor: string, extra: string }
    );
    const [notes, setNotes] = useState<string>("");
    const [takeaway, setTakeaway] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");
    const [name, setName] = useState<string>("");

    const [checked, setCheck] = useState<boolean>(false);

    const [, setGlobalError] = useState<Error | null>(null);
    const [error, setError] = useState<{
        phone: boolean,
        location: boolean,
    }>({
        phone: false,
        location: false,
    });

    const cannotOrder = error.phone || !isOpen || !checked || (takeaway ? false : (error.location));
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
        const fee = countDeliveryFee();
        setDeliveryFee(fee);
    }, [location.building, takeaway])

    useEffect(() => {
        const subtotal = countMenuSubtotal()
        // console.log(subtotal)
        setSubtotalPrice(subtotal);
    }, [cart])

    useEffect(() => {
        // const accessToken = localStorage.getItem('token') || "";
        async function updatePrice() {
            if (!takeaway) {
                // console.log(location)
                const price = await calculateActualPrice();

                // console.log(priceResponse.price);
                if (price != null) setTotalPrice((price as number));
            } else {
                setTotalPrice(subtotalPrice);
            }
        }
        updatePrice();
    }, [location, takeaway]);

    async function calculateActualPrice() {
        try {
            const accessToken = localStorage.getItem('token') || "";
            const price = await fetchCartPrice(accessToken, location) as ResponseObject;
            // console.log(price)
            const priceResponse = price.data as any;

            return priceResponse.price;
        } catch (err) {
            setGlobalError(() => {
                throw err;
            })
        }
    }

    function countMenuSubtotal() {
        if (cart) {
            let res = 0;
            for (const item of cart!.items) {
                res += Number(item.price) * Number(item.quantity!);
            }
            // console.log(res)
            return res;
        }
        return 0;
    }

    function countDeliveryFee() {
        if (takeaway) return 0;
        const chargedBuildings: BuildingTypes[] = [
            BuildingTypes.L,
            BuildingTypes.R,
            BuildingTypes.J
        ]

        const building: BuildingTypes = location.building

        const fee = chargedBuildings.includes(building) ? 2000 : 0;

        return fee;
    }

    function handlePhoneChanged(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setPhone(e.target.value);
    }

    function handleDeliverChoiceChanged(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
        setTakeaway(e.target.value === "deliver" ? false : true);
    }

    function handleBuildingChange(e: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: BuildingTypes; }, Element> | (Event & { target: { value: BuildingTypes; name: string; }; }), child: ReactNode) {
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
        setName(e.target.value.slice(0, 32));
    }

    function handleCheckChange(e: SyntheticEvent<Element, Event>, checked: boolean) {
        setCheck(checked);
    }

    function handleButtonClick(_e: never) {
        setModalShow(true);
    }

    async function handleButtonConfirm(_e: never) {
        const accessToken = localStorage.getItem("token") || "";
        try {
            const checkoutData = await fetchCreateOrder(
                takeaway ? "" : location.building,
                takeaway ? "" : location.floor,
                takeaway ? "" : location.extra,
                notes,
                name,
                phone,
                accessToken
            ) as ResponseObject;

            const data = checkoutData.data as any;
            if (data.payment.url) router.replace(data.payment.url);

        } catch (err) {
            setGlobalError(() => {
                throw err;
            })
        }
    }

    useEffect(() => {
        sessionStorage.removeItem('error');
        if (!isLoggedIn) { 
            sessionStorage.setItem("error", "Anda harus login terlebih dahulu untuk checkout!")
            router.replace('/');
        }

        
    }, [router, isLoggedIn])


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        let accessToken = localStorage.getItem('token') || "";
        if (!accessToken) return;
        async function doProcess() {
            //set forms
            const data = getUserPayload() as unknown as any;
            setPhone(data.phone_no || "+62");
            setName(data.username || "");

            //set cart
            const response = await fetchCartItems(accessToken) as ResponseObject;
            const cartsData = response.data as CartResponseData;
            if (response != null) setCart((cartsData));

            // update token
            accessToken = localStorage.getItem('token') || ""; 
            //set price total (backend)
            const priceResponse = await fetchCartPrice(accessToken, location) as ResponseObject;

            const priceData = priceResponse.data as any;
            if (priceResponse != null) setTotalPrice((priceData.price || 0));
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
                    <div className="border border-black/4 bg-white rounded-lg p-4 h-fit shadow-md">
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
                                    // inputProps={{ maxLength: 32 }} // di gw ini invalid props
                                    slotProps={{
                                        htmlInput: { maxLength: 32 }
                                    }}
                                    helperText={`Nama pembeli (${name.length}/32)`}
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
                                    helperText={error["phone"] ? "Format nomor tidak valid" : "Pastikan nomor Anda bisa dihubungi, ya."}
                                    className="flex-1"
                                />
                            </div>
                        </Stack>

                        {/*Delivery info */}
                        <Stack className="gap-2 mt-4" direction="column">
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
                                    <FormLabel>Gedung</FormLabel>
                                    <Select value={location.building}
                                        onChange={handleBuildingChange}
                                        disabled={takeaway}
                                        className={`transition w-fit ${takeaway ? "bg-gray-200" : ""}`}
                                    >
                                        {/* <MenuItem value="Utama">Utama</MenuItem>
                                        <MenuItem value="M">M</MenuItem>
                                        <MenuItem value="P">P</MenuItem>
                                        <MenuItem value="L">L</MenuItem>
                                        <MenuItem value="J">J</MenuItem>
                                        <MenuItem value="R">R</MenuItem> */}
                                        <MenuItem value={BuildingTypes.Utama} >Utama</MenuItem>
                                        <MenuItem value={BuildingTypes.M} >M</MenuItem>
                                        <MenuItem value={BuildingTypes.P} >P</MenuItem>
                                        <MenuItem value={BuildingTypes.L} >L</MenuItem>
                                        <MenuItem value={BuildingTypes.J} >J</MenuItem>
                                        <MenuItem value={BuildingTypes.R} >R</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl required className="w-fit" error={error.location && !takeaway}>
                                    <FormLabel>Lantai</FormLabel>
                                    <OutlinedInput startAdornment="Lt. "
                                        value={location.floor}
                                        onChange={handleFloorChange}
                                        className={`transition w-fit ${takeaway ? "bg-gray-200" : ""}`}
                                        slotProps={{ input: { className: "text-center w-10" } }}
                                        disabled={takeaway}
                                    >
                                    </OutlinedInput>
                                </FormControl>

                            </Stack>
                            <FormControl>
                                <FormLabel>Informasi Tambahan</FormLabel>
                                <OutlinedInput
                                    value={location.extra}
                                    onChange={handleExtraChange}
                                    placeholder="Info Lokasi Tambahan"
                                    disabled={takeaway}
                                >
                                </OutlinedInput>
                            </FormControl>
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
                    </div>
                </div>

                {/* Order Items and price */}
                <div className="md:col-span-1 h-fit flex flex-col">
                    {/*Order Items*/}
                    <div className="px-2 py-2 h-fit font-bold text-xl md:text-2xl">Daftar Makanan</div>
                    <div className="border border-black/4 bg-white rounded-lg p-2 h-fit shadow-md">
                        {cart!.items.map((item: MenuData, index: number, array: MenuData[]) => (
                            <div key={item.menu_id}>
                                <CartItem menu={item} />

                                {index < array.length - 1 && (
                                    <Divider></Divider>
                                )}
                            </div>
                        ))}
                    </div>

                    {/*Cart Price*/}
                    <div className="px-2 py-2 pt-4 h-fit font-bold text-xl md:text-2xl">Harga Pesanan</div>
                    <div className="border border-black/4 bg-white rounded-lg p-4 h-fit shadow-md flex gap-2 flex-col">
                        <div className="flex justify-between text-sm md:text-base">
                            <span className="block">Biaya Makanan</span>
                            <span className="block font-semibold">{formatIDR(subtotalPrice)}</span>
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
                            <span className="block font-semibold">{deliveryFee == 0 ? "Gratis" : formatIDR(deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg md:text-2xl pt-2 border-t border-gray-300">
                            <span className="block">Total</span>
                            <span className="block text-green-600">{formatIDR(subtotalPrice + deliveryFee)}</span>
                        </div>
                    </div>

                    {/* I Agree Checkboxes */}
                    <FormGroup className="h-fit p-2 text-sm md:text-base font-semibold rounded-xl my-4 mx-2">
                        <FormControlLabel label={<span className="text-blue-900">Saya setuju bahwa data yang saya masukkan sudah sesuai</span>} control={<Checkbox checked={checked} onChange={handleCheckChange} />} required />
                    </FormGroup>

                    {/*Order button*/}
                    <button
                        className={`transition h-fit py-2 px-4 md:py-3 md:px-6 text-lg md:text-3xl font-bold rounded-full my-4 w-full md:w-auto ${cannotOrder ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-400 active:bg-green-700"}`}
                        disabled={cannotOrder}
                        onClick={handleButtonClick}
                    >
                        Bayar Pesanan &rarr;
                    </button>
                    <div className={`text-center text-sm md:text-base font-semibold rounded-full px-2 py-1 ${isOpen ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
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
                price={subtotalPrice || 0 + deliveryFee || 0}
                handleConfirm={handleButtonConfirm}
            />

        </div >
    );
}
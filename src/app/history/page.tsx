"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWrapper } from "@/utils/fetchWrapper";
import Image from "next/image";
import { fetchCompletedOrders } from "@/lib/order";

// vin or siapa pun tolong jangan hapus comment gw. gw udh pusing bacac code seniri jadi gw kasih tanda, so dont touch it.
// data place holder ( jo minta ada 1 pas blm login)
const daftarPesanan = [
  {
    id: 1,
    namaPesanan: "pesanan 1",
    tanggal: "02/08/2024",
    totalHarga : "Rp. 21.000", // dipake pricelist gofood
    items: [
      { nama: "Sate Kulit", harga: "Rp. 16.000", image_url: "" },
      { nama: "Tahu Goreng",harga: "Rp. 5.000", image_url: "" },
    ],
  }
];

// data be pas udh log in 
// vin atau jo bagian ini please check cors be gw masih error ga bisa login
interface OrderDetail {
    nama: string;
    harga: number;
    image_url?: string;
}

interface Order {
    order_id: string;
    tanggal: string;
    namaPesanan: string;
    totalHarga: number;
    items: OrderDetail[];
}

// pembuatan function buat main coding gw ga terlalu banyak mata gw sakit lait terlalu banyak layar.
function ItemCard({ nama, harga, image_url }: { nama: string; harga: string; image_url?: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                {image_url ? (
                    <Image src={image_url} alt={nama} fill className="object-cover rounded-xl md:rounded-2xl" />
                ) : (
                    <div className="w-full h-full bg-red-400" />
                )}
            </div>
            <p className="text-base font-normal leading-tight">{nama}</p>
            <p className="text-sm font-normal leading-tight">{harga}</p>
        </div>
    );
}

// bagian ini penambahan function format rupiah ama tanggal ( ga tau fungsi ok tak gw liat dari tempat lain)
// https://medium.com/@padamghimire/creating-a-currency-formatter-in-typescript-c45c6cf199d7 ( link dokumentasi kalo nanti gw fix lupa baca ini jangan dihapus)
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

// ini code wa fix dikit ama ai coba cek bener ga fungsi pas login
function formatTanggal(isoString: string): string {
    const d = new Date(isoString);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

// code utama layout kek mana
export default function HistoryPage() {
    const { isLoggedIn, getUserPayload } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!isLoggedIn) {
        setLoading(false);
        return;
        }

        const loadOrders = async () => {
        try {
            // const token = getToken();
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const payload = getUserPayload() as unknown as { user_id: string } | null;
            if (!payload) {
                setLoading(false);
                return;
            }
            
            // const data = await fetchWrapper(`/order/user/${payload.user_id}`, {
            //     method: "GET",
            //     credentials: "include",
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // }) as { orders?: Order[] };

            const data = await fetchCompletedOrders(payload.user_id, token) as {orders?: Order[]};

            const rawOrders = data.orders ?? [];

            const sorted = [...rawOrders].sort(
            (a: Order, b: Order) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
            );

            const withItems = await Promise.all(
            sorted.map(async (raw: Order, idx: number) => {
                let items: OrderDetail[] = [];
                try {
                const detailData = await fetchWrapper(`/order/${raw.order_id}`, {
                    method: "GET",
                    credentials: "include",
                }) as { order?: { items: OrderDetail[] } };
                items = (detailData.order?.items ?? []).map((item: OrderDetail) => ({
                    nama: item.nama,
                    harga: item.harga,
                    image_url: item.image_url,
                }));
                } catch {  }

                return {
                order_id: raw.order_id,
                tanggal: formatTanggal(raw.tanggal),
                namaPesanan: `Pesanan ${sorted.length - idx}`,
                totalHarga: raw.totalHarga,
                items,
                } as Order;
            })
            );

            setOrders(withItems);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
        };

        loadOrders();
    }, [isLoggedIn, getUserPayload]);


    // show placeholde atau blm login kek kemauan jo
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white p-8 md:p-10 pb-20 pt-20 px-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Riwayat Pesanan</h1>
                <div className="space-y-6">
                    {daftarPesanan.map((pesanan) => (
                        <div key={pesanan.id} className="bg-gray-100 rounded-2xl p-4 shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-normal">{pesanan.namaPesanan} - {pesanan.tanggal}</h2>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-normal">Total</span>
                                    <span className="text-lg font-semibold">{pesanan.totalHarga}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-4">
                                {pesanan.items.map((item, index) => (
                                    <ItemCard key={index} nama={item.nama} harga={item.harga} image_url={item.image_url} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // blm ada pesanan tapi udh login
    if ( orders.length === 0 ) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-8">
                <p className="text-gray-400 text-lg">Belum ada riwayat pesanan.</p>
            </div>
        );
    }

    if ( loading ) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500 text-lg">Memuat riwayat pesanan...</p>
            </div>
        );
    }

    if ( error ) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-2">Terjadi kesalahan</p>
                    <p className="text-gray-500 text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-8 md:p-10 pb-20 pt-20 px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Riwayat Pesanan</h1>
            <div className="space-y-6">
                {orders.map((pesanan) => (
                    <div key={pesanan.order_id} className="bg-gray-100 rounded-2xl p-4 shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-normal">{pesanan.namaPesanan} - {pesanan.tanggal}</h2>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-normal">Total</span>
                                <span className="text-lg font-semibold">{formatRupiah(pesanan.totalHarga)}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-4">
                            {pesanan.items.length === 0 ? (
                                <p className="text-sm text-gray-400">Detail item tidak tersedia.</p>
                            ) : (
                                pesanan.items.map((item, index) => (
                                    <ItemCard key={index} nama={item.nama} harga={formatRupiah(item.harga)} image_url={item.image_url} />
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { fetchCompletedOrders } from "@/lib/order";

function formatTanggal(isoString: string): string {
    if (!isoString) return "-";
    const d = new Date(isoString);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mnt = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mnt}`;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "Belum Dibayar":
            return "bg-red-500";
        case "Di Masak":
            return "bg-yellow-500";
        case "Sudah Siap":
            return "bg-green-500";
        case "Dibatalkan":
            return "bg-gray-500";
        default:
            return "bg-gray-500";
    }
};

const getStatusLabel = (fulfilled: boolean, transaction_status: string) => {
    if (fulfilled) return "Sudah Siap";
    if (transaction_status === 'SUCCESS') return "Di Masak";
    if (transaction_status === 'FAILED') return "Dibatalkan";
    return "Belum Dibayar";
}

interface OrderDetail {
    nama: string;
    quantity: number;
    harga: number;
}

interface Order {
    order_id: string;
    tanggal: string;
    totalHarga: number;
    statusLabel: string;
    items: OrderDetail[];
}

export default function StatusPage() {
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
                const token = localStorage.getItem('token');
                if (!token) return;

                const payload = getUserPayload() as unknown as { user_id: string } | null;
                if (!payload) {
                    setLoading(false);
                    return;
                }

                // Fetch the list of orders for the user
                const data = await fetchCompletedOrders(payload.user_id, token) as { orders?: any[] };
                const rawOrders = data.orders ?? [];

                // Sort descending by date
                const sorted = [...rawOrders].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                // Fetch details for each order to get the items
                const withItems = await Promise.all(
                    sorted.map(async (raw: any) => {
                        let items: OrderDetail[] = [];
                        try {
                            const detailData = await fetchWrapper(`/order/${raw.order_id}`, {
                                method: "GET",
                                credentials: "include",
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }) as { order?: { items: any[] } };
                            
                            items = (detailData.order?.items ?? []).map((item: any) => ({
                                nama: item.name,
                                quantity: item.quantity,
                                harga: item.price,
                            }));
                        } catch { 
                            console.error("Failed to fetch details for order", raw.order_id);
                        }

                        return {
                            order_id: raw.order_id,
                            tanggal: formatTanggal(raw.date),
                            totalHarga: raw.total_price,
                            statusLabel: getStatusLabel(raw.fulfilled, raw.transaction_status),
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

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-8 text-black">
                <p className="text-gray-400 text-lg">Silakan login untuk melihat status pesanan.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center text-black">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-lg">Memuat status pesanan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-8 text-black">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-2">Terjadi kesalahan</p>
                    <p className="text-gray-500 text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-8 md:p-10 pb-20 pt-20 px-4 text-black">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight max-w-3xl mx-auto">
                Status Pesanan
            </h1>

            <div className="space-y-5 max-w-3xl mx-auto">
                {orders.length === 0 ? (
                    <p className="text-gray-400 text-lg text-center mt-10">Belum ada pesanan.</p>
                ) : (
                    orders.map((pesanan) => (
                        <div
                            key={pesanan.order_id}
                            className="bg-gray-100 rounded-2xl p-5 shadow-md flex flex-col gap-4"
                        >
                            {/* Header: ID (Kiri) dan Tanggal (Kanan) */}
                            <div className="flex justify-between items-start border-b border-gray-300 pb-3">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Order #{pesanan.order_id.split('-')[0].toUpperCase()}
                                </h2>
                                <p className="text-sm font-medium text-gray-500 shrink-0 mt-1">
                                    {pesanan.tanggal}
                                </p>
                            </div>

                            {/* Body: Daftar Makanan */}
                            <div className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-200">
                                <p className="font-semibold mb-2 text-black text-base">Rincian Pesanan:</p>
                                {pesanan.items.length > 0 ? (
                                    <div className="space-y-2">
                                        {pesanan.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span className="text-gray-800 text-base">{item.nama}</span>
                                                <span className="font-bold text-black bg-gray-100 px-2 py-0.5 rounded-md">{item.quantity}x</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Sedang memuat atau tidak ada detail item.</p>
                                )}
                            </div>

                            {/* Footer: Status Badge */}
                            <div className="flex justify-center mt-1">
                                <div
                                    className={`${getStatusColor(pesanan.statusLabel)} w-full py-3 rounded-xl text-center shadow-sm`}
                                >
                                    <span className="text-white font-bold text-base tracking-wide">
                                        {pesanan.statusLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
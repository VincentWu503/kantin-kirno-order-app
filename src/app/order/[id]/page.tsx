"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { getOrderByOrderId } from "@/lib/order";
import { ORDER_STATUS_MAP } from "@/utils/types";
import { Button } from "@mui/material";

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
}

interface OrderDetail {
    order_id: string;
    date: string;
    total_price: number;
    order_status: string;
    items: OrderItem[];
    location?: {
        building: string;
        floor: string;
        extra: string;
    };
    notes?: string;
    takeaway?: boolean;
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

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
        case "Sedang Dimasak":
            return "bg-yellow-500";
        case "Siap Diambil/Diantar":
            return "bg-green-500";
        case "Selesai":
            return "bg-blue-500";
        case "Dibatalkan":
            return "bg-gray-500";
        default:
            return "bg-gray-500";
    }
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    function countTotalPrice(items: OrderItem[]): number {
        let total = 0;

        for (const item of items) {
            total += item.price * item.quantity;
        }

        return total;
    }

    useEffect(() => {
        const loadOrder = async () => {
            const token = localStorage.getItem('token')

            if (!token || !params.id) return;
            const orderId = params.id.toString();

            const order = await getOrderByOrderId(orderId, token);
            const details = order.data as any // ribet redefine interface OrderDetail
            // MENGGUNAKAN DATA PLACEHOLDER (MOCK DATA)
            // setTimeout(() => {
            //     setOrder({
            //         order_id: orderId || "ORD-12345",
            //         date: "2026-06-01T15:30:00Z",
            //         total_price: 50000,
            //         fulfilled: false,
            //         transaction_status: "SUCCESS",
            //         items: [
            //             { name: "Nasi Goreng Spesial", quantity: 2, price: 20000, image_url: "" },
            //             { name: "Es Teh Manis", quantity: 2, price: 5000, image_url: "" }
            //         ],
            //         location: {
            //             building: "Gedung A",
            //             floor: "Lantai 3",
            //             extra: "Taruh di meja resepsionis"
            //         },
            //         notes: "Jangan pakai sambal, kecapnya dibanyakin ya mas.",
            //         takeaway: false
            //     });
            //     setLoading(false);
            // }, 800); // Simulasi loading 0.8 detik

            // backend response field
            setOrder({
                order_id: details.order_id,
                date: details.date,
                total_price: countTotalPrice(details.items as OrderItem[]),
                order_status: details.order_status,
                items: details.items,
                location: {
                    building: details.building,
                    floor: details.floor,
                    extra: details.extra
                },
                notes: details.note,
                takeaway: details.is_takeaway
            })
            setLoading(false)
        };

        loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-black">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Memuat detail pesanan...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-black">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">Tidak dapat memuat detail pesanan</p>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const statusLabel = ORDER_STATUS_MAP[order.order_status] ?? order.order_status;

    return (
        <div className="min-h-screen bg-gray-50 pb-44 font-sans text-black">
            {/* Header - Sticky */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="px-4 md:px-6 py-4 flex items-center gap-4 max-w-2xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                            Pesanan #{order.order_id.split("-")[0].toUpperCase()}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 md:px-6 py-6 pt-24 max-w-2xl mx-auto">
                {/* Status Card */}
                <div className={`${getStatusColor(statusLabel)} text-white p-5 rounded-2xl mb-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300`}>
                    <p className="text-lg font-bold uppercase tracking-wider">{statusLabel}</p>
                    <p className="text-sm mt-1 opacity-90 font-medium">{formatTanggal(order.date)}</p>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Rincian Pesanan
                    </h2>
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/60 shadow-sm">
                                    {item.image_url ? (
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-[10px] font-medium">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex justify-between items-center">
                                    <div className="flex flex-col justify-center">
                                        <p className="font-semibold text-gray-800 text-base">{item.name}</p>
                                        <p className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-md inline-block w-max mt-1.5 shadow-sm">{item.quantity}x</p>
                                    </div>
                                    <p className="font-bold text-gray-900 text-base">
                                        {formatRupiah(item.price * item.quantity)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery/Location Info */}
                {!order.takeaway && order.location && (
                    <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Lokasi Pengiriman
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                <span className="text-gray-600">Gedung:</span>
                                <p className="font-medium text-gray-900">{order.location.building}</p>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                <span className="text-gray-600">Lantai:</span>
                                <p className="font-medium text-gray-900">{order.location.floor}</p>
                            </div>
                            {order.location.extra && (
                                <div className="flex flex-col gap-1 pt-1">
                                    <span className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Catatan Lokasi:</span>
                                    <p className="font-medium text-gray-900">{order.location.extra}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Additional Notes */}
                {order.notes && (
                    <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Catatan Pesanan
                        </h2>
                        <p className="text-gray-700 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-sm leading-relaxed">{order.notes}</p>
                    </div>
                )}

                {/* Takeaway Info */}
                {order.takeaway && (
                    <div className="bg-blue-50/80 rounded-2xl p-5 mb-6 border border-blue-100 shadow-sm flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p className="text-blue-800 font-semibold text-lg tracking-wide">Ambil Sendiri</p>
                    </div>
                )}
            </div>

            {/* Floating Bottom Action Bar */}
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="max-w-2xl mx-auto p-4 md:px-6">
                    {/* Total Summary */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pembayaran</span>
                            <span className="font-bold text-blue-600 text-2xl tracking-tight">
                                {formatRupiah(order.total_price)}
                            </span>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {/* w komen ini dulu, tombol kembail sudah ada panah ,- di pojok kiri atas */}
                            {/* <button
                                onClick={() => router.back()}
                                className="w-1/3 flex items-center justify-center bg-gray-50 text-gray-800 py-3.5 rounded-xl font-bold border border-gray-200 hover:bg-gray-100 active:scale-[0.98] transition-all"
                            >
                                Kembali
                            </button> */}
                            {order.order_status === "COMPLETED" ? (
                                // <button
                                //     onClick={() => router.push("/")}
                                //     className="w-2/3 bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all"
                                // >
                                //     Pesan Lagi
                                // </button>
                                // value sesuaikan tailwind css
                                <Button variant="contained" 
                                        sx={{'background-color': "var(--color-blue-600)"}}
                                        onClick={() => router.push('/')}
                                >
                                    Pesan Lagi
                                </Button>
                            ) : (
                                // <button
                                //     disabled
                                //     className="w-2/3 bg-gray-200 text-gray-400 py-3.5 rounded-xl font-bold cursor-not-allowed"
                                // >
                                //     {order.order_status !== "CANCELLED" ? ("Sedang Diproses") : ("Pesanan Anda Dibatalkan.")}
                                // </button>
                                <Button variant="contained" disabled>
                                    {order.order_status !== "CANCELLED" ? ("Sedang Diproses") : ("Pesanan Dibatalkan")}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface OrderItem {
    nama: string;
    quantity: number;
    harga: number;
}

interface Order {
    order_id: string;
    tanggal: string;
    totalHarga: number;
    statusLabel: string;
    isCompleted: boolean;
    items: OrderItem[];
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "Belum Dibayar":
            return "bg-red-500";
        case "Di Masak":
            return "bg-yellow-500";
        case "Sudah Siap":
            return "bg-green-500";
        case "Selesai":
            return "bg-blue-500";
        case "Dibatalkan":
            return "bg-gray-500";
        default:
            return "bg-gray-500";
    }
};

export default function StatusPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push("/auth/login");
        }
    }, [isLoggedIn, authLoading, router]);

    useEffect(() => {
        if (!isLoggedIn) return; // Wait until authenticated

        const loadOrders = async () => {
            // MENGGUNAKAN DATA PLACEHOLDER (MOCK DATA)
            setTimeout(() => {
                const mockOrders = [
                    {
                        order_id: "ORD-12345",
                        tanggal: "01/06/2026 15:30",
                        totalHarga: 50000,
                        statusLabel: "Sudah Siap",
                        isCompleted: false,
                        items: [
                            { nama: "Nasi Goreng Spesial", quantity: 2, harga: 20000 },
                            { nama: "Es Teh Manis", quantity: 2, harga: 5000 }
                        ]
                    },
                    {
                        order_id: "ORD-67890",
                        tanggal: "01/06/2026 12:15",
                        totalHarga: 15000,
                        statusLabel: "Di Masak",
                        isCompleted: false,
                        items: [
                            { nama: "Mie Ayam Bakso", quantity: 1, harga: 15000 }
                        ]
                    },
                    {
                        order_id: "ORD-99999",
                        tanggal: "30/05/2026 10:00",
                        totalHarga: 35000,
                        statusLabel: "Selesai",
                        isCompleted: true,
                        items: [
                            { nama: "Ayam Geprek", quantity: 2, harga: 15000 },
                            { nama: "Es Jeruk", quantity: 1, harga: 5000 }
                        ]
                    }
                ];
                setOrders(mockOrders as any);
                setLoading(false);
            }, 800); // Simulasi loading 0.8 detik
        };

        loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-black">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-lg">Memuat status pesanan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 text-black">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-2">Terjadi kesalahan</p>
                    <p className="text-gray-500 text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    const ongoingOrders = orders.filter((o) => !o.isCompleted);
    const historyOrders = orders.filter((o) => o.isCompleted);
    const displayOrders = activeTab === "ongoing" ? ongoingOrders : historyOrders;

    return (
        <div className="min-h-screen bg-gray-50 text-black font-sans pb-24">
            {/* Fixed Top Navigation */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-100">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 max-w-2xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                        Riwayat Pesanan
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex max-w-2xl mx-auto border-t border-gray-50">
                    <button
                        onClick={() => setActiveTab("ongoing")}
                        className={`flex-1 py-3.5 text-sm font-bold text-center border-b-2 transition-colors ${
                            activeTab === "ongoing"
                                ? "border-blue-600 text-blue-600 bg-blue-50/30"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Sedang Jalan
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex-1 py-3.5 text-sm font-bold text-center border-b-2 transition-colors ${
                            activeTab === "history"
                                ? "border-blue-600 text-blue-600 bg-blue-50/30"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Selesai / Riwayat
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="pt-36 px-4 max-w-2xl mx-auto space-y-4">
                {displayOrders.length === 0 ? (
                    activeTab === "ongoing" ? (
                        <div className="mt-16 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <p className="text-gray-900 font-bold text-lg mb-2">Belum ada pesanan.</p>
                            <p className="text-gray-500 text-sm mb-6">Kamu belum memiliki pesanan yang sedang berjalan.</p>
                            <button
                                onClick={() => router.push("/")}
                                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all tracking-wide"
                            >
                                PESAN SEKARANG
                            </button>
                        </div>
                    ) : (
                        <div className="mt-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <p className="text-gray-500 font-medium">Belum ada riwayat pesanan.</p>
                        </div>
                    )
                ) : (
                    displayOrders.map((pesanan) => {
                        const totalMenu = pesanan.items.reduce((acc, curr) => acc + curr.quantity, 0);
                        
                        return (
                        <div
                            key={pesanan.order_id}
                            onClick={() => router.push(`/order/${pesanan.order_id}`)}
                            className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col gap-4 cursor-pointer active:scale-[0.99]"
                        >
                            {/* Header: ID (Kiri) dan Tanggal (Kanan) */}
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="font-bold text-gray-900 text-lg">
                                    #{pesanan.order_id.split("-")[0].toUpperCase()}
                                </span>
                                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                    {pesanan.tanggal}
                                </span>
                            </div>

                            {/* Body: Rincian Menu & Action */}
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Total {totalMenu} Menu - {formatRupiah(pesanan.totalHarga)}
                                    </p>
                                    {activeTab === "history" && (
                                        <p className="text-xs font-bold text-gray-500 mt-0.5">
                                            Status: <span className="text-gray-800">{pesanan.statusLabel}</span>
                                        </p>
                                    )}
                                </div>
                                
                                {activeTab === "ongoing" ? (
                                    <div className={`px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold text-white ${getStatusColor(pesanan.statusLabel)}`}>
                                        {pesanan.statusLabel}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); router.push("/"); /* Logika Cart Here */ }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors active:scale-[0.96]"
                                    >
                                        Pesan Lagi
                                    </button>
                                )}
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
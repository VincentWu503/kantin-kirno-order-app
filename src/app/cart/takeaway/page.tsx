import React from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

const takeawayPage = () => {
    const takeAwayItems = [
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

    return (
        <div className="min-h-screen bg-white p-6 pb-20 font-serif text-black">
            {/* Tombol back */}
            <div className="mb-4">
                <Link href="/cart" className="inline-block">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>
            </div>

        {/* isi halaman */}
        <h1 className="text-5xl md:text-4xl font-bold mb-8 tracking-tight">Take Away</h1>

        <div className="space-y-4 mb-10">
            {takeAwayItems.map((item) => (
                <div key={item.id} className="bg-gray-200 rounded-lg p-4 shadow-md justify-between flex items-center">  
                    <span className="text-2xl font-medium">{item.nama}</span>
                    <div className="flex items-center gap-3">
                        <button className="focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="text-lg font-medium">{item.jumlah}</span>
                        <button className="focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="space-y-2 mb-10 text-3xl">
            <div className="flex items-center">
                <span className="flex-1">harga item1</span>
                <span className="font-mono w-12 text-left">Rp.</span>
                <span className="font-mono w-32 text-right">20.000</span>
            </div>
            <div className="flex items-center">
                <span className="flex-1">harga item2</span>
                <span className="font-mono w-12 text-left">Rp.</span>
                <span className="font-mono w-32 text-right">10.000</span>
            </div>
            <div className="flex items-center">
                <span className="flex-1">harga item3</span>
                <span className="font-mono w-12 text-left">Rp.</span>
                <span className="font-mono w-32 text-right">5.000</span>
            </div>
        </div>

        <div className="flex items-center font-bold text-3xl mb-10 py-2">
            <span className="flex-1">Total</span>
            <span className="font-mono w-12 text-left">Rp.</span>
            <span className="font-mono w-32 text-right">35.000</span>
        </div>

        {/* tombol checkout */}
        <div className="flex justify-center">
            <Link href="/cart/takeaway" className="w-1/4">
                <button className={`${montserrat.className} w-full bg-red-500 text-white py-7 rounded-2xl text-5xl font-bold hover:bg-blue-700 transition`}>
                    Check Out
                </button>
            </Link>
        </div>
    </div>);
}

export default takeawayPage;
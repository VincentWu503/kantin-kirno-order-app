import React from "react";

const daftarPesanan = [
  {
    id: 2,
    namaPesanan: "pesanan 2",
    tanggal: "13/10/2024",
    totalHarga : "Rp. 39.000", // dipake pricelist gofood
    items: [
      { nama: "Soto Tangkar", jumlah: 1, harga: "Rp. 27.000" },
      { nama: "Nasi Putih", jumlah: 1, harga: "Rp. 12.000" },
    ],
  },

  {
    id: 1,
    namaPesanan: "pesanan 1",
    tanggal: "02/08/2024",
    totalHarga : "Rp. 21.000", // dipake pricelist gofood
    items: [
      { nama: "Sate Kulit", jumlah: 2, harga: "Rp. 16.000" },
      { nama: "Tahu Goreng", jumlah: 1, harga: "Rp. 5.000" },
    ],
  }
];

const HistoryPage: React.FC = () => {
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
                                <div key={index} className="flex items-center gap-4 text-cemnter">
                                    <div className="w-20 h-20 bg-red-500 rounded-lg flex-col items-center justify-center p-2 mb-2">
                                        <p className="text-white font-small leading-tight justify-center text-center pt-3">gambar makanan</p>
                                    </div>
                                
                                    <p className="text-base font-normal leading-tight">{item.nama}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HistoryPage;
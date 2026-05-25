import React from "react";

const statusPesanan = [
  {
    id: 1,
    namaMakanan: "Makanan_1",
    status: "Belum Siap",
  },
  {
    id: 2,
    namaMakanan: "Makanan_2",
    status: "Di Masak",
  },
  {
    id: 3,
    namaMakanan: "Makanan_3",
    status: "Sudah Siap",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Belum Siap":
      return "bg-red-500";
    case "Di Masak":
      return "bg-yellow-500";
    case "Sudah Siap":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const StatusPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-8 md:p-10 pb-20 pt-20 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
        Status Pesanan
      </h1>

      <div className="space-y-4">
        {statusPesanan.map((pesanan) => (
          <div
            key={pesanan.id}
            className="bg-gray-100 rounded-2xl p-5 shadow-md flex items-center justify-between"
          >
            {/* Nama Makanan */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {pesanan.namaMakanan}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                ID Pesanan: #{pesanan.id}
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={`${getStatusColor(
                pesanan.status
              )} px-4 py-2 rounded-full`}
            >
              <span className="text-white font-medium text-sm">
                {pesanan.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusPage;
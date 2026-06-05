export type MenuData = {
    menu_id: string,
    name: string,
    image_url: string,
    price: number,
    is_available: boolean,
    quantity?: number // Only exists from cart requests
}

export type MenuResponseData = {
    data: MenuData[],
    offset: number,
    limit: number,
    count: number,
}

export type CartResponseData = {
    items: MenuData[],
    offset: number,
    limit: number
};

export type UserData = {
    user_id: string,
    username: string,
    email: string,
    profile_image_url: string,
    phone_no: string,
    verified: true
}

// sesuaikan sama backend
export type ApiErrorData = {
    status: number, // sama aja sih
    statusCode: number, // from be
    error: string,
    description: string,
    message: string,
    endpoint: string
}

// access token
export type TokenData = {
    token: string
}

// kamus penyesuaian enum backend order status
export const ORDER_STATUS_MAP: Record<string, string> = {
    "PENDING": "Belum Dibayar",
    "PROCESSING": "Sedang Dimasak",
    "READY": "Siap Diambil/Diantar",
    "COMPLETED": "Selesai",
    "CANCELLED": "Dibatalkan",
};
export type MenuData = {
    menu_id: string,
    name: string,
    image_url: string,
    price: number,
    is_available: boolean
}

export type MenuResponseData = {
    data: MenuData[],
    offset: number,
    limit: number,
    count: number,
}

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
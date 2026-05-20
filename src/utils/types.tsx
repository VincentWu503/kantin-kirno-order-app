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
    limit: number
}
import { ENV } from "@/config/env";
import { checkInteger, exists } from "./checkUtils";
import { MenuData } from "./types";
import { fetchWrapper } from "./fetchWrapper";

export function apiRoute(route: string): string {
    return ENV.API_URL + route;
}

export async function fetchMenu(offset: number, limit: number, search?: string): Promise<unknown> {
    checkInteger(offset, 0);
    checkInteger(limit, 0);

    let query: string = `?offset=${offset}&limit=${limit}`;
    if (exists(search)) query += `&search=${search}`;
    const res = await fetch(apiRoute(`/menu${query}`)).then(res => res.json()).then(body => body).catch((e) => e);

    return res;
}

export async function addToCart(menu: MenuData, quantity: number, accessToken: string): Promise<boolean> {
    if (menu == null) return false;
    if (accessToken == null) return false;
    try {
        await fetchWrapper("/order/cart", {
            body: JSON.stringify({
                menu_id: menu.menu_id,
                quantity: quantity
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },
            method: "POST",
            credentials: "include"
        })
        return true;
    } catch (err) {
        console.error("Allowed Error:", err); // Allowed baby
        try {
            await fetchWrapper("/order/cart/" + menu.menu_id, {
                body: JSON.stringify({
                    menu_id: menu.menu_id,
                    quantity: quantity
                }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + accessToken
                },
                method: "PATCH",
                credentials: "include"
            });
            return true;
        } catch (e) {
            console.error("Detailed Error:", err);
            return false;
        }
    }
}
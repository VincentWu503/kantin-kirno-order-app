import { MenuData } from "@/utils/types";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { ResponseObject } from "@/utils/interfaces";

export async function addToCart(menu: MenuData, quantity: number, accessToken: string): Promise<ResponseObject> {
    try {
        const result = await fetchWrapper("/order/cart", {
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
        return result;
    } catch (err) {
        throw err;
    }
}

export async function updateCartItem(menu: MenuData, newQuantity: number, accessToken: string){
    try {
        const result = await fetchWrapper("/order/cart/" + menu.menu_id, {
            body: JSON.stringify({
                menu_id: menu.menu_id,
                quantity: newQuantity
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            },
            method: "PATCH",
            credentials: "include"
        });
        return result;
    } catch (e) {
        console.error("Detailed Error:", e);
        throw e;
    }
}

export async function deleteCartItem(menu: MenuData, accessToken: string) {
    if (menu == null) return false;
    if (accessToken == null) return false;

    try {
        const result = await fetchWrapper('/order/cart/' + menu.menu_id, {
            headers: {
                "Authorization": "Bearer " + accessToken,
            },
            method: "DELETE",
            credentials: "include",
        })
        return result;
    } catch (e) {
        console.error("Detailed Error:", e);
        throw e;
    }
}

export async function fetchCartItems(accessToken: string): Promise<ResponseObject> { //Unknown, i hate typing in TS (same bruh)
    try {
        const data = await fetchWrapper('/order/cart', {
            headers: { "Authorization": "Bearer " + accessToken }
        });

        return data;
    } catch (err) {
        console.error("Detailed Error:", err);
        throw err;
    }
}

export async function fetchCartPrice(accessToken: string, location: { building: string, floor: string, extra: string } | null): Promise<unknown | null> {
    if (accessToken == null) return null;
    let query = '?';
    if (location !== null) query += "building=" + location.building; //Price fee depends on the building
    try {
        const data = await fetchWrapper('/order/cart/price' + query, {
            headers: { "Authorization": "Bearer " + accessToken },
        });

        return data;
    } catch (err) {
        console.error("Detailed Error:", err);
        throw err;
    }
}
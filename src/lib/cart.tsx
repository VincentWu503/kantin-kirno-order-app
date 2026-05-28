import { MenuData } from "@/utils/types";
import { fetchWrapper } from "@/utils/fetchWrapper";

export async function fetchCartItems(accessToken: string): Promise<unknown | null> { //Unknown, i hate typing in TS (same bruh)
    if (accessToken == null) return null;

    try {
        const data = await fetchWrapper('/order/cart', {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (data.data) {
            return data.data;
        } else {
            throw new Error("Data tidak dapat diambil");
        }
    } catch (err) {
        console.error("Detailed Error:", err);
        return false;
    }
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
        return updateCartItem(menu, quantity, accessToken);
    }
}

export async function updateCartItem(menu: MenuData, newQuantity: number, accessToken: string): Promise<boolean> {
    if (menu == null) return false;
    if (accessToken == null) return false;
    try {
        await fetchWrapper("/order/cart/" + menu.menu_id, {
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
        return true;
    } catch (e) {
        console.error("Detailed Error:", e);
        return false;
    }
}

export async function deleteCartItem(menu: MenuData, accessToken: string) {
    if (menu == null) return false;
    if (accessToken == null) return false;

    try {
        await fetchWrapper('/order/cart/' + menu.menu_id, {
            headers: {
                "Authorization": "Bearer " + accessToken,
            },
            method: "DELETE",
            credentials: "include",
        })
        return true;
    } catch (e) {
        console.error("Detailed Error:", e);
        return false;
    }
}

export async function fetchAllMenus(accessToken: string): Promise<unknown | null> { //Unknown, i hate typing in TS
    if (accessToken == null) return null;

    try {
        const data = await fetchWrapper('/order/cart', {
            headers: { "Authorization": "Bearer " + accessToken }
        });

        if (data.data) {
            return data.data;
        } else {
            throw new Error("Data tidak dapat diambil");
        }
    } catch (err) {
        console.error("Detailed Error:", err);
        return false;
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

        if (data.data) {
            return data.data;
        } else {
            throw new Error("Data tidak dapat diambil");
        }
    } catch (err) {
        console.error("Detailed Error:", err);
        return false;
    }
}
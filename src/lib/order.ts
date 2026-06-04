import { fetchWrapper } from "@/utils/fetchWrapper";

export async function fetchUserOrders(userId: string, accessToken: string, isCompleted: boolean) {
    try {
        const queryparam = isCompleted ? `?completed=true` : '';
        const data = await fetchWrapper(`/order/user/${userId}${queryparam}`, {
            method: "GET",
            credentials: "include",
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return data;
    } catch (err) {
        console.error('Detailed')
    }
} 

export async function fetchCreateOrder(building: string, floor: string, extra: string, note: string, name: string, phoneNo: string, accessToken: string) {
    try {
        const data = await fetchWrapper(`/order/create`, {
            body: JSON.stringify({
                building: building.length > 0 ? building : null,
                floor: floor.length > 0 ? floor : null,
                extra: extra.length > 0 ? extra : null,
                note: note.length > 0 ? note : null,
                name: name,
                phone_number: phoneNo
            }),
            method: "POST",
            credentials: "include",
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return data;
    } catch (err) {
        throw err;
    }
}
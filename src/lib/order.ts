import { fetchWrapper } from "@/utils/fetchWrapper";

export async function fetchCompletedOrders(userId: string, accessToken: string) {
    try {
        const data = await fetchWrapper(`/order/user/${userId}`, {
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
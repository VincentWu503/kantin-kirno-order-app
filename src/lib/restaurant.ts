import { fetchWrapper } from "@/utils/fetchWrapper";

export async function fetchRestaurantStatus(): Promise<{ status: boolean }> {
    try {
        const data = await fetchWrapper("/restaurant/status");
        if (data.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return { status: (data.data as unknown as any).status === "closed" ? false : true };
        }
    } catch (e) {
        return { status: false };
    }
    return { status: false };

}

export async function fetchRestaurantData(): Promise<any> {
    try {
        const data = await fetchWrapper("/restaurant");
        return data;
    } catch (e) {
        return null;
    }
}
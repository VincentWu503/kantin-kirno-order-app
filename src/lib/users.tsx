import {ENV} from "@/config/env";

export async function refreshAccessToken(accessToken: string) {
    try {
        console.log('API refresh dipanggil!');
        if (typeof window !== undefined) {
            const response = await fetch(`${ENV.API_URL}/api/auth/user/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authentication': `Bearer ${accessToken}`
                }
            })

            let data;
            if (response) data = await response.json();

            return data.token;
        } else {
            // window undefined == api call tidak dilakukan di browser
            throw new Error("Gagal melakukan request ke API!")
        }
    } catch (err) {
        throw err;
    }
}
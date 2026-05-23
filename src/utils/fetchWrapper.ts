// TO DO: bikin fetch wrapper
// karena backend ngirim response json untuk status code error 
// (selain 2xx)
// buat fetch wrapper throw error untuk !response.ok (status code 400 - 599)
// jadinya tiap pemanggilan fungsi api di lib akan diwrap dg try catch block
// import { apiRoute } from "./fetchUtils";
// import { ResponseObject } from "./interfaces";
// // basic implementation
import { apiRoute } from "./fetchUtils";
import { ResponseObject } from "./interfaces";
import { refreshAccessToken } from "@/lib/users";
import { ApiErrorData, TokenData } from "./types";

let refreshPromise: Promise<string | null> | null = null;

export async function fetchWrapper(endpoint: string, options: RequestInit = {}): Promise<ResponseObject> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const fetchOptions: RequestInit = { ...options, headers };

    try {
        if (typeof window === 'undefined') {
            throw new Error("API tidak dipanggil browser side!");
        }

        let response = await fetch(apiRoute(endpoint), fetchOptions);

        // kasus unauthorized di endpoint selain refresh (token expired di passport middleware)
        if (response.status === 401 && !endpoint.includes('/refresh')) {
            try {
                if (!refreshPromise) {
                    console.log('Refresh token sedang dipanggil...')
                    refreshPromise = (async () => {
                        const currentToken = localStorage.getItem('token') || "";
                        const res = await refreshAccessToken(currentToken);

                        const data = res.data as TokenData;
                        const newToken = data.token 
                        
                        localStorage.setItem('token', newToken);
                        return newToken;
                    })();
                }

                const newToken = await refreshPromise;

                if (newToken) {
                    fetchOptions.headers = {
                        // destructure headers props agar menggunakan access token baru
                        ...fetchOptions.headers,
                        'Authorization': `Bearer ${newToken}`
                    };

                    response = await fetch(apiRoute(endpoint), fetchOptions);
                }
            } catch (err: any) {
                localStorage.removeItem('token');

                const errorData = JSON.parse(err.message) as ApiErrorData;

                if (errorData.statusCode === 401) {
                    throw new Error(JSON.stringify({
                        statusCode: 401,
                        message: "Sesi Anda telah berakhir! Harap login ulang."
                    }));
                } else if (errorData.statusCode === 403) {
                    throw new Error(JSON.stringify({
                        statusCode: 403,
                        // ambil pesan dari be
                        message: errorData.message
                    }));
                }
            } finally {
                refreshPromise = null;
            }
        }

        // kondisi normal
        const isJson = response.headers.get('content-type')?.includes('application/json');

        if (response.status === 204) {
            return {
                status: response.status,
                data: { message: "API returned empty response" }
            }
        }

        const data = isJson ? await response.json() : null;

        if (!response.ok) {
            throw new Error(JSON.stringify({
                status: response.status,
                ...data,
                endpoint: endpoint,
            }))
        }

        return {
            status: response.status,
            data: data
        }

    } catch (err: any) {
        console.error("Fetch Error:", err.message);
        throw err;
    }
}


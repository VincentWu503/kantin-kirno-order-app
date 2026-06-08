/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { handleLogoutApi, refreshAccessToken } from "@/lib/users";
import { ApiErrorData, TokenData } from "./types";

let refreshPromise: Promise<string | null> | null = null;

/**
 * Custom implementation of fetch API to throw response status 400 - 599 as an error;
 * and for refresh token flow handling.
 *
 * @param {string} endpoint - The API endpoint to be called, starts after /api prefix.
 * Passed endpoint string must not include full API URL, just provide relative path starting after /api
 * @param {object} options - Fetch API options.
 * @returns {Promise<ResponseObject>} Response object containing status field and API response data.
 * @throws {Error} Throws an error if refresh token failed, or request failed.
 */
export async function fetchWrapper(endpoint: string, options: RequestInit = {}): Promise<ResponseObject> {
    let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (refreshPromise) {
        try {
            const waitedToken = await refreshPromise;
            if (waitedToken) token = waitedToken;
        } catch (error) {
            throw new Error(JSON.stringify({
                statusCode: 401,
                message: "Sesi Anda telah berakhir! Harap login ulang."
            }));
        }
    }

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
        let clone = response.clone();

        let responseData: any = null;
        const cloneContentType = clone.headers.get('content-type')?.includes('application/json');
        if (cloneContentType) {
            try {
                responseData = await clone.json();
            } catch (_err) {
                responseData = null;
            }
        }

        // kasus unauthorized di endpoint selain refresh (token expired di passport middleware)
        if (response.status === 401 && responseData?.error === "UNAUTHORIZED_ERROR" && !endpoint.includes('/refresh')) {
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
                try {
                    const oldToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                    const currToken = oldToken || token;
                    if (currToken) {
                        await handleLogoutApi(currToken);
                    }
                } catch (err: any) {
                    console.error(err.message);
                }

                localStorage.removeItem('token');

                let errorData;
                try {
                    errorData = JSON.parse(err.message) as ApiErrorData;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (err) {
                    // kasus JSON parse error, karena nyoba parse fetch api error
                    errorData = {
                        status: 500, // sama aja sih
                        statusCode: 500, // from be
                        code: "FETCH_ERROR",
                        description: "Terjadi kesalahan pada saat memanggil API!",
                        endpoint: endpoint
                    }

                    throw new Error(JSON.stringify(errorData));
                }

                // add code field
                if (errorData.statusCode === 401 && errorData.error === "UNAUTHORIZED_ERROR") {
                    throw new Error(JSON.stringify({
                        statusCode: 401,
                        message: "Sesi Anda telah berakhir! Harap login ulang.",
                        code: "SESSION_EXPIRED_ERROR"
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

        let data: any = null;
        if (isJson) {
            try {
                data = await response.json();
            } catch (_err) {
                data = null;
            }
        }

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


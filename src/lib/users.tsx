import { ENV } from "@/config/env";
import { fetchWrapper } from "@/utils/fetchWrapper";

// export async function refreshAccessToken(accessToken: string) {
//     try {
//         console.log('API refresh dipanggil!');
//         if (typeof window !== undefined) {
//             const response = await fetch(apiRoute(`/auth/user/refresh`), {
//                 method: 'POST',
//                 credentials: 'include',
//                 headers: {
//                     'Authentication': `Bearer ${accessToken}`
//                 }
//             })

//             let data;
//             if (response) data = await response.json();

//             return data;
//         } else {
//             // window undefined == api call tidak dilakukan di browser
//             throw new Error("Gagal melakukan request ke API!")
//         }
//     } catch (err) {
//         throw err;
//     }
// }

// const fetchUser = async (accessToken: string) => {
//   try {
//     const response = await fetch(apiRoute(`/auth/user/profile`), {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${accessToken}`
//       },
//     });

//     // Cek apakah respons berupa JSON sebelum di-parse
//     const contentType = response.headers.get("content-type");
//     if (!contentType || !contentType.includes("application/json")) {
//       throw new Error("Server tidak mengirimkan JSON. Periksa apakah backend menyala.");
//     }

//     const data = await response.json();

//     if (response.ok) {
//       return data;
//     } else {
//       return;
//     }
//   } catch (err) {
//     console.error("Detail Error:", err);
//     throw err;
//   }
// }

export async function refreshAccessToken(accessToken: string) {
    try {
        const result = await fetchWrapper(`/auth/user/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authentication': `Bearer ${accessToken}`
            }
        });

        return result
    } catch (err) {
        throw err;
    }
}

export async function fetchUser(accessToken: string) {
    try {
        const result = await fetchWrapper('/auth/user/profile', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
        });

        return result;
  } catch (err) {
    throw err;
  }
}

export async function authMe(accessToken: string) {
    try {
        const result = await fetchWrapper(`/auth/user/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        return result;
    } catch (err) {
        throw err;
    }
}

//   const isUserAuthorized = async () => {
//     try {
//       const token = localStorage.getItem('token')
//       const response = await fetch("http://localhost:5000/api/auth/user/me", {
//         method: "GET",
//         headers: { 
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//       });

//       const contentType = response.headers.get("content-type");
//       if (!contentType || !contentType.includes("application/json")) {
//         throw new Error("Server tidak mengirimkan JSON. Periksa apakah backend menyala.");
//       }

//       if (response.status === 401) {
//         console.log("Hei! access token kamu expired!");
//         const token = localStorage.getItem("token") || "";
//         await refreshAccessToken(token); // lanjutkan flow
//       } else if (response.status === 200) {
//         if (!isLoggedIn) setIsLoggedIn(true);
//       }
//     } catch (err) {
//       console.error("Detail Error:", err);
//       setError(() => {
//         throw err;
//       })
//     }
//   }
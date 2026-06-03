import { checkInteger, exists } from "@/utils/checkUtils";
import { apiRoute } from "@/utils/fetchUtils";

export async function fetchMenu(offset: number, limit: number, search?: string) {
    checkInteger(offset, 0);
    checkInteger(limit, 0);

    let query: string = `?offset=${offset}&limit=${limit}`;
    if (exists(search)) query += `&search=${search}`;
    const res = await fetch(apiRoute(`/menu${query}`)).then(res => res.json()).then(body => body).catch((e) => e);

    return res;
}
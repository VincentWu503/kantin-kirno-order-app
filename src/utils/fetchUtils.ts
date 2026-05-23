import { ENV } from "@/config/env";
import { checkInteger, exists } from "./checkUtils";

export function apiRoute(route: string): string {
    return ENV.API_URL + route;
}

export async function fetchMenu(offset: number, limit: number, search?: string): Promise<unknown> {
    checkInteger(offset, 0);
    checkInteger(limit, 0);

    let query: string = `?offset=${offset}&limit=${limit}`;
    if (exists(search)) query += `&search=${search}`;
    const res = await fetch(apiRoute(`/menu${query}`)).then(res => res.json()).then(body => body).catch((e) => e);

    return res;
}
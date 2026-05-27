import { ENV } from "@/config/env";
import { checkInteger, exists } from "@/utils/checkUtils";
import { MenuData, MenuResponseData } from "@/utils/types";
import { fetchWrapper } from "@/utils/fetchWrapper";
import { apiRoute } from "@/utils/fetchUtils";

export async function fetchMenu(offset: number, limit: number, search?: string): Promise<unknown> {
    checkInteger(offset, 0);
    checkInteger(limit, 0);

    let query: string = `?offset=${offset}&limit=${limit}`;
    if (exists(search)) query += `&search=${search}`;
    const res = await fetch(apiRoute(`/menu${query}`)).then(res => res.json()).then(body => body).catch((e) => e);

    return res;
}
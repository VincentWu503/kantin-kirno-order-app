import { ENV } from "@/config/env";

export function apiRoute(route: string): string {
    return ENV.API_URL + route;
}
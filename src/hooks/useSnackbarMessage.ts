"use client"
import { useSyncExternalStore } from "react";
import { SESSION_STORAGE_EVENT } from "@/utils/constants"

export function useSnackbarMessage(sessionKey: string) {
    function subscribe(callback: () => void) {
        if (typeof window === "undefined") {
            return () => {};
        }

        window.addEventListener("storage", callback);
        window.addEventListener(SESSION_STORAGE_EVENT, callback);

        return () => {
            window.removeEventListener("storage", callback);
            window.removeEventListener(SESSION_STORAGE_EVENT, callback);
        };
    }

    function getSnapshot() {
        if (typeof window === "undefined") return null;
        return sessionStorage.getItem(sessionKey);
    }

    function getServerSnapshot() {
        return null;
    }

    function getMessage() {
        return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    }

    return { getMessage };
}


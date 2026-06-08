"use client"
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
    window.addEventListener("storage", callback); 
    window.addEventListener("on-session-change", callback);
    
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("on-session-change", callback);
    };
}

function getSnapshot() {
    return sessionStorage.getItem("error");
}

function getServerSnapshot() {
    return null; 
}

export function useCrossErrorMessage() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
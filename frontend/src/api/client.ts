export const API_URL = import.meta.env.VITE_API_URL || "";

export function apiFetch(path: string, options: RequestInit = {}) {
    return fetch(`${API_URL}${path}`, {
        credentials: "include",
        ...options
    });
}

export function assertApiUrl(path: string | null | undefined) {
    if (!path) return "";

    return path.startsWith("http") ? path : `${API_URL}${path}`;
}

export function absoluteUrl(path: string) {
    return new URL(`${API_URL}${path}`, window.location.origin).href;
}


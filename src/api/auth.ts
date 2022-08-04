import { AuthenticationRequest } from "../types/auth";

export function login(request: AuthenticationRequest) {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        mode: "same-origin",
        body: JSON.stringify(request)
    }).then(response => response.status == 200 ? true : response.status == 401 ? false : null)
}

export function isLoggedIn() {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/auth`, { mode: "same-origin" }).then(response => response.ok)
}

export function logout() {
    return fetch(`${import.meta.env.VITE_API_BASE_PATH}/auth/logout`, {
        method: "POST",
        mode: "same-origin"
    })
}
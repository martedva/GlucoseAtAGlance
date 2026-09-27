/// <reference types="chrome" />

import LibreViewResponse from "../../types/libreViewResponse";
import LoginResponse from "../../types/loginResponse";
import fetchJson from "../fetchJson";
import { getGraphRoute, getTokenRoute } from "./libre-routes";

const libreApiHeaders: Record<string, string> = {
    "product": "llu.android",
    "version": "4.16.0",
}

/**
 * Fetch glucose graph data for a patient (requires authentication)
 */
export async function getLibreGraph(patientId: string): Promise<LibreViewResponse> {
    const route = getGraphRoute(patientId);
    const response = await fetchJson<LibreViewResponse>(route, {
        customHeaders: libreApiHeaders,
        method: 'GET',
    });

    return response;
}

/**
 * Authenticate with LibreLinkUp API (no auth required for login)
 */
export async function getLibreToken(email: string, password: string): Promise<LoginResponse> {
    const route = getTokenRoute;
    
    // Login doesn't require auth headers, so we use fetch directly
    const response = await fetch(route, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            ...libreApiHeaders,
        },
        body: JSON.stringify({
            email,
            password
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Login failed: ${response.status}`);
    }

    return await response.json();
}
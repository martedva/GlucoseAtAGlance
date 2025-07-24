import LibreViewResponse from "../../types/libreViewResponse";
import LoginResponse from "../../types/loginResponse";
import fetchJson from "../fetchJson";
import { getGraphRoute, getTokenRoute } from "./libre-routes";

const libreApiHeaders: Record<string, string> = {
    "product": "llu.android",
    "version": "4.12.0",
    "Account-Id": "2018c7d281c7fde1daac4c2cefc77479230120d2cc9bf9e2eff99b0d3451ada0" // SHA256 encoding of ID from User endpoint
}

export async function getLibreGraph(patientId: string) {
    const route = getGraphRoute(patientId);
    const response: Promise<LibreViewResponse> = await fetchJson(route, {
        customHeaders: libreApiHeaders,
        method: 'GET',
    });

    return response;
}

export async function getLibreToken(email: string, password: string) {
    const route = getTokenRoute;
    const response: Promise<LoginResponse> = await fetchJson(route, {
        customHeaders: libreApiHeaders,
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        }),
    });

    return response;
}
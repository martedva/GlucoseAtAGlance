import { encodeSha256 } from "../utils/encoding-utils";

interface IFetchError {
    errorCode: number;
    errorMessage: string;
    error?: any;
}

interface IFetchRequestInit extends RequestInit {
    customHeaders?: Record<string, string>;
}

/**
 * Fetcher for authenticated API calls
 * Automatically adds Authorization and Account-Id headers from chrome.storage
 */
const fetcher = async <TResponse = any>(url: RequestInfo, requestInfo?: IFetchRequestInit): Promise<TResponse | any> => {
    return new Promise<TResponse | any>(async (resolve, reject) => {
        // Get auth tokens from storage
        const result = await chrome.storage.local.get(['auth_token', 'patient_id']);
        const accessToken = result.auth_token;
        const patientId = result.patient_id;
        
        // Build headers with auth
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }
        
        if (patientId) {
            const encodedPatientId = await encodeSha256(patientId);
            headers["Account-Id"] = encodedPatientId;
        }

        // Merge with custom headers
        const mergedHeaders = {
            ...headers,
            ...(requestInfo?.customHeaders || {}),
            ...(requestInfo?.headers || {}),
        };

        const modifiedRequestInfo = Object.assign(requestInfo || {}, {
            ...requestInfo,
            headers: mergedHeaders,
            ...(requestInfo?.signal && { signal: requestInfo.signal }),
        });

        try {
            const response = await fetch(url, modifiedRequestInfo);

            if (response.status === 401) {
                // Token expired or invalid
                const errorData: IFetchError = {
                    errorCode: 401,
                    errorMessage: 'Invalid or expired token',
                    error: { message: 'invalid or expired jwt' },
                };
                throw errorData;
            }

            if (!response.ok) {
                const error = new Error('An error occurred while fetching data');
                let errorResponseJson = response;

                if (response.headers.get('Content-Type')?.includes('application/json')) {
                    errorResponseJson = await response.json();
                }

                const errorData: IFetchError = {
                    errorCode: response.status,
                    errorMessage: error.message || 'Unknown error',
                    error: errorResponseJson,
                };

                throw errorData;
            }

            if (response.status === 204) {
                // Returns null as there is no content to return.
                reject(null);
            }

            if (response.headers.get('Content-Type')?.includes('application/json')) {
                resolve(await response.json());
            }

            resolve(response);
        } catch (error: any) {
            throw error;
        }
    });
}

export default fetcher;
import { encodeSha256 } from "../utils/encoding-utils";

interface IFetchError {
    errorCode: number;
    errorMessage: string;
    error?: any;
}

interface IFetchRequestInit extends RequestInit {
    customHeaders?: Record<string, string>;
}

const fetcher = async <TResponse = any>(url: RequestInfo, requestInfo?: IFetchRequestInit): Promise<TResponse | any> => {
    return new Promise<TResponse | any>((resolve, reject) => {
        chrome.storage.local.get(['token', 'patientId'], async (result) => {
            const accessToken = result.token;
            console.log('Access token:', accessToken);
            console.log("storage result:", result);
            const patientId = result.patientId;
            const encodedPatientId = await encodeSha256(patientId);

            const defaultHeaders: Record<string, any> = {
                Authorization: `Bearer ${accessToken}`,
                "Account-Id": encodedPatientId,
                "Content-Type": "application/json",
            }

            const mergedHeaders = {
                ...defaultHeaders,
                ...(requestInfo?.customHeaders || {}),
                ...(requestInfo?.headers || {}),
            };

            const modifiedRequestInfo = Object.assign(requestInfo || {}, {
                ...requestInfo,
                headers: mergedHeaders,
                ...(requestInfo?.signal && { signal: requestInfo.signal }),
            })

            try {
                let response = await fetch(url, modifiedRequestInfo);

                if (response.status === 401) {
                    // TODO: Re-request credentials to re-fetch the token.
                    reject(null);
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
    });
}

export default fetcher;
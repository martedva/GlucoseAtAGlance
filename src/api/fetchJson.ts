interface IFetchError {
    errorCode: number;
    errorMessage: string;
    error?: any;
}

interface IFetchRequestInit extends RequestInit {
    customHeaders?: Record<string, string>;
}

const fetcher = async <TResponse = any>(url: RequestInfo, requestInfo?: IFetchRequestInit): Promise<TResponse | any> => {
    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3ZGNlYjllLTkyNjctZTkxMS04MTVkLTA2MTBlNmUzOGNiZCIsImZpcnN0TmFtZSI6Ik1hcnRpbiIsImxhc3ROYW1lIjoiRWR2YXJkc2VuIiwiY291bnRyeSI6IlNFIiwicmVnaW9uIjoiZXUiLCJyb2xlIjoicGF0aWVudCIsInMiOiJsbHUuYW5kcm9pZCIsInNpZCI6IjRiZTMzOTU2LWNkNDAtNDZmOS1hNTBmLWRjNTBhOWUzYzI4YiIsImV4cCI6MTc2MDYxMjMxMiwiaWF0IjoxNzQ1MDYwMzEyLCJqdGkiOiI3ZTE5ZmRiOS0zOWQ2LTRhOWQtYjhkMi1jMzczYWFjZTQ2NGYifQ.BGgd7ia_Om7ZlNMY1eN6xuTv5yiQsDqPzv7z4dF8s1U";

    const defaultHeaders: Record<string, any> = {
        Authorization: `Bearer ${accessToken}`,
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
            return null;
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
            return null;
        }

        if (response.headers.get('Content-Type')?.includes('application/json')) {
            return await response.json();
        }

        return response;
    } catch (error: any) {
        throw error;
    }
}

export default fetcher;
import { useEffect, useState } from "react";
import useSWR, { SWRConfiguration, useSWRConfig } from "swr";

interface DataManagerProps<DataType> extends SWRConfiguration {
    shouldFetch: boolean;
    cacheKey: string | null;
    getterFn: () => Promise<DataType>;
}

interface Error {
    message?: string;
    reason?: string;
    subject?: string;
    subjectType?: string;
    type?: string;
    errorCode?: string;
}

interface ErrorModel {
    errorCode?: number;
    error?: string;
    errorMessage?: string;
    hasError?: boolean;
    errors?: Error[];
}

const serializeKey = (key: string | string[]) => {
    return typeof key === 'string' ? key : JSON.stringify(key);
}

const useDataManager = <DataType>({
    shouldFetch,
    cacheKey,
    getterFn,
    ...rest
}: DataManagerProps<DataType>) => {
    const { cache } = useSWRConfig();
    // const { user, isLoading } = useUser();
    const key = cacheKey; // cacheKey ? [cacheKey, accessToken] : cacheKey;
    const {
        data,
        mutate: mutateData,
        isValidating,
        isLoading: isLoadingData,
        error
    } = useSWR<DataType, ErrorModel>( // ErrorModel is not confirmed - align with LibreModel possibly
        shouldFetch ? key : null, // shouldFetch && !isLoading ? key : null,
        () => getterFn(),
        {
            revalidateOnFocus: false,
            revalidateOnMount: key ? !cache.get(serializeKey(key)) : false,
            shouldRetryOnError: false,
            errorRetryCount: 0,
            dedupingInterval: 1000 * 60,
            ...rest,
        },
    );

    const [isValidatingData, setIsValidatingData] = useState(false);

    useEffect(() => {setIsValidatingData(isValidating)}, [isValidating])

    return {
        respData: data,
        isValidatingData,
        setIsValidatingData,
        isLoadingData,
        mutateData,
        error,
        data,
    };
}

export default useDataManager;
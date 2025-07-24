import useSWR from 'swr';
import { getLibreToken } from '../api/libre/libre-api';
import { getTokenRoute } from '../api/libre/libre-routes';
import useDataManager from '../api/useDataManager';

export type DataType = Awaited<ReturnType<typeof getLibreToken>>;

interface useLibreTokenDataProps {
    email: string;
    password: string;
    shouldFetch?: boolean;
}

const useLibreTokenData = ({ email, password, shouldFetch = true}: useLibreTokenDataProps) => {
  const route = getTokenRoute;

  const config = {
    shouldFetch,
    cacheKey: route,
    getterFn: () => getLibreToken(email, password),
  };

  // Controller instance for custom data manager hook to handle fetching and caching
  const controller = useDataManager<DataType>(config);

  const { respData: tokenData, isValidatingData, isLoadingData, mutateData } = controller;

  return {
    tokenData,
    isValidatingData,
    isLoadingData,
    mutateData,
  }
}

export default useLibreTokenData;
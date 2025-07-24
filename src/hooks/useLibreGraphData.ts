import useSWR from 'swr';
import { getLibreGraph } from '../api/libre/libre-api';
import { getGraphRoute } from '../api/libre/libre-routes';
import useDataManager from '../api/useDataManager';

export type DataType = Awaited<ReturnType<typeof getLibreGraph>>;

interface useLibreGraphDataProps {
    patientId: string;
    shouldFetch?: boolean;
}

const useLibreGraphData = ({ patientId, shouldFetch = true}: useLibreGraphDataProps) => {
  const route = getGraphRoute(patientId);

  const config = {
    shouldFetch,
    cacheKey: route,
    getterFn: () => getLibreGraph(patientId),
  };

  // Controller instance for custom data manager hook to handle fetching and caching
  const controller = useDataManager<DataType>(config);

  const { respData: graphData, isValidatingData, isLoadingData, mutateData } = controller;

  return {
    graphData,
    isValidatingData,
    isLoadingData,
    mutateData,
  }
}

export default useLibreGraphData;
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import DevelopmentGraph from '../../components/DevelopmentGraph';
import LibreViewResponse from '../../types/libreViewResponse';
import './App.css';

export type GraphData = {
  time: Date;
  value: number;
};

type NumberToStringDictionary = {
  [key: number]: string;
};

const trendArrowDict: NumberToStringDictionary = {
  1: "Down",
  2: "Slightly down",
  3: "Constant",
  4: "Slightly up",
  5: "Up"
};

const measurementColorDict: NumberToStringDictionary = {
  0: "red",
  1: "green",
  2: "yellow",
  3: "orange",
}

const  GetLibreViewData = (
  setGlucose: Dispatch<SetStateAction<string | undefined>>,
  setTargetLow: Dispatch<SetStateAction<number | undefined>>,
  setTargetHigh: Dispatch<SetStateAction<number | undefined>>,
  setGraphData: Dispatch<SetStateAction<GraphData[] | undefined>>,
  setDaysToExpire: Dispatch<SetStateAction<number | undefined>>,
) => {
  chrome.runtime.sendMessage({ action: "GetLibreViewData" }, function (response: LibreViewResponse) {
    const glucose: string = response.data.connection.glucoseItem.Value.toString();
    setGlucose(glucose);
    console.log("response", response.data)

    const appliedDate = new Date(0);
    appliedDate.setUTCSeconds(1756446638);
    const endDate = new Date(appliedDate.setDate(appliedDate.getDate() + 14));
    
    const now = new Date();

    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysToExpire(diffDays);

    // The conversion factor (18.01554) comes from the molecular weight of glucose divided by 1000, 
    // since mmol/L measures the number of molecules while mg/dL measures the weight.
    const targetLow: number = response.data.connection.targetLow / 18.01554; // convert mg/dL to mmol/L
    setTargetLow(targetLow);
    const targetHigh: number = response.data.connection.targetHigh / 18.01554; // convert mg/dL to mmol/L
    setTargetHigh(targetHigh);
    const graphData: GraphData[] = response.data.graphData.map((item) => ({
      time: item.Timestamp,
      value: item.Value
    }));
    setGraphData(graphData);
  });
}

const GetToken = (
  setToken: Dispatch<SetStateAction<string | undefined>>
) => {
  chrome.runtime.sendMessage({ action: "GetToken" }, function (response: string) {
    setToken(response);
  });
}

function App() {
  const [glucose, setGlucose] = useState<string>();
  const [graphData, setGraphData] = useState<GraphData[]>();
  const [targetLow, setTargetLow] = useState<number>();
  const [targetHigh, setTargetHigh] = useState<number>();
  const [daysToExpire, setDaysToExpire] = useState<number>();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    if (!token) { 
      GetToken(setToken);
    }
  }, []);
  
  useEffect(() => {
    if (token) GetLibreViewData(setGlucose, setTargetLow, setTargetHigh, setGraphData, setDaysToExpire);
  }, [token]);

  return (
    <div className="App" style={{ width: '640px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px' }}>
        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
          {glucose} mmol/L
        </p>
        <DevelopmentGraph graphData={graphData} targetLow={targetLow} targetHigh={targetHigh} />
      </div>

      <p style={{ fontSize: '16px' }}>
          Sensor ends in {daysToExpire} day(s)
        </p>
    </div>
  );
}

export default App;

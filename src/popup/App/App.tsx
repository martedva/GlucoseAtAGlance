import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import './App.css';
import LibreViewResponse from '../../types/libreViewResponse';

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

const GetLibreViewData = (
  setGlucose: Dispatch<SetStateAction<string | undefined>>
) => {
  chrome.runtime.sendMessage({ action: "GetLibreViewData" }, function (response: LibreViewResponse) {
    let glucose: string = response.data.connection.glucoseItem.Value.toString();
    setGlucose(glucose);
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
  const [token, setToken] = useState<string>();

  useEffect(() => {
    if (!token) { 
      GetToken(setToken);
    }
  }, []);
  
  useEffect(() => {
    if (token) GetLibreViewData(setGlucose);
  }, [token]);

  return (
    <div className="App" style={{ width: '150px', height: '50px' }}>
      <header className="App-header">
        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
          {glucose} mmol/L
        </p>
      </header>
    </div>
  );
}

export default App;

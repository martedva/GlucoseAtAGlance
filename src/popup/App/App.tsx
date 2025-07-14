import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import LibreViewData from '../../types/data';
import './App.css';
import LoginResponse from '../../types/loginResponse';

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
  setGlucose: Dispatch<SetStateAction<string | undefined>>,
  setTrendArrow: Dispatch<SetStateAction<number | undefined>>
) => {
  console.log("GetLibreViewData called!");
  chrome.runtime.sendMessage({ action: "GetLibreViewData" }, function (response) {
    let glucose: string = response.connection.glucoseItem.Value;
    setGlucose(glucose)
    
    console.log("glucose", glucose);

    let trendArrowId: number = response.connection.glucoseItem.TrendArrow;
    let trendArrow: string = trendArrowDict[trendArrowId];
    setTrendArrow(trendArrowId)
  });
}

function App() {
  const [glucose, setGlucose] = useState<string>()
  const [trendArrow, setTrendArrow] = useState<number>()

  useEffect(() => {
    GetLibreViewData(setGlucose, setTrendArrow);
  }, []);

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

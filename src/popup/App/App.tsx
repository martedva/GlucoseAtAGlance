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
    console.log("App component mounted, fetching LibreView data");
    GetLibreViewData(setGlucose, setTrendArrow);
  }, []);

  return (
    <div className="App" style={{ width: '150px', height: '50px' }}>
      <header className="App-header">
        <p>
          Glucose: {glucose} mmol/L
        </p>
        <div style={{ width: '25px', height: '25px' }}>
          {trendArrow == 1 && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
          </svg>
          }
          {trendArrow == 2 && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 4.5 15 15m0 0V8.25m0 11.25H8.25" />
          </svg>
          }
          {trendArrow == 3 && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          }
          {trendArrow == 4 && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          }
          {trendArrow == 5 && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 11 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
          }
        </div>
      </header>
    </div>
  );
}

export default App;

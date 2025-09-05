import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from 'react';
import { GraphData } from "../popup/App/App";

interface DevelopmentGraphProps {
  graphData?: GraphData[];
  targetLow?: number;
  targetHigh?: number;
}

const DevelopmentGraph = ({ graphData, targetLow, targetHigh }: DevelopmentGraphProps) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    // Parse the time strings to Date objects
    const parsedData = graphData.map(d => ({
      ...d,
      time: new Date(d.time)
    }));

    // Create the plot
    const plot = Plot.plot({
      marks: [
        Plot.line(parsedData, {
          x: "time",
          y: "value",
          stroke: "#000000",
          strokeWidth: 3
        }),
        Plot.dot(parsedData, {
          x: "time",
          y: "value",
          fill: "#000000",
          r: 3.5
        }),
        Plot.rect([{}], {
          x1: parsedData[0].time,
          x2: parsedData[parsedData.length - 1].time,
          y1: targetLow,
          y2: targetHigh,
          fill: "#88ba82",
          fillOpacity: 0.3
        }),
      ],
      width: 640,
      height: 400,
      marginLeft: 50,
      marginBottom: 50,
      x: {
        type: "time",
        label: "Time",
        grid: false
      },
      y: {
        label: "mmol/L",
        domain: [0, 21],
        grid: true
      },
    });

    // Clear previous content and append new plot
    (containerRef.current as HTMLDivElement).innerHTML = '';
    (containerRef.current as HTMLDivElement).appendChild(plot);

    // Cleanup function
    return () => {
      if (containerRef.current) {
        (containerRef.current as HTMLDivElement).innerHTML = '';
      }
    };
  }, [graphData]);

  return (
    <div className="p-4">
      <div ref={containerRef} className="w-full overflow-x-auto"></div>
    </div>
  );
};

export default DevelopmentGraph;
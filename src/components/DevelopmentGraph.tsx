import * as Plot from '@observablehq/plot';
import { useEffect, useRef } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

export interface GraphDataPoint {
  time: Date;
  value: number;
}

interface DevelopmentGraphProps {
  graphData?: GraphDataPoint[];
  targetLow?: number;
  targetHigh?: number;
  isLoading?: boolean;
}

const DevelopmentGraph = ({
  graphData,
  targetLow,
  targetHigh,
  isLoading = false,
}: DevelopmentGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !graphData || graphData.length === 0) return;

    // Parse the time strings to Date objects
    const parsedData = graphData.map((d) => ({
      ...d,
      time: new Date(d.time),
    }));

    // Create the plot marks
    // biome-ignore lint/suspicious/noExplicitAny: Plot marks type is not exported by @observablehq/plot
    const marks: any[] = [
      Plot.line(parsedData, {
        x: 'time',
        y: 'value',
        stroke: '#000000',
        strokeWidth: 3,
      }),
      Plot.dot(parsedData, {
        x: 'time',
        y: 'value',
        fill: '#000000',
        r: 3.5,
      }),
    ];

    // Add target range rectangle if targets are defined
    if (targetLow !== undefined && targetHigh !== undefined) {
      marks.push(
        Plot.rect([{}], {
          x1: parsedData[0].time,
          x2: parsedData[parsedData.length - 1].time,
          y1: targetLow,
          y2: targetHigh,
          fill: '#88ba82',
          fillOpacity: 0.3,
        })
      );
    }

    // Create the plot
    const plot = Plot.plot({
      marks,
      width: 640,
      height: 400,
      marginLeft: 50,
      marginBottom: 50,
      x: {
        type: 'time',
        label: 'Time',
        grid: false,
      },
      y: {
        label: 'mmol/L',
        domain: [0, 21],
        grid: true,
      },
    });

    // Clear previous content and append new plot
    const container = containerRef.current;
    container.innerHTML = '';
    container.appendChild(plot);

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [graphData, targetLow, targetHigh]);

  if (isLoading) {
    return (
      <div className="graph-container">
        <LoadingSkeleton width="100%" height="400px" className="graph-skeleton" />
      </div>
    );
  }

  if (!graphData || graphData.length === 0) {
    return (
      <div className="graph-container">
        <p style={{ textAlign: 'center', color: '#666' }}>No glucose data available</p>
      </div>
    );
  }

  return (
    <div className="graph-container">
      <div ref={containerRef} className="graph" />
    </div>
  );
};

export default DevelopmentGraph;

import * as Plot from '@observablehq/plot';
import { memo, useEffect, useMemo, useRef } from 'react';
import { predictGlucoseTrend } from '@/utils/trend-prediction';
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

/**
 * Memoized graph component for glucose data visualization
 * Uses Observable Plot for rendering with optional trend prediction line
 */
const DevelopmentGraph = memo(function DevelopmentGraph({
  graphData,
  targetLow,
  targetHigh,
  isLoading = false,
}: DevelopmentGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize plot configuration with trend prediction
  const plotConfig = useMemo(() => {
    if (!graphData || graphData.length === 0) return null;

    // Calculate trend prediction for dotted line
    const trendPrediction = predictGlucoseTrend(graphData);

    // Create the plot marks
    // biome-ignore lint/suspicious/noExplicitAny: Plot marks type is not exported by @observablehq/plot
    const marks: any[] = [
      Plot.line(graphData, {
        x: 'time',
        y: 'value',
        stroke: '#000000',
        strokeWidth: 3,
      }),
      Plot.dot(graphData, {
        x: 'time',
        y: 'value',
        fill: '#000000',
        r: 3.5,
      }),
    ];

    // Add trend prediction dotted line if we have prediction data
    if (trendPrediction && graphData.length > 0) {
      const lastPoint = graphData[graphData.length - 1];
      const lastTime = lastPoint.time.getTime();
      const fifteenMinLater = new Date(lastTime + 15 * 60 * 1000);
      const predictedValue = lastPoint.value + trendPrediction.predictedChange15min;

      // Create prediction line data points (from last point to 15 min in future)
      const predictionData = [
        { time: lastPoint.time, value: lastPoint.value },
        { time: fifteenMinLater, value: predictedValue },
      ];

      marks.push(
        Plot.line(predictionData, {
          x: 'time',
          y: 'value',
          stroke:
            trendPrediction.predictedChange > 0.1
              ? '#f57c00'
              : trendPrediction.predictedChange < -0.1
                ? '#1976d2'
                : '#666',
          strokeWidth: 2,
          strokeDasharray: '5,5', // Dotted/dashed line
          opacity: 0.7,
        })
      );

      // Add a dot at the predicted point
      marks.push(
        Plot.dot(predictionData.slice(-1), {
          x: 'time',
          y: 'value',
          fill:
            trendPrediction.predictedChange > 0.1
              ? '#f57c00'
              : trendPrediction.predictedChange < -0.1
                ? '#1976d2'
                : '#666',
          r: 4,
          opacity: 0.7,
        })
      );
    }

    // Add target range rectangle if targets are defined
    // Extend rectangle to include prediction period (15 minutes beyond last data point)
    if (targetLow !== undefined && targetHigh !== undefined) {
      const lastDataPoint = graphData[graphData.length - 1];
      const predictionEndTime = new Date(lastDataPoint.time.getTime() + 15 * 60 * 1000);
      
      marks.push(
        Plot.rect([{}], {
          x1: graphData[0].time,
          x2: predictionEndTime,
          y1: targetLow,
          y2: targetHigh,
          fill: '#88ba82',
          fillOpacity: 0.3,
        })
      );
    }

    return {
      marks,
      width: 640,
      height: 400,
      marginLeft: 50,
      marginBottom: 50,
      x: {
        type: 'time' as const,
        label: 'Time',
        grid: false,
      },
      y: {
        label: 'mmol/L',
        domain: [0, 21],
        grid: true,
      },
    };
  }, [graphData, targetLow, targetHigh]);

  useEffect(() => {
    if (!containerRef.current || !plotConfig || !graphData) return;

    // Create the plot
    const plot = Plot.plot(plotConfig);

    // Add accessibility attributes to the SVG
    const svg = plot.querySelector('svg');
    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute(
        'aria-label',
        'Glucose level graph showing readings over time with trend prediction'
      );

      // Add title and description for screen readers
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = 'Glucose Level Graph';
      svg.insertBefore(title, svg.firstChild);

      const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
      const dataPoints = graphData.length;
      const avgValue = graphData.reduce((sum, d) => sum + d.value, 0) / dataPoints;
      desc.textContent = `Graph showing ${dataPoints} glucose readings. Average: ${avgValue.toFixed(1)} mmol/L`;
      svg.insertBefore(desc, title.nextSibling);
    }

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
  }, [plotConfig, graphData]);

  if (isLoading) {
    return (
      <div className="graph-container" role="status" aria-label="Loading graph">
        <LoadingSkeleton width="100%" height="400px" className="graph-skeleton" />
      </div>
    );
  }

  if (!graphData || graphData.length === 0) {
    return (
      <div className="graph-container" role="status">
        <p style={{ textAlign: 'center', color: '#666' }}>No glucose data available</p>
      </div>
    );
  }

  return (
    <div
      className="graph-container"
      role="figure"
      aria-label="Glucose level chart with trend prediction"
    >
      <div ref={containerRef} className="graph" />
    </div>
  );
});

export default DevelopmentGraph;

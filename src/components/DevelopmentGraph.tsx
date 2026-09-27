import * as Plot from '@observablehq/plot';
import { useEffect, useRef, useMemo, memo } from 'react';
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
 * Uses Observable Plot for rendering
 */
const DevelopmentGraph = memo(function DevelopmentGraph({
  graphData,
  targetLow,
  targetHigh,
  isLoading = false,
}: DevelopmentGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize plot configuration
  const plotConfig = useMemo(() => {
    if (!graphData || graphData.length === 0) return null;

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

    // Add target range rectangle if targets are defined
    if (targetLow !== undefined && targetHigh !== undefined) {
      marks.push(
        Plot.rect([{}], {
          x1: graphData[0].time,
          x2: graphData[graphData.length - 1].time,
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
      svg.setAttribute('aria-label', 'Glucose level graph showing readings over time');

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
    <div className="graph-container" role="figure" aria-label="Glucose level chart">
      <div ref={containerRef} className="graph" />
    </div>
  );
});

export default DevelopmentGraph;
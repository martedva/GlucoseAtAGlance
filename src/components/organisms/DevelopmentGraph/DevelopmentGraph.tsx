import { memo, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { LoadingSkeleton } from '@/components/atoms';
import { DataCard } from '@/components/molecules';
import { useTheme } from '@/hooks/useTheme';
import { predictGlucoseTrend } from '@/utils/trend-prediction';
import type { TransformedGraphDataPoint } from '@/hooks/useGlucoseData';
import './DevelopmentGraph.css';

// Register Chart.js components
Chart.register(...registerables);

// Helper to get CSS variable value
const getCssVar = (name: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  return '';
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface DevelopmentGraphProps {
  graphData: TransformedGraphDataPoint[];
  targetLow?: number;
  targetHigh?: number;
  isLoading: boolean;
  uom: number; // 0 = mg/dL, 1 = mmol/L
}

/**
 * Organism DevelopmentGraph component
 * Displays glucose data over time with target range
 */
const DevelopmentGraph = memo(function DevelopmentGraph({
  graphData,
  targetLow = 70,
  targetHigh = 180,
  isLoading,
  uom,
}: DevelopmentGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { theme } = useTheme();

  const unit = uom === 0 ? 'mmol/L' : 'mg/dL';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Get colors from CSS variables (supports dark mode)
    const primaryColor = getCssVar('--color-primary');
    const primaryColorRgba = hexToRgba(primaryColor, 0.1);
    const stableColor = getCssVar('--glucose-stable');
    const stableColorRgba = hexToRgba(stableColor, 0.1);

    // Prepare data - use Date objects for proper time-based x-axis
    const chartData = graphData.map((d) => ({
      x: d.time,
      y: d.value,
    }));

    // Create base dataset
    const datasets: any[] = [
      {
        label: 'Glucose',
        data: chartData,
        borderColor: primaryColor,
        backgroundColor: primaryColorRgba,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ];

    // Add trend prediction line if we have enough data
    if (graphData.length >= 2) {
      const trendPrediction = predictGlucoseTrend(graphData);
      
      if (trendPrediction) {
        const lastPoint = graphData[graphData.length - 1];
        const lastTime = lastPoint.time;
        const fifteenMinLater = new Date(lastTime.getTime() + 15 * 60 * 1000);
        const predictedValue = lastPoint.value + trendPrediction.predictedChange15min;
        
        // Add prediction line dataset - extends naturally from last data point
        datasets.push({
          label: 'Prediction',
          data: [
            { x: lastTime, y: lastPoint.value },
            { x: fifteenMinLater, y: predictedValue },
          ],
          borderColor: stableColor,
          borderWidth: 2,
          borderDash: [3, 3],
          fill: true,
          backgroundColor: stableColorRgba,
          pointRadius: 0,
        });
      }
    }

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const value = context.parsed.y;
                // Format to 1 decimal place for cleaner display
                const formattedValue = typeof value === 'number' ? value.toFixed(1) : value;
                return `${formattedValue} ${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            display: true,
            grid: {
              display: false,
            },
            time: {
              unit: 'minute',
              displayFormats: {
                minute: 'HH:mm',
              },
            },
            ticks: {
              maxTicksLimit: 6,
              font: {
                size: 10,
              },
              color: getCssVar('--color-gray-500'),
              source: 'auto',
            },
          },
          y: {
            display: true,
            min: 0,
            max: 21,
            grid: {
              color: getCssVar('--color-gray-200'),
            },
            ticks: {
              font: {
                size: 10,
              },
              color: getCssVar('--color-gray-500'),
            },
          },
        },
      },
      plugins: [
        {
          id: 'targetRange',
          beforeDraw: (chart: any) => {
            const { ctx, chartArea, scales } = chart;
            if (!scales.y) return;

            const minY = scales.y.getPixelForValue(targetHigh);
            const maxY = scales.y.getPixelForValue(targetLow);

            ctx.save();
            ctx.fillStyle = getCssVar('--target-range-bg-light');
            ctx.fillRect(chartArea.left, minY, chartArea.right - chartArea.left, maxY - minY);
            ctx.restore();
          },
        },
      ],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [graphData, targetLow, targetHigh, unit, theme]);

  if (isLoading) {
    return (
      <DataCard className="graph-container">
        <div className="graph-container__canvas-wrapper">
          <LoadingSkeleton height="100%" />
        </div>
      </DataCard>
    );
  }

  return (
    <DataCard className="graph-container" role="region" aria-label="Glucose trend graph">
      <div className="graph-container__canvas-wrapper">
        <canvas ref={canvasRef} className="graph-container__canvas" />
      </div>
    </DataCard>
  );
});

export default DevelopmentGraph;
import { memo, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { LoadingSkeleton } from '@/components/atoms';
import type { TransformedGraphDataPoint } from '@/hooks/useGlucoseData';
import './DevelopmentGraph.css';

// Register Chart.js components
Chart.register(...registerables);

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

    // Prepare data
    const labels = graphData.map((d) => d.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const values = graphData.map((d) => d.value);

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Glucose',
            data: values,
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
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
                return `${value} ${unit}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              maxTicksLimit: 6,
              font: {
                size: 10,
              },
            },
          },
          y: {
            display: true,
            min: 0,
            max: 21,
            grid: {
              color: '#e0e0e0',
            },
            ticks: {
              font: {
                size: 10,
              },
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
            ctx.fillStyle = 'rgba(136, 186, 130, 0.3)';
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
  }, [graphData, targetLow, targetHigh, unit]);

  if (isLoading) {
    return (
      <div className="graph-container">
        <h3 className="graph-container__title">Glucose Trend</h3>
        <div className="graph-container__canvas-wrapper">
          <LoadingSkeleton height="100%" />
        </div>
      </div>
    );
  }

  return (
    <div className="graph-container" role="region" aria-label="Glucose trend graph">
      <h3 className="graph-container__title">Glucose Trend</h3>
      <div className="graph-container__canvas-wrapper">
        <canvas ref={canvasRef} className="graph-container__canvas" />
      </div>
    </div>
  );
});

export default DevelopmentGraph;
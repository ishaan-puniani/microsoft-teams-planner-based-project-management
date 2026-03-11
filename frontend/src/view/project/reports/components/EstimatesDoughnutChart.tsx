import React, { useMemo } from 'react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { AggregateEstimates } from './estimatesConstants';
import { ESTIMATES_ROLES, CHART_COLORS } from './estimatesConstants';

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  estimates: AggregateEstimates | null;
  colors?: string[];
  maxWidth?: number;
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  emptyMessage?: string;
};

const EstimatesDoughnutChart = ({
  estimates,
  colors = CHART_COLORS,
  maxWidth = 320,
  legendPosition = 'bottom',
  emptyMessage = 'No estimate data to display.',
}: Props) => {
  const chartData = useMemo(() => {
    if (!estimates) return null;
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];
    ESTIMATES_ROLES.forEach((r, i) => {
      const v = estimates[r.key];
      if (v != null && v > 0) {
        labels.push(r.label);
        data.push(v);
        backgroundColor.push(colors[i % colors.length]);
      }
    });
    if (data.length === 0) return null;
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          hoverBackgroundColor: backgroundColor,
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  }, [estimates, colors]);

  if (!chartData || chartData.datasets[0].data.length === 0) {
    return <p className="text-muted mb-0">{emptyMessage}</p>;
  }

  return (
    <div style={{ maxWidth, margin: '0 auto' }}>
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: legendPosition },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = (ctx.dataset.data as number[]).reduce(
                    (a, b) => a + b,
                    0,
                  );
                  const pct = total
                    ? (((ctx.raw as number) / total) * 100).toFixed(1)
                    : '0';
                  return `${ctx.label}: ${ctx.raw} h (${pct}%)`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
};

export default EstimatesDoughnutChart;

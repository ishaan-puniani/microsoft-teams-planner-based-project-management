import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { i18n } from 'src/i18n';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const data = {
  labels: [
    i18n('dashboard.charts.months.1'),
    i18n('dashboard.charts.months.2'),
    i18n('dashboard.charts.months.3'),
    i18n('dashboard.charts.months.4'),
    i18n('dashboard.charts.months.5'),
    i18n('dashboard.charts.months.6'),
  ],
  datasets: [
    {
      label: i18n('dashboard.charts.red'),
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: [65, 59, 80, 81, 56, 55, 40],
    },
  ],
};

export const options = {
  indexAxis: 'x' as const,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
};

export default function DashboardHorizontalBarChart(props) {
  return <Bar data={data} options={options} />;
}

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { i18n } from 'src/i18n';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
    i18n('dashboard.charts.months.7'),
  ],
  datasets: [
    {
      label: i18n('dashboard.charts.green'),
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      // fill: false,
      // lineTension: 0.1,
      // borderCapStyle: 'butt',
      // borderDash: [],
      // borderDashOffset: 0.0,
      // borderJoinStyle: 'miter',
      // pointBorderColor: 'rgba(75,192,192,1)',
      // pointBackgroundColor: '#fff',
      // pointBorderWidth: 1,
      // pointHoverRadius: 5,
      // pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      // pointHoverBorderColor: 'rgba(220,220,220,1)',
      // pointHoverBorderWidth: 2,
      // pointRadius: 1,
      // pointHitRadius: 10,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  // scales: {
  //   xAxes: [
  //     {
  //       display: false,
  //     },
  //   ],
  //   yAxes: [
  //     {
  //       display: true,
  //     },
  //   ],
  // },
};

const DashboardLineChart = (props) => {
  return <Line data={data} options={options} />;
};

export default DashboardLineChart;

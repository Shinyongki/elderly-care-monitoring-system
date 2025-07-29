import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController,
  RadarController,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController,
  RadarController
);

export const chartColors = {
  primary: 'hsl(207, 90%, 54%)',
  primaryLight: 'hsl(207, 90%, 67%)',
  success: 'hsl(142, 71%, 32%)',
  warning: 'hsl(38, 92%, 50%)',
  error: 'hsl(0, 84%, 60%)',
  info: 'hsl(199, 89%, 48%)',
  purple: 'hsl(271, 81%, 56%)',
  gray: 'hsl(215, 16%, 47%)',
  secondary: '#64748b',
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          family: "'Noto Sans KR', 'Inter', sans-serif",
          size: 12,
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      titleFont: {
        family: "'Noto Sans KR', 'Inter', sans-serif",
      },
      bodyFont: {
        family: "'Noto Sans KR', 'Inter', sans-serif",
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Noto Sans KR', 'Inter', sans-serif",
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: '#f1f5f9',
      },
      ticks: {
        font: {
          family: "'Noto Sans KR', 'Inter', sans-serif",
          size: 11,
        },
      },
    },
  },
};

export const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          family: "'Noto Sans KR', 'Inter', sans-serif",
          size: 12,
        },
      },
    },
  },
  scales: {
    r: {
      angleLines: {
        display: true,
      },
      beginAtZero: true,
      max: 5,
      ticks: {
        stepSize: 1,
        font: {
          family: "'Noto Sans KR', 'Inter', sans-serif",
          size: 10,
        },
      },
      pointLabels: {
        font: {
          family: "'Noto Sans KR', 'Inter', sans-serif",
          size: 11,
        },
      },
    },
  },
};

export const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        font: {
          family: "'Noto Sans KR', 'Inter', sans-serif",
          size: 12,
        },
        boxWidth: 12,
        padding: 15,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value}명 (${percentage}%)`;
        },
      },
    },
  },
};
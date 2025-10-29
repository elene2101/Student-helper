import { ChartConfiguration, ChartOptions } from 'chart.js';
const days = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვ'];

export const BarChartData: ChartConfiguration<'bar'>['data'] = {
  labels: days,
  datasets: [
    {
      label: 'კლასები',
      data: [],
      backgroundColor: '#60a5fa',
      borderRadius: 6,
      barThickness: 20,
    },
    {
      label: 'დავალებები',
      data: [],
      backgroundColor: '#34d399',
      borderRadius: 6,
      barThickness: 20,
    },
    {
      label: 'გამოცდები',
      data: [],
      backgroundColor: '#f87171',
      borderRadius: 6,
      barThickness: 20,
    },
  ],
};
export const BarChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { size: 14, family: 'Noto Sans Georgian, sans-serif' },
        color: '#333',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      titleColor: '#111',
      bodyColor: '#333',
      cornerRadius: 8,
      titleFont: { size: 14 },
      bodyFont: { size: 13 },
      callbacks: {
        title: (ctx) => `დღე: ${ctx[0].label}`,
        label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 13 } },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, stepSize: 1, font: { size: 13 } },
      grid: { color: '#f1f1f1' },
    },
  },
  animation: { duration: 900, easing: 'easeOutQuart' },
};

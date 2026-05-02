import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WeeklySugarChart({ data }) {
  if (!data || data.length === 0) return null;

  const labels = data.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  const values = data.map(d => d.sugar_g);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sugar Intake (g)',
        data: values,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(1, '#34d399');
          return gradient;
        },
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: '#059669',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 14, weight: '900' },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (item) => `${item.raw}g Sugar`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          font: { size: 10, weight: '600' },
          color: '#9ca3af',
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: '800' },
          color: '#4b5563',
          padding: 8,
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="bg-white border-2 border-gray-900 rounded-[2rem] p-6 md:p-8 mb-8 shadow-[0_6px_0_0_#111827] relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Weekly Footprint</h3>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Sugar consumption trends</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          Last 7 Days
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <Bar data={chartData} options={options} />
      </div>

      <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-50">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Daily</span>
            <span className="text-lg font-black text-gray-900">
              {(values.reduce((a, b) => a + b, 0) / 7).toFixed(1)}g
            </span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly Total</span>
            <span className="text-lg font-black text-emerald-600">
              {values.reduce((a, b) => a + b, 0).toFixed(0)}g
            </span>
         </div>
      </div>
    </div>
  );
}

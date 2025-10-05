
import React from 'react';
import type { User } from '../types';
import { BackIcon } from './icons/BackIcon';
import { TrashIcon } from './icons/TrashIcon';

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes <= 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  // Handle the edge case of very small float values
  if (bytes < 1) {
    return `${bytes.toFixed(dm)} Bytes`;
  }
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const UsageChart: React.FC<{ user: User }> = ({ user }) => {
  // Use the last 7 sessions for the chart
  const history = user.usageHistory.slice(-7);
  
  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No usage history to display.</p>
        <p>Start a tracking session to record data.</p>
      </div>
    );
  }

  const maxUsage = Math.max(...history.map(h => h.usage), 1); // Avoid division by zero
  const chartHeight = 200;
  const barWidth = 30;
  const barMargin = 15;
  const svgWidth = history.length * (barWidth + barMargin);

  return (
    <div className="w-full overflow-x-auto pb-4 flex justify-center">
      <svg width={svgWidth} height={chartHeight + 40} className="text-gray-400">
        <g transform="translate(0, 10)">
          {history.map((record, index) => {
            const barHeight = (record.usage / maxUsage) * (chartHeight - 20);
            const x = index * (barWidth + barMargin);
            const y = chartHeight - barHeight;
            const date = new Date(record.timestamp);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

            return (
              <g key={record.timestamp} className="cursor-pointer">
                <title>{`Usage: ${formatBytes(record.usage)}\nDate: ${date.toLocaleDateString()}`}</title>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight > 0 ? barHeight : 0}
                  fill="url(#barGradient)"
                  className="transition-all duration-300 hover:opacity-80"
                  rx="4"
                />
                <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" fontSize="12" fill="currentColor">
                  {formattedDate}
                </text>
                 <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="11" fill="white" className="font-semibold opacity-0 transition-opacity duration-300" style={{ pointerEvents: 'none' }}>
                  {formatBytes(record.usage, 1)}
                </text>
                 <style>{`
                  g:hover text {
                    opacity: 1;
                  }
                `}</style>
              </g>
            );
          })}
        </g>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#03dac6" />
            <stop offset="100%" stopColor="#6200ee" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

interface UsageHistoryViewProps {
  user: User;
  onBack: () => void;
  onClearHistory: (userId: string) => void;
}

const UsageHistoryView: React.FC<UsageHistoryViewProps> = ({ user, onBack, onClearHistory }) => {
  return (
    <div className="h-full flex flex-col relative">
      <header className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Go back to user list">
          <BackIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Usage History</h1>
      </header>

      <div className="mb-8">
        <p className="text-lg text-gray-400">{user.name}</p>
        <div className="flex items-end space-x-2">
            <p className="text-4xl font-bold text-secondary tracking-tight">{formatBytes(user.totalUsage)}</p>
            <p className="text-gray-400 pb-1">Total Used</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center bg-gray-800 p-4 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-white self-start">Recent Activity</h2>
        <UsageChart user={user} />
      </div>
      
      <div className="mt-auto pt-6">
        <button
          onClick={() => onClearHistory(user.id)}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 text-red-400 font-bold py-3 px-4 rounded-lg text-md hover:bg-red-900 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-red-500"
          aria-label={`Clear all usage history for ${user.name}`}
        >
          <TrashIcon className="w-5 h-5" />
          <span>Clear History</span>
        </button>
      </div>
    </div>
  );
};

export default UsageHistoryView;
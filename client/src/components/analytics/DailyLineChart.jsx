import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../common/Card';

export const DailyLineChart = ({ data, title = 'Daily Completion Trend' }) => {
  return (
    <Card className="p-5 flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
          {title}
        </h3>
        <p className="text-xs text-surface-400">
          Percentage of scheduled targets achieved per day
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis
              dataKey="dateKey"
              tickFormatter={(val) => val.slice(5)}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#64748b"
              opacity={0.4}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#64748b"
              opacity={0.4}
              unit="%"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-panel p-2.5 rounded-xl text-xs space-y-1 shadow-lg">
                      <p className="font-bold text-surface-900 dark:text-surface-100">
                        {label}
                      </p>
                      <p className="text-brand-500 font-semibold">
                        Completion: {payload[0].value}%
                      </p>
                      {payload[0].payload.completed !== undefined && (
                        <p className="text-surface-400">
                          {payload[0].payload.completed} / {payload[0].payload.scheduled} activities
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#0284c7"
              strokeWidth={3}
              dot={{ r: 3, fill: '#0284c7' }}
              activeDot={{ r: 6, fill: '#38bdf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

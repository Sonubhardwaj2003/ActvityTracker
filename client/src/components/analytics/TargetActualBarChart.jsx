import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card } from '../common/Card';

export const TargetActualBarChart = ({
  data,
  title = 'Target vs Actual Performance',
}) => {
  return (
    <Card className="p-5 flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
          {title}
        </h3>
        <p className="text-xs text-surface-400">
          Cumulative target units compared against recorded output
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#64748b"
              opacity={0.4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#64748b"
              opacity={0.4}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-panel p-2.5 rounded-xl text-xs space-y-1 shadow-lg">
                      <p className="font-bold text-surface-900 dark:text-surface-100">
                        {label}
                      </p>
                      {payload.map((p) => (
                        <p key={p.name} style={{ color: p.color }} className="font-medium">
                          {p.name}: {p.value} {p.payload.unit || ''}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
            />
            <Bar dataKey="totalTarget" name="Target" fill="#64748b" opacity={0.6} radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalActual" name="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfDay, subDays } from 'date-fns';
import type { ActivityLog } from '@/types/activity.types';

type TimePeriod = 'today' | '7days';

interface ActivityChartProps {
  logs: ActivityLog[];
  isLoading?: boolean;
}

const ActivityChartSkeleton = () => (
  <div className='animate-pulse'>
    <div className='h-8 bg-white/5 rounded-lg mb-8 w-1/4'></div>
    <div className='h-72 bg-white/5 rounded-xl'></div>
  </div>
);

export const ActivityChart = ({ logs, isLoading = false }: ActivityChartProps) => {
  const [period, setPeriod] = useState<TimePeriod>('7days');

  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case '7days':
        startDate = subDays(startOfDay(now), 6);
        break;
      default:
        startDate = subDays(startOfDay(now), 6);
    }

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.completedAt);
      return logDate >= startDate && logDate <= now;
    });

    const dailyMap = new Map<string, { duration: number; count: number }>();

    filteredLogs.forEach(log => {
      const date = startOfDay(new Date(log.completedAt));
      const dateKey = format(date, 'yyyy-MM-dd');
      const current = dailyMap.get(dateKey) || { duration: 0, count: 0 };
      dailyMap.set(dateKey, {
        duration: current.duration + log.durationMinutes,
        count: current.count + 1,
      });
    });

    const result = [];
    let currentDate = startDate;

    while (currentDate <= now) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayLabel = format(currentDate, 'EEE');
      const data = dailyMap.get(dateKey) || { duration: 0, count: 0 };

      result.push({
        day: dayLabel,
        duration: data.duration,
        count: data.count,
      });

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }, [logs, period]);

  if (isLoading) {
    return (
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-2xl p-8'>
        <ActivityChartSkeleton />
      </div>
    );
  }

  return (
    <div className='bg-[#1a0F16] border border-[#36282F] rounded-2xl p-8'>
      <div className='flex justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h3 className='text-xl sm:text-2xl font-bold text-white mb-2'>Weekly Activity Trends</h3>
          <span className='text-gray-400 text-sm'>
            Activity duration over the past {period === 'today' ? 'day' : '7 days'}
          </span>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all ${
              period === 'today'
                ? 'bg-[#d98a9d] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('7days')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all ${
              period === '7days'
                ? 'bg-[#d98a9d] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Last 7 Days
          </button>
        </div>
      </div>

      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id='colorDuration' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#d98a9d' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#d98a9d' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#444' vertical={false} />
          <XAxis dataKey='day' stroke='#888' />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a0F16',
              border: '1px solid #36282F',
              color: 'white',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'duration') return [`${value} min`, 'Duration'];
              return [`${value} activities`, 'Count'];
            }}
            labelFormatter={label => `${label}`}
          />
          <Area
            type='monotone'
            dataKey='duration'
            stroke='#d98a9d'
            strokeWidth={3}
            fillOpacity={1}
            fill='url(#colorDuration)'
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

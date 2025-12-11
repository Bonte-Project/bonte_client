import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { TimePeriod } from '@/types/nutrition.types';
import { useNutritionLogsStore } from '@/store/nutrition-logs.store';
import { format, startOfDay, subDays } from 'date-fns';

export const NutritionChart = () => {
  const [period, setPeriod] = useState<TimePeriod>('7days');
  const { logs } = useNutritionLogsStore();

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
      case '30days':
        startDate = subDays(startOfDay(now), 29);
        break;
      default:
        startDate = subDays(startOfDay(now), 6);
    }

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.eatenAt);
      return logDate >= startDate && logDate <= now;
    });

    const dailyMap = new Map<string, number>();

    filteredLogs.forEach(log => {
      const date = startOfDay(new Date(log.eatenAt));
      const dateKey = format(date, 'yyyy-MM-dd');

      const current = dailyMap.get(dateKey) || 0;
      dailyMap.set(dateKey, current + log.calories);
    });

    const result = [];
    let currentDate = startDate;

    while (currentDate <= now) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayLabel =
        period === '30days' ? format(currentDate, 'M/d') : format(currentDate, 'EEE');

      result.push({
        day: dayLabel,
        calories: dailyMap.get(dateKey) || 0,
      });

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }, [logs, period]);

  return (
    <div className='bg-[#1a0F16] border border-[#36282F] rounded-2xl p-8'>
      <div className='flex justify-between mb-8'>
        <div>
          <h3 className='text-2xl font-bold text-white mb-3'>Daily Trends</h3>
          <div className='mb-2'>
            <span className='text-gray-400 text-md'>
              Calorie intake over the past{' '}
              {period === 'today' ? 'today' : period === '7days' ? '7' : '30'} days
            </span>
          </div>
        </div>

        <Select value={period} onValueChange={value => setPeriod(value as TimePeriod)}>
          <SelectTrigger className='w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10 focus:ring-2 focus:ring-primary-button/50'>
            <SelectValue placeholder='Select period' />
          </SelectTrigger>
          <SelectContent className='bg-[#1a0F16] border-[#36282F]'>
            <SelectGroup>
              <SelectLabel className='text-gray-400'>Time Period</SelectLabel>
              <SelectItem
                value='today'
                className='text-white hover:bg-white/10 focus:bg-white/10 data-highlighted:bg-white/10 data-highlighted:text-white cursor-pointer'
              >
                Today
              </SelectItem>
              <SelectItem
                value='7days'
                className='text-white hover:bg-white/10 focus:bg-white/10 data-highlighted:bg-white/10 data-highlighted:text-white cursor-pointer'
              >
                Last 7 Days
              </SelectItem>
              <SelectItem
                value='30days'
                className='text-white hover:bg-white/10 focus:bg-white/10 data-highlighted:bg-white/10 data-highlighted:text-white cursor-pointer'
              >
                Last 30 Days
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id='colorCalories' x1='0' y1='0' x2='0' y2='1'>
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
            }}
            formatter={(value: number) => `${value} kcal`}
          />
          <Area
            type='monotone'
            dataKey='calories'
            stroke='#d98a9d'
            strokeWidth={3}
            fillOpacity={1}
            fill='url(#colorCalories)'
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

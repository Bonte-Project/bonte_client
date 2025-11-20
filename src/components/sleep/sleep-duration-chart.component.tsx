import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
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
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSleepLogsStore } from '@/store/sleep-logs.store';
import { differenceInMinutes, format, startOfDay, subDays } from 'date-fns';

export const SleepDurationChart = () => {
  const [period, setPeriod] = useState<TimePeriod>('7days');

  const { sleepLogs, getSleepLogs } = useSleepLogsStore();

  useEffect(() => {
    getSleepLogs();
  }, []);

  console.log(sleepLogs);

  const chartData = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) {
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

    const filteredLogs = sleepLogs.filter(sleepLog => {
      const logDate = new Date(sleepLog.startTime);
      return logDate >= startDate && logDate <= now;
    });

    const dailyMap = new Map<string, number>();

    filteredLogs.forEach(sleepLog => {
      const date = startOfDay(new Date(sleepLog.startTime));
      const dateKey = format(date, 'yyyy-MM-dd');

      const durationInMinutes = differenceInMinutes(
        new Date(sleepLog.endTime),
        new Date(sleepLog.startTime)
      );

      const current = dailyMap.get(dateKey) || 0;
      dailyMap.set(dateKey, current + durationInMinutes);
    });

    const result = [];
    let currentDate = startDate;

    while (currentDate <= now) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayLabel =
        period === '30days' ? format(currentDate, 'M/d') : format(currentDate, 'EEE');

      result.push({
        day: dayLabel,
        duration: dailyMap.get(dateKey) || 0,
      });

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }, [sleepLogs, period]);

  return (
    <Card className='bg-[#1a0F16] border border-[#36282F] rounded-2xl p-8'>
      <div className='flex justify-between mb-8'>
        <h2 className='text-xl sm:text-2xl font-bold text-white mb-8'>Sleep Duration</h2>

        <Select value={period} onValueChange={value => setPeriod(value as TimePeriod)}>
          <SelectTrigger className='w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10 focus:ring-2 focus:ring-primary-button/50'>
            <SelectValue placeholder='Select period' />
          </SelectTrigger>
          <SelectContent className='bg-[#1a0F16] border-[#36282F]'>
            <SelectGroup>
              <SelectLabel className='text-gray-400'>Time Period</SelectLabel>
              <SelectItem
                value='today'
                className='text-white hover:bg-white/10 focus:bg-white/10 data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer'
              >
                Today
              </SelectItem>
              <SelectItem
                value='7days'
                className='text-white hover:bg-white/10 focus:bg-white/10 data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer'
              >
                Last 7 Days
              </SelectItem>
              <SelectItem
                value='30days'
                className='text-white hover:bg-white/10 focus:bg-white/10 data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer'
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
            <linearGradient id='colorDuration' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#ff1493' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#ff1493' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#444' vertical={false} />
          <XAxis dataKey='day' stroke='#888' />
          <YAxis
            dataKey='duration'
            stroke='#888'
            tickFormatter={value => `${Math.round(value / 60)}h`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a0F16',
              border: '1px solid #36282F',
              color: 'white',
            }}
            formatter={(value: number) => `${Math.round(value / 60)}h ${value % 60}m`}
          />
          <Area
            type='monotone'
            dataKey='duration'
            stroke='#ff1493'
            strokeWidth={3}
            fillOpacity={1}
            fill='url(#colorDuration)'
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

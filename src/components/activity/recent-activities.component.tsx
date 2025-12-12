import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { subDays, startOfDay } from 'date-fns';
import { getIntensityColor, getIntensityIcon, formatTime } from '@/utils/activity-logs.utils';
import type { ActivityLog } from '@/types/activity.types';

type TimePeriod = 'today' | '7days' | '30days';

interface RecentActivitiesProps {
  logs: ActivityLog[];
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const RecentActivitiesSkeleton = () => (
  <div className='space-y-4'>
    {[...Array<number>(3)].map((_, i) => (
      <div key={i} className='bg-white/5 rounded-xl p-4 animate-pulse'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-white/10 rounded-xl shrink-0'></div>
          <div className='flex-1 min-w-0'>
            <div className='h-4 bg-white/10 rounded mb-2 w-1/2'></div>
            <div className='h-3 bg-white/10 rounded w-1/3'></div>
          </div>
          <div className='text-right shrink-0'>
            <div className='h-4 bg-white/10 rounded mb-2 w-16'></div>
            <div className='h-3 bg-white/10 rounded w-12'></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const RecentActivities = ({ logs, onDelete, isLoading = false }: RecentActivitiesProps) => {
  const [period, setPeriod] = useState<TimePeriod>('7days');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
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

    return logs
      .filter(log => {
        const logDate = new Date(log.completedAt);
        return logDate >= startDate && logDate <= now;
      })
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [logs, period]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Failed to delete activity:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className='bg-[#1a0F16] border border-[#36282F] rounded-2xl p-8 h-full flex flex-col max-h-[463px]'>
      <h3 className='text-xl sm:text-2xl font-bold text-white mb-6'>Recent Activities</h3>

      <div className='flex-1 overflow-hidden flex flex-col'>
        {isLoading ? (
          <div className='flex-1 min-h-0'>
            <RecentActivitiesSkeleton />
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto space-y-4 min-h-0 pr-2 scrollbar-thin scrollbar-container'>
            {filteredLogs.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-gray-500 text-sm'>No activities logged yet</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className={`bg-linear-to-br ${getIntensityColor(log.intensity)} border rounded-xl p-4 transition-all duration-300 group shrink-0`}
                >
                  <div className='flex items-center justify-between gap-2 sm:gap-3'>
                    <div className='flex items-center gap-2 sm:gap-3 min-w-0 flex-1'>
                      <div className='p-2 sm:p-2.5 bg-white/10 rounded-xl shrink-0'>
                        {getIntensityIcon(log.intensity)}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='text-white font-bold text-sm sm:text-base truncate'>
                          {log.activityType}
                        </div>
                        <div className='text-xs text-gray-400 truncate'>
                          {getRelativeTime(log.completedAt)} • {formatTime(log.completedAt)}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
                      <div className='text-right shrink-0'>
                        <p className='font-bold text-white text-sm sm:text-lg leading-tight'>
                          {log.durationMinutes} min
                        </p>
                        <p className='text-xs text-gray-400'>{log.intensity}</p>
                      </div>
                      <button
                        onClick={() => {
                          void handleDelete(log.id).catch(console.error);
                        }}
                        disabled={isDeleting === log.id}
                        className='opacity-0 group-hover:opacity-100 p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-400 hover:text-red-300 disabled:opacity-50 shrink-0'
                      >
                        <Trash2 size={14} className='sm:w-4 sm:h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className='flex justify-center gap-4 mt-6 flex-nowrap'>
        <button
          onClick={() => setPeriod('today')}
          className={`px-6 py-3 text-base rounded-xl font-semibold transition-all ${
            period === 'today'
              ? 'bg-[#d98a9d] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setPeriod('7days')}
          className={`px-6 py-3 text-base rounded-xl font-semibold transition-all ${
            period === '7days'
              ? 'bg-[#d98a9d] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setPeriod('30days')}
          className={`px-6 py-3 text-base rounded-xl font-semibold transition-all ${
            period === '30days'
              ? 'bg-[#d98a9d] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          30 Days
        </button>
      </div>
    </div>
  );
};

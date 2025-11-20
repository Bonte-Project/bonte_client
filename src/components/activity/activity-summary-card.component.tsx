import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { formatTime } from '@/utils/activity-logs.utils';
import type { ActivityLog } from '@/types/activity.types';

interface ActivitySummaryCardProps {
  logs: ActivityLog[];
  isLoading?: boolean;
}

const ActivitySummaryCardSkeleton = () => (
  <div className='w-full rounded-xl border border-white/10 bg-[#160C11] p-6 sm:p-8 shadow-lg backdrop-blur-md mb-6 animate-pulse'>
    <div className='h-7 sm:h-8 bg-white/10 rounded mb-6 w-1/3'></div>
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
      {[...Array<number>(3)].map((_, i) => (
        <div
          key={i}
          className='flex flex-col items-center justify-center rounded-lg bg-[#181114] p-4 text-center'
        >
          <div className='h-4 bg-white/10 rounded mb-3 w-2/3'></div>
          <div className='h-8 sm:h-10 bg-white/10 rounded w-full'></div>
        </div>
      ))}
    </div>
  </div>
);

export const ActivitySummaryCard = ({ logs, isLoading = false }: ActivitySummaryCardProps) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const todaysLogs = logs.filter(log => {
    const logDate = new Date(log.completedAt);
    return isWithinInterval(logDate, { start: todayStart, end: todayEnd });
  });

  const totalDuration = todaysLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const numberOfActivities = todaysLogs.length;

  const sortedLogs = [...todaysLogs].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const firstActivity = sortedLogs[0];
  const lastActivity = sortedLogs[sortedLogs.length - 1];

  if (isLoading) {
    return <ActivitySummaryCardSkeleton />;
  }

  return (
    <div className='w-full rounded-xl border border-white/10 bg-[#160C11] p-6 sm:p-8 shadow-lg backdrop-blur-md mb-6'>
      <h2 className='text-xl sm:text-2xl font-bold text-white mb-6'>Today's Activity Summary</h2>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        <div className='flex flex-col items-center justify-center rounded-lg bg-[#181114] p-4 text-center'>
          <p className='text-xs sm:text-sm font-medium text-gray-400'>Total Duration</p>
          <p className='mt-2 text-2xl sm:text-3xl font-black text-white'>
            {totalDuration}{' '}
            <span className='text-lg sm:text-xl font-medium text-gray-400'>min</span>
          </p>
        </div>
        <div className='flex flex-col items-center justify-center rounded-lg bg-[#181114] p-4 text-center'>
          <p className='text-xs sm:text-sm font-medium text-gray-400'>First & Last Activity</p>
          {firstActivity && lastActivity ? (
            <p className='mt-2 text-lg sm:text-xl font-black text-[#d98a9d]'>
              {formatTime(firstActivity.completedAt)} - {formatTime(lastActivity.completedAt)}
            </p>
          ) : (
            <p className='mt-2 text-lg sm:text-xl font-black text-gray-500'>No activities</p>
          )}
        </div>
        <div className='flex flex-col items-center justify-center rounded-lg bg-[#181114] p-4 text-center'>
          <p className='text-xs sm:text-sm font-medium text-gray-400'>Number of Activities</p>
          <p className='mt-2 text-2xl sm:text-3xl font-black text-white'>{numberOfActivities}</p>
        </div>
      </div>
    </div>
  );
};

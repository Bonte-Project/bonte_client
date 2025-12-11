import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useActivityLogsStore } from '@/store/activity-logs.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { AddActivityModal } from './add-activity-modal.component';
import { ActivitySummaryCard } from './activity-summary-card.component';
import { ActivityChart } from './activity-chart.component';
import { RecentActivities } from './recent-activities.component';
import type { CreateActivityLogRequest } from '@/types/activity.types';

export const ActivityTrackerSummary = () => {
  const { logs, isLoading, error, createActivityLog, getActivityLogs, deleteActivityLog } =
    useActivityLogsStore();
  const { success, error: toastError } = useCustomToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    void getActivityLogs().catch(console.error);
  }, [getActivityLogs]);

  const handleAddActivity = async (activity: CreateActivityLogRequest) => {
    try {
      await createActivityLog(activity);
      success('Activity Logged Successfully', {
        description: 'Your activity has been added to the tracker',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log activity';
      toastError('Error', {
        description: errorMessage,
      });
      throw err;
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivityLog(id);
      success('Activity Deleted', {
        description: 'Your activity has been removed',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
      toastError('Error', {
        description: errorMessage,
      });
      throw err;
    }
  };

  return (
    <div className='bg-[#1e1416] min-h-screen p-6 sm:p-8'>
      <div className='w-full'>
        {/* Header Section */}
        <div className='flex flex-col items-center justify-center text-center mb-12'>
          <div className='w-16 h-16 bg-[#d98a9d] rounded-full flex items-center justify-center mb-4'>
            <svg className='w-8 h-8 text-white' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 0 0 7.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z' />
            </svg>
          </div>
          <h1 className='text-3xl sm:text-4xl font-black text-white'>Activity Tracker</h1>
          <p className='mt-2 text-gray-400 text-sm sm:text-base max-w-2xl'>
            Log your workouts, track your progress, and get insights to optimize your fitness
            journey.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 sm:p-4 rounded-lg mb-6'>
            {error}
          </div>
        )}
        {/* Activity Summary */}
        <ActivitySummaryCard logs={logs} isLoading={isLoading} />
        {/* Log Activity Section */}
        <div className='bg-[#1a0F16] border border-[#36282F] rounded-2xl p-6 sm:p-8 mb-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <h3 className='text-xl sm:text-2xl font-bold text-white'>Log Activity</h3>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
              className='flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#d98a9d] text-white rounded-lg font-medium text-sm sm:text-base shadow-lg shadow-[#d98a9d]/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#d98a9d]/50 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto justify-center sm:justify-start'
            >
              <Plus size={18} />
              Add Activity
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className='flex items-center justify-center py-24'>
            <div className='flex flex-col items-center gap-4'>
              <Loader2 className='w-12 h-12 sm:w-16 sm:h-16 text-[#d98a9d] animate-spin' />
              <p className='text-gray-400 text-sm sm:text-base'>Loading your activities...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chart and Recent Activities Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2'>
                <ActivityChart logs={logs} isLoading={isLoading} />
              </div>
              <div className='lg:col-span-1'>
                <RecentActivities
                  logs={logs}
                  onDelete={handleDeleteActivity}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </>
        )}

        {/* Add Activity Modal */}
        <AddActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddActivity}
        />
      </div>
    </div>
  );
};

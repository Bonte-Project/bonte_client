import { BedDouble } from 'lucide-react';
import { AddSleepLog } from './add-sleep-log.component';
import { SleepDurationChart } from './sleep-duration-chart.component';
import { SleepLogsList } from './sleep-logs-list.component';
import { SleepQualityChart } from './sleep-quality-chart.component';

export const SleepLogs = () => {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center justify-center text-center mb-12'>
        <div className='mb-2'>
          <BedDouble className='w-14 h-14 sm:w-16 sm:h-16 mx-auto opacity-90 text-[#d98a9d]' />
        </div>
        <h1 className='text-3xl sm:text-4xl font-black text-white'>Sleep Tracker</h1>
        <p className='mt-2 text-gray-400 text-sm sm:text-base max-w-2xl'>
          Your personalaized sleep management hub.
        </p>
      </div>
      <AddSleepLog />

      <SleepLogsList />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <SleepDurationChart />
        <SleepQualityChart />
      </div>
    </div>
  );
};

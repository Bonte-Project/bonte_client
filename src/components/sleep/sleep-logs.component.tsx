import { AddSleepLog } from './add-sleep-log.component';
import { SleepDurationChart } from './sleep-duration-chart.component';
import { SleepLogsList } from './sleep-logs-list.component';
import { SleepQualityChart } from './sleep-quality-chart.component';

export const SleepLogs = () => {
  return (
    <div className='space-y-6'>
      <AddSleepLog />

      <SleepLogsList />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <SleepDurationChart />
        <SleepQualityChart />
      </div>
    </div>
  );
};

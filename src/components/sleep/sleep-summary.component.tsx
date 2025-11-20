import { Card } from '../ui/card';

export const SleepSummary = () => {
  return (
    <Card className='bg-[#1a0F16] border-[#36282F] p-8 mb-6 flex-1'>
      <h2 className='text-xl sm:text-2xl font-bold text-white mb-8'>Last Night's Summary</h2>

      <div className='space-y-4 sm:space-y-6'>
        <div className='flex items-center justify-between'>
          <span className='text-gray-400 text-sm sm:text-base'>Total Duration</span>
          <div className='text-right'>
            <span className='text-2xl sm:text-3xl font-bold text-white'>7</span>
            <span className='text-lg sm:text-xl text-gray-400'>h </span>
            <span className='text-2xl sm:text-3xl font-bold text-white'>30</span>
            <span className='text-lg sm:text-xl text-gray-400'>m</span>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-gray-400 text-sm sm:text-base'>Sleep Quality</span>
          <div className='text-right'>
            <span className='text-3xl sm:text-4xl font-bold text-[#ff1493]'>8</span>
            <span className='text-lg sm:text-xl text-gray-400'>/10</span>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-gray-400 text-sm sm:text-base'>Bedtime</span>
          <span className='text-lg sm:text-xl font-semibold text-white'>
            {/* {formatTime(lastLog.startTime)} */}
            11:15 PM
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-gray-400 text-sm sm:text-base'>Wake Up</span>
          <span className='text-lg sm:text-xl font-semibold text-white'>
            {/* {formatTime(lastLog.endTime)} */}
            6:45 AM
          </span>
        </div>
      </div>
    </Card>
  );
};

import { Activity, BedDouble, Salad } from 'lucide-react';

export const AuthFeaturesPanel = () => {
  return (
    <div className='hidden flex-col items-start justify-center text-white lg:flex'>
      <h2 className='text-6xl font-black leading-tight tracking-tight'>
        Your Health,
        <br />
        Elevated.
      </h2>
      <p className='mt-4 max-w-md text-lg text-gray-300'>
        Join Bonté to unlock a suite of tools designed to help you reach your peak performance and
        wellness goals.
      </p>
      <ul className='mt-12 space-y-8'>
        <li className='flex items-start gap-4'>
          <div className='flex h-12 w-12  items-center justify-center rounded-full bg-[#D98A9D]/10 text-[#D98A9D]'>
            <BedDouble size={24} />
          </div>
          <div>
            <h3 className='text-lg font-bold'>Sleep Tracking</h3>
            <p className='text-gray-400'>
              Log every sleep to monitor your tendency and analyse your data.
            </p>
          </div>
        </li>
        <li className='flex items-start gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#D98A9D]/10 text-[#D98A9D]'>
            <Activity size={24} />
          </div>
          <div>
            <h3 className='text-lg font-bold'>Activity Tracking</h3>
            <p className='text-gray-400'>
              Never miss an activity, in our app you can easily track it and receive AI analytics.
            </p>
          </div>
        </li>
        <li className='flex items-start gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#D98A9D]/10 text-[#D98A9D]'>
            <Salad size={24} />
          </div>
          <div>
            <h3 className='text-lg font-bold'>Nutrition Loging</h3>
            <p className='text-gray-400'>
              Track every bite. Fuel your goals. Our nutrition logging keeps you on the path to
              wellness.
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
};

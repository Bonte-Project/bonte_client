import { Droplet, Star, Zap } from 'lucide-react';

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
            <Zap size={24} />
          </div>
          <div>
            <h3 className='text-lg font-bold'>?Strength Tracking?</h3>
            <p className='text-gray-400'>
              Log every set and rep to monitor your progress and crush your personal records.
            </p>
          </div>
        </li>
        <li className='flex items-start gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#D98A9D]/10 text-[#D98A9D]'>
            <Droplet size={24} />
          </div>
          <div>
            <h3 className='text-lg font-bold'>?Hydration Reminders?</h3>
            <p className='text-gray-400'>
              Never miss a sip with intelligent reminders that keep you perfectly hydrated all day.
            </p>
          </div>
        </li>
        <li className='flex items-start gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#D98A9D]/10 text-[#D98A9D]'>
            <Star size={24} />
          </div>
          <div>
            <h3 className='text-lg font-bold'>?Personal Achievements?</h3>
            <p className='text-gray-400'>
              Stay motivated by unlocking milestones and celebrating your consistent effort.
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
};

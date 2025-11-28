import { useState } from 'react';
import { Edit2, Zap, Moon, Activity, MessageSquare, Crown, ArrowRight } from 'lucide-react';
import { ProfileEditModal } from './profile-edit-modal.component';
import { useAuthStore } from '@/store/auth.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import type { User } from '@/types/auth.types';
import { Link } from '@tanstack/react-router';

interface ProfileComponentProps {
  user?: User;
  onProfileUpdate?: (updatedUser: User) => void;
}

export const ProfileComponent = ({ user, onProfileUpdate }: ProfileComponentProps) => {
  const authUser = useAuthStore(state => state.user);
  const { success } = useCustomToast();

  const currentUser = user || authUser;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleProfileUpdate = (updatedUser: User) => {
    onProfileUpdate?.(updatedUser);
    setIsEditModalOpen(false);
    success('Profile Updated', {
      description: 'Your profile has been updated successfully',
    });
  };

  if (!currentUser) {
    return (
      <div className='relative min-h-screen w-full overflow-hidden bg-[#1e1416]'>
        <div className='absolute inset-0 z-0'>
          <div className='absolute -top-1/4 -right-1/4 h-[150%] w-[150%] origin-bottom-left -skew-y-12 transform bg-linear-to-br from-[#E9D5FF]/5 via-[#D98A9D]/10 to-[#D98A9D]/10'></div>
        </div>
        <main className='relative z-10 flex min-h-screen w-full items-center justify-center px-4'>
          <div className='text-center'>
            <p className='text-gray-400'>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-[#1e1416]'>
      {/* Background gradient */}
      <div className='absolute inset-0 z-0'>
        <div className='absolute -top-1/4 -right-1/4 h-[150%] w-[150%] origin-bottom-left -skew-y-12 transform bg-linear-to-br from-[#E9D5FF]/5 via-[#D98A9D]/10 to-[#D98A9D]/10'></div>
      </div>

      <main className='relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
        {/* Profile Header Card */}
        <div className='mb-8 rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-8 shadow-2xl shadow-[#D98A9D]/5 lg:p-10'>
          <div className='flex flex-col items-center gap-6 lg:flex-row lg:justify-between lg:items-start'>
            <div className='flex flex-col items-center gap-4 lg:flex-row lg:gap-6'>
              <div className='relative'>
                <img
                  alt='User Avatar'
                  className='h-24 w-24 rounded-full border-4 border-[#D98A9D]/30 object-cover shadow-lg'
                  src={currentUser.avatarUrl}
                />
                {currentUser.isPremium && (
                  <div className='absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#D98A9D] shadow-lg'>
                    <Crown size={16} className='text-white' />
                  </div>
                )}
              </div>
              <div className='text-center lg:text-left'>
                <h1 className='text-3xl font-black leading-tight tracking-tight text-white'>
                  {currentUser.fullName}
                </h1>
                <span className='mt-2 inline-block rounded-full bg-[#D98A9D]/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#D98A9D] border border-[#D98A9D]/30'>
                  {currentUser.isPremium ? 'Premium User' : 'Regular User'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className='flex items-center gap-2 rounded-lg bg-[#D98A9D] px-6 py-3 text-base font-bold text-white transition-all duration-300 border border-[#D98A9D]/30 hover:bg-[#c87b8f] hover:border-[#D98A9D]/50 focus:outline-none focus:ring-2 focus:ring-[#D98A9D]/50'
              type='button'
            >
              <Edit2 size={20} />
              Edit Profile
            </button>
          </div>

          {/* Profile Stats */}
          <div className='mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8'>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-400'>Age</p>
              <p className='mt-3 text-3xl font-black text-white'>{currentUser.age}</p>
            </div>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-400'>Height</p>
              <p className='mt-3 text-3xl font-black text-white'>
                {currentUser.height}
                <span className='text-lg font-normal text-gray-400'>cm</span>
              </p>
            </div>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-400'>Weight</p>
              <p className='mt-3 text-3xl font-black text-white'>
                {currentUser.weight}
                <span className='text-lg font-normal text-gray-400'>kg</span>
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid gap-6 lg:grid-cols-3 mb-8'>
          {/* Nutrition */}
          <div className='group relative rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-8 shadow-lg transition-all duration-300 hover:border-[#D98A9D]/30 hover:shadow-xl hover:shadow-[#D98A9D]/10'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#D98A9D]/10 text-[#D98A9D] mb-4'>
                  <Zap size={24} />
                </div>
                <h3 className='text-lg font-bold text-white'>Nutrition</h3>
                <p className='mt-2 text-sm text-gray-400'>
                  Track your meals and monitor nutritional intake
                </p>
              </div>
            </div>
            <Link to='/nutrition'>
              <button
                type='button'
                className='mt-6 w-full transform rounded-lg bg-[#D98A9D] px-4 py-3 text-sm font-bold text-white border border-[#D98A9D]/30 transition-all duration-300 hover:bg-[#c87b8f]/70 hover:scale-[1.02]  flex items-center justify-center gap-2'
              >
                Open Nutrition <ArrowRight size={18} />
              </button>
            </Link>
          </div>

          {/* Sleep */}
          <div className='group relative rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-8 shadow-lg transition-all duration-300 hover:border-[#D98A9D]/30 hover:shadow-xl hover:shadow-[#D98A9D]/10'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#D98A9D]/10 text-[#D98A9D] mb-4'>
                  <Moon size={24} />
                </div>
                <h3 className='text-lg font-bold text-white'>Sleep</h3>
                <p className='mt-2 text-sm text-gray-400'>
                  Monitor sleep patterns and improve rest quality
                </p>
              </div>
            </div>
            <Link to='/sleep'>
              <button
                type='button'
                className='mt-6 w-full transform rounded-lg bg-[#D98A9D] px-4 py-3 text-sm font-bold text-white border border-[#D98A9D]/30 transition-all duration-300 hover:bg-[#c87b8f]/70 hover:scale-[1.02]  flex items-center justify-center gap-2'
              >
                Open Sleep <ArrowRight size={18} />
              </button>
            </Link>
          </div>

          {/* Activity */}
          <div className='group relative rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-8 shadow-lg transition-all duration-300 hover:border-[#D98A9D]/30 hover:shadow-xl hover:shadow-[#D98A9D]/10'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#D98A9D]/10 text-[#D98A9D] mb-4'>
                  <Activity size={24} />
                </div>
                <h3 className='text-lg font-bold text-white'>Activity</h3>
                <p className='mt-2 text-sm text-gray-400'>
                  Track your workouts and daily activity level tendency
                </p>
              </div>
            </div>
            <Link to='/activity'>
              <button
                type='button'
                className='mt-6 w-full transform rounded-lg bg-[#D98A9D] px-4 py-3 text-sm font-bold text-white border border-[#D98A9D]/30 transition-all duration-300 hover:bg-[#c87b8f]/70 hover:scale-[1.02]  flex items-center justify-center gap-2'
              >
                Open Activity <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* Trainer Communication */}
        <div className='mb-8 rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-8 shadow-lg lg:p-10'>
          <div className='flex items-start justify-between gap-6 lg:flex-row flex-col'>
            <div>
              <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-[#D98A9D]/10 text-[#D98A9D] mb-4'>
                <MessageSquare size={24} />
              </div>
              <h2 className='text-2xl font-black text-white'>Trainer Dashboard</h2>
              <p className='mt-2 text-gray-400'>
                Connect with your personal trainer for guidance and support
              </p>
            </div>
            <Link to='/'>
              <button
                disabled
                type='button'
                className='transform rounded-lg bg-[#D98A9D]/20 px-8 py-3 text-base font-bold text-[#D98A9D] border border-[#D98A9D]/30 transition-all duration-300 hover:bg-[#D98A9D]/30 opacity-60 cursor-not-allowed flex items-center gap-2 whitespace-nowrap'
              >
                Open Chat <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* Premium Section */}
        <div className='relative overflow-hidden rounded-2xl border border-[#D98A9D]/30 bg-linear-to-br from-[#D98A9D]/10 to-[#D98A9D]/5 backdrop-blur-md p-8 shadow-lg lg:p-10'>
          <div className='absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#D98A9D]/5 blur-3xl'></div>
          <div className='relative z-10'>
            <div className='flex items-center gap-3 mb-3'>
              <Crown size={24} className='text-[#D98A9D]' />
              <span className='inline-block rounded-full bg-[#D98A9D]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#D98A9D]'>
                Premium
              </span>
            </div>
            <h2 className='text-3xl font-black leading-tight tracking-tight text-white'>
              Unlock Your Full Potential
            </h2>
            <p className='mt-3 max-w-2xl text-gray-300'>
              Upgrade to Premium and unlock exclusive features like advanced analytics, personalized
              training plans, and priority support from our team.
            </p>
            <button
              disabled
              type='button'
              className='mt-6 transform rounded-lg bg-[#D98A9D] px-8 py-3 text-base font-bold text-white shadow-lg shadow-[#D98A9D]/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#D98A9D]/50 disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2'
            >
              Unlock Premium <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {currentUser && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          user={currentUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

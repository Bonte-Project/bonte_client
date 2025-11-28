import { useState, useEffect } from 'react';
import { Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useUserStore } from '@/store/user.store';
import type { User } from '@/types/auth.types';

interface PublicProfileComponentProps {
  id: string;
}

export const PublicProfileComponent = ({ id }: PublicProfileComponentProps) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getUserById } = useUserStore();

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const loadedUser = await getUserById(id);
        if (!loadedUser) {
          setError('User not found');
        } else {
          setCurrentUser(loadedUser);
        }
      } catch {
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, [id, getUserById]);

  if (isLoading) {
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

  if (error || !currentUser) {
    return (
      <div className='relative min-h-screen w-full overflow-hidden bg-[#1e1416]'>
        <div className='absolute inset-0 z-0'>
          <div className='absolute -top-1/4 -right-1/4 h-[150%] w-[150%] origin-bottom-left -skew-y-12 transform bg-linear-to-br from-[#E9D5FF]/5 via-[#D98A9D]/10 to-[#D98A9D]/10'></div>
        </div>
        <main className='relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
          <button
            onClick={() => navigate({ to: '/' })}
            className='flex items-center gap-2 text-[#D98A9D] hover:text-[#c87b8f] transition-colors mb-8'
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <div className='text-center'>
            <p className='text-red-400 text-lg font-semibold'>{error || 'User not found'}</p>
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
        <button
          onClick={() => navigate({ to: '/' })}
          className='flex items-center gap-2 text-[#D98A9D] hover:text-[#c87b8f] transition-colors mb-8'
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        {/* Profile Header Card */}
        <div className='mb-8 rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-8 shadow-2xl shadow-[#D98A9D]/5 lg:p-10'>
          <div className='flex flex-col items-center gap-6 lg:flex-row lg:gap-8'>
            <div className='relative'>
              <img
                alt='User Avatar'
                className='h-28 w-28 rounded-full border-4 border-[#D98A9D]/30 object-cover shadow-lg'
                src={currentUser.avatarUrl}
              />
              {currentUser.isPremium && (
                <div className='absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#D98A9D] shadow-lg'>
                  <Crown size={20} className='text-white' />
                </div>
              )}
            </div>

            <div className='text-center lg:text-left lg:flex-1'>
              <h1 className='text-4xl font-black leading-tight tracking-tight text-white'>
                {currentUser.fullName}
              </h1>
              <div className='mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-3 justify-center lg:justify-start'>
                <span className='inline-block rounded-full bg-[#D98A9D]/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#D98A9D] border border-[#D98A9D]/30'>
                  {currentUser.isPremium ? 'Premium Member' : 'Member'}
                </span>
                <span className='text-sm text-gray-400'>
                  Joined{' '}
                  {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
              <p className='mt-4 text-gray-300 max-w-2xl'>
                {currentUser.role === 'trainer'
                  ? 'Certified fitness trainer dedicated to helping others achieve their goals'
                  : 'Committed to achieving personal fitness goals'}
              </p>
            </div>
          </div>

          {/* Profile Stats Grid */}
          <div className='mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-10 sm:grid-cols-3 lg:grid-cols-4'>
            <div className='rounded-xl bg-linear-to-br from-[#D98A9D]/10 to-[#D98A9D]/5 border border-[#D98A9D]/20 p-5 text-center'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Age</p>
              <p className='mt-4 text-3xl font-black text-white'>{currentUser.age}</p>
              <p className='text-xs text-gray-500 mt-1'>years</p>
            </div>

            <div className='rounded-xl bg-linear-to-br from-[#D98A9D]/10 to-[#D98A9D]/5 border border-[#D98A9D]/20 p-5 text-center'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Height</p>
              <p className='mt-4 text-3xl font-black text-white'>{currentUser.height}</p>
              <p className='text-xs text-gray-500 mt-1'>cm</p>
            </div>

            <div className='rounded-xl bg-linear-to-br from-[#D98A9D]/10 to-[#D98A9D]/5 border border-[#D98A9D]/20 p-5 text-center'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Weight</p>
              <p className='mt-4 text-3xl font-black text-white'>{currentUser.weight}</p>
              <p className='text-xs text-gray-500 mt-1'>kg</p>
            </div>

            <div className='rounded-xl bg-linear-to-br from-[#D98A9D]/10 to-[#D98A9D]/5 border border-[#D98A9D]/20 p-5 text-center'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>BMI</p>
              <p className='mt-4 text-3xl font-black text-[#D98A9D]'>
                {(currentUser.weight / (currentUser.height / 100) ** 2).toFixed(1)}
              </p>
              <p className='text-xs text-gray-500 mt-1'>kg/m²</p>
            </div>
          </div>
        </div>

        {/* Verification & Status */}
        <div className='grid gap-6 lg:grid-cols-2 mb-8'>
          {/* Email Status */}
          <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6 lg:p-8'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-lg font-bold text-white'>Email Status</h3>
                <p className='mt-2 text-sm text-gray-400'>Account verification information</p>
              </div>
              <div
                className={`flex items-center justify-center h-10 w-10 rounded-full ${
                  currentUser.isEmailVerified ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-full ${
                    currentUser.isEmailVerified ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                ></div>
              </div>
            </div>
            <div className='mt-6 space-y-3'>
              <div className='flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5'>
                <span className='text-sm text-gray-400'>Email</span>
                <span className='text-sm font-medium text-white truncate ml-2'>
                  {currentUser.email}
                </span>
              </div>
              <div className='flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5'>
                <span className='text-sm text-gray-400'>Verification</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${
                    currentUser.isEmailVerified ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {currentUser.isEmailVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6 lg:p-8'>
            <h3 className='text-lg font-bold text-white mb-2'>Account Information</h3>
            <p className='text-sm text-gray-400 mb-6'>User details and membership</p>

            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5'>
                <span className='text-sm text-gray-400'>Account Type</span>
                <span className='text-sm font-bold text-[#D98A9D] uppercase tracking-wide'>
                  {currentUser.role}
                </span>
              </div>
              <div className='flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5'>
                <span className='text-sm text-gray-400'>Membership</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${
                    currentUser.isPremium ? 'text-[#D98A9D]' : 'text-gray-400'
                  }`}
                >
                  {currentUser.isPremium ? 'Premium' : 'Standard'}
                </span>
              </div>
              <div className='flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5'>
                <span className='text-sm text-gray-400'>Member Since</span>
                <span className='text-sm font-medium text-white'>
                  {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Section */}
        {!currentUser.isPremium && (
          <div className='relative overflow-hidden rounded-2xl border border-[#D98A9D]/30 bg-linear-to-br from-[#D98A9D]/10 to-[#D98A9D]/5 backdrop-blur-md p-8 shadow-lg lg:p-10'>
            <div className='absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#D98A9D]/5 blur-3xl'></div>
            <div className='absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-[#D98A9D]/5 blur-3xl'></div>
            <div className='relative z-10'>
              <div className='flex items-center gap-3 mb-3'>
                <Crown size={24} className='text-[#D98A9D]' />
                <span className='inline-block rounded-full bg-[#D98A9D]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#D98A9D]'>
                  Premium Available
                </span>
              </div>
              <h2 className='text-3xl font-black leading-tight tracking-tight text-white'>
                This User Has Premium Access
              </h2>
              <p className='mt-3 max-w-2xl text-gray-300'>
                They have unlocked exclusive features including advanced analytics, personalized
                training plans, and priority support from our team.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

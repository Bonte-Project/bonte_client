import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  UtensilsCrossed,
  Dumbbell,
  Settings,
  HelpCircle,
  Sparkles,
  AlarmClock,
} from 'lucide-react';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { useAuthStore } from '@/store/auth.store';
import { useTrainerStore } from '@/store/trainer.store';

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout, fetchMe } = useAuthStore();
  const { trainer } = useTrainerStore();
  const { success, error: toastError } = useCustomToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  const handleLogout = () => {
    try {
      logout();
      success('Logged Out Successfully', {
        description: 'See you next time!',
      });
      void navigate({ to: '/' });
      setMobileMenuOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      toastError('Logout Error', {
        description: errorMessage,
      });
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/trainers' },
    { id: 'trends', label: 'Trends', icon: TrendingUp, href: '/trends' },
    { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed, href: '/nutrition' },
    { id: 'activity', label: 'Activity', icon: Dumbbell, href: '/activity' },
    { id: 'sleep', label: 'Sleep', icon: AlarmClock, href: '/sleep' },
  ];

  const trainerNavItems = [
    { id: 'clients', label: 'Clients', icon: Dumbbell, href: '/trainer/clients' },
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/trainers' },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'trainer':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'user':
      default:
        return 'bg-[#D98A9D]/20 text-[#D98A9D] border-[#D98A9D]/30';
    }
  };

  const isTrainer = user?.role === 'trainer';

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className='fixed top-4 left-4 z-50 lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors'
        aria-label='Toggle menu'
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-[#181114] border-r border-white/10  transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className='flex h-full flex-col justify-between p-4'>
          {/* Top Section */}
          <div className='flex flex-col gap-4'>
            {/* User Section */}
            {user ? (
              <div className='flex flex-col gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                <Link to={isTrainer ? '/trainer-profile' : '/profile'}>
                  <div className='flex gap-3 items-center'>
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className='w-10 h-10 rounded-full object-cover border-2 border-[#D98A9D]/30 shrink-0'
                      />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-linear-to-br from-[#D98A9D] to-[#ec1380] flex items-center justify-center text-white font-bold text-lg shrink-0'>
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div className='flex flex-col min-w-0'>
                      <h1 className='text-white text-base font-medium leading-normal truncate'>
                        {user.fullName || 'Unknown User'}
                      </h1>
                      <p className='text-[#b99dab] text-sm font-normal leading-normal truncate'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </Link>
                {/* Role Badge and Premium Badge */}
                <div className='flex gap-2 flex-wrap'>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${getRoleBadgeColor(user.role)}`}
                  >
                    {user.role}
                  </span>

                  {/* Trainer Status Badge */}
                  {isTrainer && trainer && (
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border flex items-center gap-1 ${
                        trainer.isActive
                          ? 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30'
                          : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          trainer.isActive ? 'bg-[#4ade80]' : 'bg-[#ef4444]'
                        }`}
                      ></span>
                      {trainer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}

                  {user.isPremium && (
                    <span className='text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1'>
                      ⭐ Premium
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className='flex flex-col gap-3'>
                <Link to='/login'>
                  <Button
                    variant='outline'
                    className='w-full border-[#D98A9D] text-[#D98A9D] hover:bg-[#D98A9D]/10 hover:text-[#D98A9D]'
                    onClick={closeMobileMenu}
                  >
                    <Sparkles className='w-4 h-4 mr-2' />
                    Sign In
                  </Button>
                </Link>
                <Link to='/register'>
                  <Button
                    className='w-full bg-[#D98A9D] hover:bg-[#c87b8f] text-white'
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className='flex flex-col gap-1'>
              {/* Trainer-specific navigation */}
              {isTrainer && (
                <>
                  {trainerNavItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.id} to={item.href} onClick={closeMobileMenu}>
                        <Button
                          variant='ghost'
                          className='w-full justify-start text-white hover:bg-white/10 hover:text-[#D98A9D] transition-colors'
                        >
                          <Icon size={20} className='mr-3 text-[#D98A9D]' />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                  <div className='border-t border-white/10 my-2'></div>
                </>
              )}

              {/* Regular user navigation */}
              {!isTrainer &&
                navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id}>
                      {user ? (
                        <Link to={item.href} onClick={closeMobileMenu}>
                          <Button
                            variant='ghost'
                            className='w-full justify-start text-white hover:bg-white/10 hover:text-[#D98A9D] transition-colors'
                          >
                            <Icon size={20} className='mr-3 text-[#D98A9D]' />
                            {item.label}
                          </Button>
                        </Link>
                      ) : (
                        <div className='group relative'>
                          <Button
                            variant='ghost'
                            disabled
                            className='w-full justify-start text-white/50 cursor-not-allowed'
                          >
                            <Icon size={20} className='mr-3 text-[#D98A9D]/50' />
                            {item.label}
                          </Button>
                          {/* Tooltip */}
                          <div className='absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#D98A9D] text-white text-xs font-medium px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg'>
                            Sign in to access
                            <div className='absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#D98A9D]'></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className='flex flex-col gap-4'>
            {/* Log Workout Button - Only for regular users */}
            {/* {user && !isTrainer && (
              <Link to='/'>
                <Button
                  className='w-full bg-[#D98A9D] hover:bg-[#c87b8f] text-white'
                  onClick={closeMobileMenu}
                >
                  <Plus size={18} className='mr-2' />
                  Log Workout
                </Button>
              </Link>
            )} */}

            {/* Settings and Help Section */}
            <div className='flex flex-col gap-1 border-t border-white/10 pt-4'>
              {/* Settings - Only for authorized users */}
              {user && (
                <Link to='/'>
                  <Button
                    variant='ghost'
                    className='w-full justify-start text-white hover:bg-white/10 hover:text-[#D98A9D]'
                    onClick={closeMobileMenu}
                  >
                    <Settings size={20} className='mr-3 text-[#D98A9D]' />
                    Settings
                  </Button>
                </Link>
              )}

              {/* Help - Always visible */}
              <Button
                variant='ghost'
                className='w-full justify-start text-white hover:bg-white/10 hover:text-[#D98A9D]'
              >
                <HelpCircle size={20} className='mr-3 text-[#D98A9D]' />
                Help
              </Button>

              {/* Logout - Only for authorized users */}
              {user && (
                <Button
                  variant='ghost'
                  onClick={handleLogout}
                  className='w-full justify-start text-red-400 hover:bg-red-400/10 hover:text-red-500'
                >
                  <LogOut size={20} className='mr-3' />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-30 lg:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

// src\components\header.component.tsx
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
  Plus,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { useAuthStore } from '@/store/auth.store';

function Header() {
  const navigate = useNavigate();
  const { user, logout, fetchMe } = useAuthStore();
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
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'trends', label: 'Trends', icon: TrendingUp, href: '/trends' },
    { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed, href: '/nutrition' },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell, href: '/workouts' },
  ];

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

      {/* Sidebar - КЛЮЧЕВЫЕ ИЗМЕНЕНИЯ: h-screen overflow-y-auto fixed */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-[#181114] border-r border-white/10 overflow-y-auto transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className='flex h-full flex-col justify-between p-4'>
          {/* Top Section */}
          <div className='flex flex-col gap-4'>
            {/* User Section - Conditional Display */}
            {user ? (
              <div className='flex gap-3 items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'>
                <div className='w-10 h-10 rounded-full bg-linear-to-br from-[#D98A9D] to-[#ec1380] flex items-center justify-center text-white font-bold text-lg'>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                </div>
                <div className='flex flex-col min-w-0'>
                  <h1 className='text-white text-base font-medium leading-normal truncate'>
                    {user.fullName || 'Unknown User'}
                  </h1>
                  <p className='text-[#b99dab] text-sm font-normal leading-normal truncate'>
                    {user.email}
                  </p>
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
              {navItems.map(item => {
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
            {/* Log Workout Button - Only for authorized users */}
            {user && (
              <Link to='/'>
                <Button
                  className='w-full bg-[#D98A9D] hover:bg-[#c87b8f] text-white'
                  onClick={closeMobileMenu}
                >
                  <Plus size={18} className='mr-2' />
                  Log Workout
                </Button>
              </Link>
            )}

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
}

export { Header };

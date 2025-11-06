// src\components\login.component.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { FormValidator } from '@/utils/form-validator.utils';
import { Eye, EyeOff, Zap, Droplet, Star } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { success, error: toastError } = useCustomToast();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const toastShownRef = useRef(false);

  // Fixed: Only show toast in effect, don't set state
  useEffect(() => {
    if (error && !toastShownRef.current) {
      toastShownRef.current = true;
      toastError('Login Failed', {
        description: error,
      });

      return () => {
        toastShownRef.current = false;
      };
    }
  }, [error, toastError]);

  // Derive general error from store error
  const generalError = error || undefined;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    clearError();

    if (touched.has(field)) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set([...prev, field]));
    if (field === 'email') validateField('email', formData.email);
    if (field === 'password') validateField('password', formData.password);
  };

  const validateField = (field: string, value: string) => {
    let fieldError: string | undefined;

    if (field === 'email') {
      fieldError = FormValidator.validateEmail(value);
    } else if (field === 'password') {
      fieldError = FormValidator.validatePassword(value);
    }

    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = FormValidator.validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = FormValidator.validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fixed: Wrap async function to satisfy TypeScript
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    void (async () => {
      if (!validateForm()) {
        toastError('Validation Error', {
          description: 'Please check all fields and try again',
        });
        return;
      }

      console.log(
        'Login payload (JSON):',
        JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      );

      const successResult = await login({
        email: formData.email,
        password: formData.password,
      });

      if (successResult) {
        success('Logged In Successfully', {
          description: 'Redirecting to dashboard...',
        });
        setTimeout(() => void navigate({ to: '/' }), 1500);
      }
    })();
  };

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-[#1e1416]'>
      {/* Background gradient */}
      <div className='absolute inset-0 z-0'>
        <div className='absolute -top-1/4 -right-1/4 h-[150%] w-[150%] origin-bottom-left -skew-y-12 transform bg-linear-to-br from-[#E9D5FF]/5 via-[#D98A9D]/10 to-[#D98A9D]/10'></div>
      </div>

      <main className='relative z-10 flex min-h-screen w-full items-center justify-center p-4 lg:p-8'>
        <div className='grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2'>
          {/* Form Section */}
          <div className='flex flex-col justify-center'>
            <div className='bg-black/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-[#D98A9D]/5'>
              <div className='mb-8'>
                <h1 className='text-4xl font-black leading-tight tracking-tight text-white'>
                  Welcome Back to Bonté
                </h1>
                <p className='text-base font-normal leading-normal text-gray-400 mt-2'>
                  Sign in to continue your journey.
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Email Field */}
                <div className='flex flex-col'>
                  <label
                    htmlFor='email'
                    className='pb-2 text-base font-medium leading-normal text-white'
                  >
                    Email Address
                  </label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='you@example.com'
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    disabled={isLoading}
                    className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                      ${
                        errors.email && touched.has('email')
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                          : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {errors.email && touched.has('email') && (
                    <span className='text-xs text-red-400 mt-1'>{errors.email}</span>
                  )}
                </div>

                {/* Password Field */}
                <div className='flex flex-col'>
                  <div className='flex items-center justify-between pb-2'>
                    <label
                      htmlFor='password'
                      className='text-base font-medium leading-normal text-white'
                    >
                      Password
                    </label>
                    {/* TODO /forgot-password */}
                    <Link to='/'>
                      <Button
                        variant='link'
                        className='text-sm font-semibold text-[#D98A9D]/90 hover:text-[#D98A9D] p-0 h-auto'
                      >
                        Forgot password?
                      </Button>
                    </Link>
                  </div>
                  <div className='relative flex w-full items-stretch'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      disabled={isLoading}
                      className={`h-14 w-full flex-1 resize-none overflow-hidden rounded-l-lg border border-r-0 bg-[#141414] p-[15px] text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                        ${
                          errors.password && touched.has('password')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className='flex items-center justify-center rounded-r-lg border border-l-0 border-white/10 bg-[#141414] px-4 text-gray-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && touched.has('password') && (
                    <span className='text-xs text-red-400 mt-1'>{errors.password}</span>
                  )}
                </div>

                {/* General Error Message */}
                {generalError && (
                  <div className='p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 leading-relaxed'>
                    {generalError}
                  </div>
                )}

                {/* Login Button */}
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='w-full transform rounded-lg bg-[#D98A9D] py-4 text-base font-bold text-white shadow-lg shadow-[#D98A9D]/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#D98A9D]/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>

              {/* Divider */}
              <div className='flex items-center gap-3 my-6'>
                <div className='flex-1 h-px bg-white/10'></div>
                <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                  OR
                </span>
                <div className='flex-1 h-px bg-white/10'></div>
              </div>

              {/* Google Sign In Button */}
              <Button
                type='button'
                variant='outline'
                className='w-full border-white/10 text-white hover:bg-white/5 hover:text-[#D98A9D]'
                disabled={isLoading}
              >
                <svg
                  className='w-5 h-5 text-[#D98A9D] mr-2'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                  <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                  <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                  <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                </svg>
                Sign in with Google
              </Button>

              <p className='mt-8 text-center text-sm text-gray-400'>
                Don&apos;t have an account?{' '}
                <Link to='/register'>
                  <Button
                    variant='link'
                    className='text-[#D98A9D]/90 hover:text-[#D98A9D] p-0 h-auto font-semibold'
                  >
                    Sign Up
                  </Button>
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Features (hidden on mobile) */}
          <div className='hidden flex-col items-start justify-center text-white lg:flex'>
            <h2 className='text-6xl font-black leading-tight tracking-tight'>
              Your Health,
              <br />
              Elevated.
            </h2>
            <p className='mt-4 max-w-md text-lg text-gray-300'>
              Join Bonté to unlock a suite of tools designed to help you reach your peak performance
              and wellness goals.
            </p>
            <ul className='mt-12 space-y-8'>
              <li className='flex items-start gap-4'>
                <div className='flex h-12 w-12  items-center justify-center rounded-full bg-[#D98A9D]/10 text-[#D98A9D]'>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className='text-lg font-bold'>Strength Tracking</h3>
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
                  <h3 className='text-lg font-bold'>Hydration Reminders</h3>
                  <p className='text-gray-400'>
                    Never miss a sip with intelligent reminders that keep you perfectly hydrated all
                    day.
                  </p>
                </div>
              </li>
              <li className='flex items-start gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#D98A9D]/10 text-[#D98A9D]'>
                  <Star size={24} />
                </div>
                <div>
                  <h3 className='text-lg font-bold'>Personal Achievements</h3>
                  <p className='text-gray-400'>
                    Stay motivated by unlocking milestones and celebrating your consistent effort.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export { LoginForm };

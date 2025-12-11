import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { FormValidator } from '@/utils/form-validator.utils';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthFeaturesPanel } from './auth-features-panel';
import { AuthLayout } from '../layouts/auth.layout';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, loginWithGoogle } = useAuthStore();
  const { success, error: toastError, warning } = useCustomToast();
  const location = useLocation();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const toastShownRef = useRef(false);

  useEffect(() => {
    clearError();
  }, [location.pathname, clearError]);

  useEffect(() => {
    if (error && !toastShownRef.current) {
      toastShownRef.current = true;
      toastError('Login Failed', {
        description: error,
      });
    }

    if (!error) {
      toastShownRef.current = false;
    }
  }, [error, toastError]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    void (async () => {
      if (!validateForm()) {
        toastError('Validation Error', {
          description: 'Please check all fields and try again',
        });
        return;
      }

      const successResult = await login({
        email: formData.email,
        password: formData.password,
      });

      if (successResult) {
        success('Logged In Successfully', {
          description: 'Redirecting to dashboard...',
        });
        setTimeout(() => void navigate({ to: '/profile' }), 500);
      }
    })();
  };

  const handleGoogleSuccess = (credentialResponse: unknown) => {
    void (async () => {
      try {
        const response = credentialResponse as { credential?: string };
        const idToken = response?.credential;
        if (!idToken) {
          toastError('Google Authentication Failed', {
            description: 'No token received from Google',
          });
          return;
        }

        const accessToken = await loginWithGoogle(idToken);

        if (accessToken) {
          success('Login Successful!', {
            description: 'Welcome back to Bonté. Redirecting...',
          });
          setTimeout(() => void navigate({ to: '/profile' }), 500);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Google authentication failed';

        if (
          errorMessage.includes('Account not found') ||
          errorMessage.includes('Role is required')
        ) {
          toastError('Account Not Found', {
            description: 'No account linked with this Google email. Please register first.',
          });
          setTimeout(() => void navigate({ to: '/register' }), 2000);
        } else {
          toastError('Authentication Error', {
            description: errorMessage,
          });
        }
      }
    })();
  };

  const handleGoogleError = () => {
    warning('Google Authentication', {
      description: 'An error occurred during Google login. Please try again.',
    });
  };

  return (
    <AuthLayout>
      <div className='grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2'>
        {/* Form Section */}
        <div className='flex flex-col justify-center'>
          <div className='bg-[#181114] backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-[#D98A9D]/5'>
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
                          : 'border-white/10 focus:border-primary-button/80 focus:ring-primary-button/40'
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
                  <Link to='/forgot-password'>
                    <Button
                      variant='link'
                      className='text-sm font-semibold text-[#D98A9D]/90 hover:text-[#D98A9D] p-0 h-auto'
                    >
                      Forgot password?
                    </Button>
                  </Link>
                </div>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    disabled={isLoading}
                    className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] pr-12 text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
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
                    className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-white transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                className='w-full transform rounded-lg bg-primary-button py-5 text-base font-bold text-white shadow-lg shadow-primary-button/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-button/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
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

            {/* Google Sign-Up */}
            <div className='w-full flex justify-center'>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme='outline'
                shape='pill'
                locale='en'
                text='signin_with'
                width='100%'
                useOneTap
              />
            </div>

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
        <AuthFeaturesPanel />
      </div>
    </AuthLayout>
  );
};

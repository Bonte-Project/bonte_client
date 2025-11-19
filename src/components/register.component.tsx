import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { FormValidator } from '@/utils/form-validator.utils';
import { Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '@/types/auth.types';
import { GoogleLogin } from '@react-oauth/google';
import { AuthFeaturesPanel } from './auth-features-panel';
import { AuthLayout } from './layouts/auth.layout';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  general?: string;
}

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, loginWithGoogle } = useAuthStore();
  const { success, error: toastError, warning } = useCustomToast();
  const location = useLocation();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const toastShownRef = useRef(false);

  useEffect(() => {
    clearError();
  }, [location.pathname, clearError]);

  useEffect(() => {
    if (error && !toastShownRef.current) {
      toastShownRef.current = true;
      toastError('Registration Failed', {
        description: error,
      });
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
    if (field === 'fullName') validateField('fullName', formData.fullName);
    if (field === 'email') validateField('email', formData.email);
    if (field === 'password') validateField('password', formData.password);
    if (field === 'confirmPassword') validateField('confirmPassword', formData.confirmPassword);
  };

  const validateField = (field: string, value: string) => {
    let fieldError: string | undefined;

    if (field === 'fullName') {
      fieldError = FormValidator.validateFullName(value);
    } else if (field === 'email') {
      fieldError = FormValidator.validateEmail(value);
    } else if (field === 'password') {
      fieldError = FormValidator.validatePassword(value);
    } else if (field === 'confirmPassword') {
      fieldError = FormValidator.validatePasswordMatch(formData.password, value);
    }

    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fullNameError = FormValidator.validateFullName(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;

    const emailError = FormValidator.validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = FormValidator.validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = FormValidator.validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    if (!selectedRole) {
      newErrors.role = 'Please select a role';
    }

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

      const successResult = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      });

      if (successResult) {
        success('Account Created Successfully', {
          description: 'Check your email to verify your account',
        });
        void navigate({ to: '/verify-email' });
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

        if (!selectedRole) {
          toastError('Role Required', {
            description: 'Please select your role before signing in with Google',
          });
          return;
        }

        console.log('Google registration with role:', selectedRole);

        const accessToken = await loginWithGoogle(idToken, selectedRole);

        if (accessToken) {
          success('Registration Successful!', {
            description: 'Welcome to Bonté. Redirecting to dashboard...',
          });

          setTimeout(() => {
            void navigate({ to: '/' });
          }, 1500);
        }
      } catch (err) {
        console.error('Google auth error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Google authentication failed';
        toastError('Authentication Error', {
          description: errorMessage,
        });
      }
    })();
  };

  const handleGoogleError = () => {
    warning('Google Authentication', {
      description: 'An error occurred during Google sign-up. Please try again.',
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
                Create Your Bonté Account
              </h1>
              <p className='text-base font-normal leading-normal text-gray-400 mt-2'>
                Start your journey to a healthier you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Full Name Field */}
              <div className='flex flex-col'>
                <label
                  htmlFor='fullName'
                  className='pb-2 text-base font-medium leading-normal text-white'
                >
                  Full Name
                </label>
                <Input
                  id='fullName'
                  type='text'
                  placeholder='John Doe'
                  value={formData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  disabled={isLoading}
                  className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                      ${
                        errors.fullName && touched.has('fullName')
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                          : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.fullName && touched.has('fullName') && (
                  <span className='text-xs text-red-400 mt-1'>{errors.fullName}</span>
                )}
              </div>

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
                <label
                  htmlFor='password'
                  className='pb-2 text-base font-medium leading-normal text-white'
                >
                  Password
                </label>
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

              {/* Confirm Password Field */}
              <div className='flex flex-col'>
                <label
                  htmlFor='confirmPassword'
                  className='pb-2 text-base font-medium leading-normal text-white'
                >
                  Confirm Password
                </label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirm your password'
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    disabled={isLoading}
                    className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] pr-12 text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                        ${
                          errors.confirmPassword && touched.has('confirmPassword')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-white transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && touched.has('confirmPassword') && (
                  <span className='text-xs text-red-400 mt-1'>{errors.confirmPassword}</span>
                )}
              </div>

              {/* User Role Selection */}
              <div>
                <p className='text-base font-medium leading-normal text-white'>
                  How will you be using Bonté?
                </p>
                <div className='mt-3 flex flex-wrap gap-3'>
                  {(['user', 'trainer'] as const).map(role => (
                    <button
                      key={role}
                      type='button'
                      onClick={() => {
                        setSelectedRole(role);
                        setErrors(prev => ({ ...prev, role: undefined }));
                      }}
                      disabled={isLoading}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors
                          ${
                            selectedRole === role
                              ? 'bg-[#D98A9D]/20 border-[#D98A9D] text-white'
                              : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {role === 'user' ? 'User' : 'Trainer'}
                    </button>
                  ))}
                </div>
                {errors.role && (
                  <span className='text-xs text-red-400 mt-2 block'>{errors.role}</span>
                )}
              </div>

              {/* General Error Message */}
              {generalError && (
                <div className='p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 leading-relaxed'>
                  {generalError}
                </div>
              )}

              {/* Register Button */}
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full transform rounded-lg bg-primary-button py-5 text-base font-bold text-white shadow-lg shadow-primary-button/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-button/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
              >
                {isLoading ? 'Registering...' : 'Register'}
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
            <div className='w-full flex justify-center '>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme='outline'
                shape='pill'
                locale='en'
                text='signup_with'
                width='100%'
                useOneTap
              />
            </div>

            <p className='mt-8 text-center text-sm text-gray-400'>
              Already have an account?{' '}
              <Link to='/login'>
                <Button
                  variant='link'
                  className='text-[#D98A9D]/90 hover:text-[#D98A9D] p-0 h-auto font-semibold'
                >
                  Sign In
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

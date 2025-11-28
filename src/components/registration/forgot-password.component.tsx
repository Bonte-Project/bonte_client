import { Link, useNavigate } from '@tanstack/react-router';
import { AuthFeaturesPanel } from './auth-features-panel';
import { AuthLayout } from '../layouts/auth.layout';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { FormValidator } from '@/utils/form-validator.utils';
import { Eye, EyeOff } from 'lucide-react';

const STEPS = {
  EMAIL: 'email',
  CODE: 'code',
  PASSWORD: 'password',
  SUCCESS: 'success',
};

const STEP_CONFIG = {
  [STEPS.EMAIL]: {
    title: 'Forgot Your Password?',
    description: 'No problem. Enter your email to receive a reset code.',
    buttonText: 'Send Reset Code',
  },
  [STEPS.CODE]: {
    title: 'Enter Verification Code',
    description: 'We sent a 4-digit code to your email. Please enter it below.',
    buttonText: 'Verify Code',
  },
  [STEPS.PASSWORD]: {
    title: 'Set New Password',
    description: 'Choose a strong password to secure your account.',
    buttonText: 'Reset Password',
  },
  [STEPS.SUCCESS]: {
    title: 'Password Reset Successfully!',
    description: 'Your password has been updated. You can now log in with your new password.',
    buttonText: 'Go to Login',
  },
};

interface FormData {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  code?: string;
  password?: string;
  confirmPassword?: string;
}

type FormField = keyof FormData;

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const {
    sendResetEmail,
    verifyResetCode,
    resetPassword,
    isLoading,
    error,
    clearError,
    resetEmail,
    setResetEmail,
  } = useAuthStore();
  const { success, error: toastError } = useCustomToast();
  const toastShownRef = useRef(false);

  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    clearError();
  }, [currentStep, clearError]);

  useEffect(() => {
    if (error && !toastShownRef.current) {
      toastShownRef.current = true;
      toastError('Error', {
        description: error,
      });
    }

    if (!error) {
      toastShownRef.current = false;
    }
  }, [error, toastError]);

  const handleInputChange = (field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    clearError();

    if (touched.has(field)) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: FormField) => {
    setTouched(prev => new Set([...prev, field]));
    validateField(field, formData[field]);
  };

  const validateField = (field: FormField, value: string) => {
    let fieldError: string | undefined;

    switch (field) {
      case 'email':
        fieldError = FormValidator.validateEmail(value);
        break;
      case 'code':
        if (!value.trim()) {
          fieldError = 'Verification code is required';
        } else if (!/^\d{4}$/.test(value.trim())) {
          fieldError = 'Code must be exactly 4 digits';
        }
        break;
      case 'password':
        fieldError = FormValidator.validatePassword(value);
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          fieldError = 'Please confirm your password';
        } else if (value !== formData.password) {
          fieldError = 'Passwords do not match';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {};

    switch (currentStep) {
      case STEPS.EMAIL: {
        const emailError = FormValidator.validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;
        break;
      }
      case STEPS.CODE: {
        if (!formData.code.trim()) {
          newErrors.code = 'Verification code is required';
        } else if (!/^\d{4}$/.test(formData.code.trim())) {
          newErrors.code = 'Code must be exactly 4 digits';
        }
        break;
      }
      case STEPS.PASSWORD: {
        const passwordError = FormValidator.validatePassword(formData.password);
        if (passwordError) newErrors.password = passwordError;

        if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.confirmPassword !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    void (async () => {
      if (!validateStep()) {
        toastError('Validation Error', {
          description: 'Please check all fields and try again',
        });
        return;
      }

      switch (currentStep) {
        case STEPS.EMAIL: {
          const emailSuccess = await sendResetEmail(formData.email);
          if (emailSuccess) {
            success('Code Sent', {
              description: 'Please check your email for the verification code.',
            });
            setResetEmail(formData.email);
            setCurrentStep(STEPS.CODE);
          }
          break;
        }

        case STEPS.CODE: {
          const email = resetEmail || formData.email;
          const codeSuccess = await verifyResetCode(email, formData.code);
          if (codeSuccess) {
            success('Code Verified', {
              description: 'You can now set your new password.',
            });
            setCurrentStep(STEPS.PASSWORD);
          }
          break;
        }

        case STEPS.PASSWORD: {
          const email = resetEmail || formData.email;
          const passwordSuccess = await resetPassword(email, formData.password);
          if (passwordSuccess) {
            success('Password Reset Successfully', {
              description: 'You can now log in with your new password.',
            });
            setCurrentStep(STEPS.SUCCESS);
          }
          break;
        }

        case STEPS.SUCCESS:
          void navigate({ to: '/login' });
          break;
      }
    })();
  };

  const config = STEP_CONFIG[currentStep];

  return (
    <AuthLayout>
      <div className='grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2'>
        <div className='flex flex-col justify-center'>
          <div className='bg-[#181114] backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-[#D98A9D]/5'>
            <div className='mb-8'>
              <h1 className='text-4xl font-black leading-tight tracking-tight text-white'>
                {config.title}
              </h1>
              <p className='text-base font-normal leading-normal text-gray-400 mt-2'>
                {config.description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {currentStep === STEPS.EMAIL && (
                <>
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
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      disabled={isLoading}
                      placeholder='you@example.com'
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

                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full transform rounded-lg bg-[#D98A9D] py-5 text-base font-bold text-white shadow-lg shadow-[#D98A9D]/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#D98A9D]/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
                  >
                    {isLoading ? 'Sending...' : config.buttonText}
                  </Button>
                </>
              )}

              {currentStep === STEPS.CODE && (
                <>
                  <div className='flex flex-col'>
                    <label
                      htmlFor='code'
                      className='pb-2 text-base font-medium leading-normal text-white'
                    >
                      Verification Code
                    </label>
                    <Input
                      id='code'
                      type='text'
                      value={formData.code}
                      onChange={e => handleInputChange('code', e.target.value)}
                      onBlur={() => handleBlur('code')}
                      placeholder='0000'
                      maxLength={4}
                      disabled={isLoading}
                      className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                        ${
                          errors.code && touched.has('code')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {errors.code && touched.has('code') && (
                      <span className='text-xs text-red-400 mt-1'>{errors.code}</span>
                    )}
                  </div>

                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full transform rounded-lg bg-[#D98A9D] py-5 text-base font-bold text-white shadow-lg shadow-[#D98A9D]/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#D98A9D]/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
                  >
                    {isLoading ? 'Verifying...' : config.buttonText}
                  </Button>
                </>
              )}

              {currentStep === STEPS.PASSWORD && (
                <>
                  <div className='flex flex-col'>
                    <label
                      htmlFor='password'
                      className='pb-2 text-base font-medium leading-normal text-white'
                    >
                      New Password
                    </label>
                    <div className='relative'>
                      <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter your new password'
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
                        placeholder='Confirm your new password'
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

                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full transform rounded-lg bg-primary-button py-5 text-base font-bold text-white shadow-lg shadow-primary-button/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-button/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
                  >
                    {isLoading ? 'Resetting...' : config.buttonText}
                  </Button>
                </>
              )}

              {currentStep === STEPS.SUCCESS && (
                <Button
                  type='submit'
                  className='w-full transform rounded-lg bg-primary-button py-5 text-base font-bold text-white shadow-lg shadow-primary-button/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-button/50'
                >
                  {config.buttonText}
                </Button>
              )}
            </form>

            {currentStep !== STEPS.SUCCESS && (
              <p className='mt-8 text-center text-sm text-gray-400'>
                Remember your password?{' '}
                <Link to='/login'>
                  <Button
                    variant='link'
                    className='text-[#D98A9D]/90 hover:text-[#D98A9D] p-0 h-auto font-semibold'
                  >
                    Log In
                  </Button>
                </Link>
              </p>
            )}
          </div>
        </div>

        <AuthFeaturesPanel />
      </div>
    </AuthLayout>
  );
};

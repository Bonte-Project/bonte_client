import { Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { FormValidator } from '@/utils/form-validator.utils';
import { BedDouble, Activity, Salad } from 'lucide-react';
interface FormErrors {
  code?: string;
  general?: string;
}

export const VerifyEmailForm = () => {
  const { verifyEmail, isLoading, error, clearError, registeredEmail, setRegisteredEmailCode } =
    useAuthStore();
  const navigate = useNavigate();
  const { success, error: toastError } = useCustomToast();

  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<number>>(new Set());
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (error && !toastShownRef.current) {
      toastShownRef.current = true;
      toastError('Verification Failed', {
        description: error,
      });

      return () => {
        toastShownRef.current = false;
      };
    }
  }, [error, toastError]);

  const generalError = error || undefined;

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    setErrors(prev => ({ ...prev, code: undefined }));
    clearError();

    setTouched(prev => new Set([...prev, index]));

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('');

    if (digits.length === 4) {
      setCode(digits);
      inputRefs.current[3]?.focus();
      setTouched(new Set([0, 1, 2, 3]));
    }
  };

  const validateForm = (): boolean => {
    const codeString = code.join('');
    const codeError = FormValidator.verifyEmail(codeString);

    if (codeError) {
      setErrors({ code: codeError });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    void (async () => {
      if (!validateForm()) {
        toastError('Validation Error', {
          description: 'Please enter a valid 4-digit code',
        });
        return;
      }

      const codeString = code.join('');
      setRegisteredEmailCode(codeString);
      const successResult = await verifyEmail();

      if (successResult) {
        success('Email Verified Successfully', {
          description: 'Your account is now active. Redirecting...',
        });
        setTimeout(() => void navigate({ to: '/' }), 1500);
      }
    })();
  };

  const maskedEmail = registeredEmail
    ? registeredEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'your email';

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
            <div className='bg-[#181114] backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-[#D98A9D]/5'>
              <div className='mb-8'>
                <h1 className='text-4xl font-black leading-tight tracking-tight text-white'>
                  Verify Your Email
                </h1>
                <p className='text-base font-normal leading-normal text-gray-400 mt-2'>
                  We&apos;ve sent a 4-digit code to{' '}
                  <span className='text-[#D98A9D] font-semibold'>{maskedEmail}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Code Input Fields */}
                <div className='flex flex-col'>
                  <label className='pb-2 text-base font-medium leading-normal text-white'>
                    Verification Code
                  </label>
                  <div className='flex gap-3 justify-between'>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => {
                          inputRefs.current[index] = el;
                        }}
                        type='text'
                        inputMode='numeric'
                        maxLength={1}
                        value={digit}
                        onChange={e => handleCodeChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={isLoading}
                        className={`w-14 h-14 bg-[#141414] border rounded-lg text-center text-2xl font-bold text-white
                          focus:outline-0 transition-shadow duration-300 focus:ring-2
                          ${
                            errors.code && touched.has(index)
                              ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                              : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                    ))}
                  </div>
                  {errors.code && <span className='text-xs text-red-400 mt-1'>{errors.code}</span>}
                </div>

                {/* General Error Message */}
                {generalError && (
                  <div className='p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 leading-relaxed'>
                    {generalError}
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='w-full transform rounded-lg bg-[#D98A9D] py-4 text-base font-bold text-white shadow-lg shadow-[#D98A9D]/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#D98A9D]/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>

              <div className='text-center text-sm text-gray-400 mt-8'>
                <Link to='/register'>
                  <a className='font-semibold text-[#D98A9D]/90 transition-colors hover:text-[#D98A9D]'>
                    Back to Sign In
                  </a>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
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
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#D98A9D]/10 text-[#D98A9D]'>
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
                    Never miss an activity, in our app you can easily track it and receive AI
                    analytics.
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
                    Track every bite. Fuel your goals. Our nutrition logging keeps you on the path
                    to wellness.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

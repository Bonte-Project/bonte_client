import { useState, useEffect } from 'react';
import { X, Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormValidator } from '@/utils/form-validator.utils';
import { useUserStore } from '@/store/user.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import type { User } from '@/types/auth.types';
import type { UpdateUserRequest } from '@/types/user.types';
import { useAuthStore } from '@/store/auth.store';

const avatarUploadDisabled = true;

interface ProfileEditModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

interface FormErrors {
  fullName?: string;
  age?: string;
  height?: string;
  weight?: string;
  general?: string;
  newPassword?: string;
  confirmPassword?: string;
  subscription?: string;
}

interface FormDataPasswordChange {
  newPassword: string;
  confirmPassword: string;
}

interface FormDataSubscription {
  isPremium: boolean;
}

type TabType = 'personal' | 'subscription' | 'changePassword';

export const ProfileEditModal = ({ isOpen, user, onClose, onSave }: ProfileEditModalProps) => {
  const { updateUser, isLoading, error, clearError } = useUserStore();
  const { success, error: toastError } = useCustomToast();
  const { resetPassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [formData, setFormData] = useState<UpdateUserRequest>({
    fullName: user.fullName,
    age: user.age,
    height: user.height,
    weight: user.weight,
    avatarUrl: user.avatarUrl,
  });

  const [formDataPasswordChange, setFormDataPasswordChange] = useState<FormDataPasswordChange>({
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatarUrl);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [subscriptionErrors, setSubscriptionErrors] = useState<{ general?: string }>({});
  const [formDataSubscription, setFormDataSubscription] = useState<FormDataSubscription>({
    isPremium: user.isPremium,
  });
  useEffect(() => {
    clearError();
  }, [isOpen, clearError]);

  const handleInputChange = (field: keyof UpdateUserRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    clearError();

    if (touched.has(field)) {
      validateField(field, value);
    }
  };
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setErrors({});
    setSubscriptionErrors({});
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (!allowedFormats.includes(file.type)) {
        toastError('Invalid format', {
          description: 'Please upload JPG, PNG, GIF or WebP format',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toastError('File too large', {
          description: 'Maximum file size is 5MB',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setFormData(prev => ({ ...prev, avatarUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUrlChange = (url: string) => {
    setAvatarPreview(url);
    setFormData(prev => ({ ...prev, avatarUrl: url }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set([...prev, field]));
    validateField(
      field as keyof UpdateUserRequest,
      formData[field as keyof UpdateUserRequest] || ''
    );
  };

  const validateField = (field: keyof UpdateUserRequest, value: string | number) => {
    let fieldError: string | undefined;

    if (field === 'fullName') {
      fieldError = FormValidator.validateFullName(String(value));
    } else if (field === 'age') {
      const age = Number(value);
      if (!age) {
        fieldError = 'Age is required';
      } else if (age < 13 || age > 120) {
        fieldError = 'Age must be between 13 and 120';
      }
    } else if (field === 'height') {
      const height = Number(value);
      if (!height) {
        fieldError = 'Height is required';
      } else if (height < 50 || height > 300) {
        fieldError = 'Height must be between 50 and 300 cm';
      }
    } else if (field === 'weight') {
      const weight = Number(value);
      if (!weight) {
        fieldError = 'Weight is required';
      } else if (weight < 20 || weight > 500) {
        fieldError = 'Weight must be between 20 and 500 kg';
      }
    }
    setErrors(prev => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fullNameError = FormValidator.validateFullName(String(formData.fullName));
    if (fullNameError) newErrors.fullName = fullNameError;

    const age = Number(formData.age);
    if (!age || age < 13 || age > 120) {
      newErrors.age = 'Age must be between 13 and 120';
    }

    const height = Number(formData.height);
    if (!height || height < 50 || height > 300) {
      newErrors.height = 'Height must be between 50 and 300 cm';
    }

    const weight = Number(formData.weight);
    if (!weight || weight < 20 || weight > 500) {
      newErrors.weight = 'Weight must be between 20 and 500 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFieldChangePassword = (field: string, value: string) => {
    let fieldError: string | undefined;

    if (field === 'newPassword') {
      fieldError = FormValidator.validatePassword(String(value));
    } else if (field === 'confirmPassword') {
      fieldError = FormValidator.validatePasswordMatch(formDataPasswordChange.newPassword, value);
    }

    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const validateFormChangePassword = (): boolean => {
    const newErrors: FormErrors = {};

    const passwordError = FormValidator.validatePassword(formDataPasswordChange.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    const confirmPasswordError = FormValidator.validatePasswordMatch(
      formDataPasswordChange.newPassword,
      formDataPasswordChange.confirmPassword
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFormSubscription = (): boolean => {
    const newErrors: { general?: string } = {};

    // TODO

    setSubscriptionErrors(newErrors);
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (activeTab === 'personal' && !validateForm()) {
      return;
    }
    if (activeTab === 'changePassword' && !validateFormChangePassword()) {
      return;
    }
    if (activeTab === 'subscription' && !validateFormSubscription()) {
      return;
    }

    void (async () => {
      switch (activeTab) {
        case 'personal': {
          const success = await updateUser(formData);
          if (success) {
            const updatedUser: User = {
              ...user,
              fullName: formData.fullName || user.fullName,
              age: formData.age || user.age,
              height: formData.height || user.height,
              weight: formData.weight || user.weight,
              avatarUrl: formData.avatarUrl || user.avatarUrl,
              isPremium: formDataSubscription.isPremium,
            };
            onSave(updatedUser);
          } else {
            setErrors(prev => ({
              ...prev,
              general: error || 'Failed to save profile',
            }));
            toastError('Update Failed', {
              description: error || 'Failed to save your profile',
            });
          }
          break;
        }
        case 'changePassword': {
          const email = user.email;
          const passwordSuccess = await resetPassword(email, formDataPasswordChange.newPassword);
          if (passwordSuccess) {
            setFormDataPasswordChange({
              newPassword: '',
              confirmPassword: '',
            });
            setErrors({});
            setTouched(new Set());
            success('Success', {
              description: 'Your password has been changed successfully',
            });
          } else {
            setErrors(prev => ({
              ...prev,
              general: error || 'Failed to change password',
            }));
            toastError('Password update failed', {
              description: error || 'Failed to change your password',
            });
          }
          break;
        }
        case 'subscription': {
          if (!validateFormSubscription()) {
            return;
          }

          // const subscriptionSuccess = await updateSubscription(user.id, formDataSubscription.isPremium);

          // if (subscriptionSuccess) {
          //   const updatedUserWithSubscription: User = {
          //     ...user,
          //     isPremium: formDataSubscription.isPremium,
          //   };
          //   onSave(updatedUserWithSubscription);
          // } else {
          //   setSubscriptionErrors({
          //     general: 'Failed to update subscription',
          //   });
          //   toastError('Update Failed', {
          //     description: 'Failed to update subscription',
          //   });
          // }
          break;
        }
      }
    })();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4'>
      <div className='relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#1e1416] shadow-2xl shadow-[#D98A9D]/5'>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className='absolute right-6 top-6 z-10 text-gray-400 transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
          aria-label='Close modal'
          type='button'
        >
          <X size={24} />
        </button>

        <div className='grid grid-cols-1 gap-8 p-8 lg:grid-cols-2 lg:p-10'>
          {/* Left Column - Form */}
          <div className='flex flex-col'>
            {/* Header */}
            <h2 className='text-3xl font-black leading-tight tracking-tight text-white'>
              Edit Profile
            </h2>
            <p className='mt-1 text-sm text-gray-400'>
              Update your personal information and preferences
            </p>

            {/* Tabs */}
            <div className='mt-8 flex border-b border-white/10'>
              <button
                onClick={() => handleTabChange('personal')}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                  activeTab === 'personal'
                    ? 'border-[#D98A9D] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
                type='button'
              >
                Personal Info
              </button>
              <button
                onClick={() => handleTabChange('subscription')}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                  activeTab === 'subscription'
                    ? 'border-[#D98A9D] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
                type='button'
              >
                Subscription
              </button>
              <button
                onClick={() => handleTabChange('changePassword')}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                  activeTab === 'changePassword'
                    ? 'border-[#D98A9D] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
                type='button'
              >
                Change password
              </button>
            </div>

            <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className='space-y-6'>
                  {/* Avatar Upload */}
                  <div className='flex flex-col gap-4'>
                    <div>
                      <label
                        htmlFor='avatar'
                        className='pb-2 text-base font-medium leading-normal text-white block'
                      >
                        Profile Photo
                      </label>
                      <label
                        htmlFor='avatar'
                        className={`relative flex items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors
                        ${
                          avatarUploadDisabled
                            ? 'cursor-not-allowed border-white/5 bg-[#141414]/30 opacity-50'
                            : 'cursor-pointer border-white/10 bg-[#141414]/50 hover:border-[#D98A9D]/40 hover:bg-[#141414]/70'
                        }`}
                      >
                        <div className='flex flex-col items-center gap-2'>
                          <Upload size={24} className='text-gray-400' />
                          <span className='text-sm font-medium text-gray-400'>
                            {avatarUploadDisabled
                              ? 'Upload temporarily disabled'
                              : 'Click to upload photo'}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {avatarUploadDisabled
                              ? 'Feature coming soon'
                              : 'JPG, PNG, GIF, WebP up to 5MB'}
                          </span>
                        </div>

                        <input
                          id='avatar'
                          type='file'
                          accept='image/jpeg,image/png,image/gif,image/webp'
                          onChange={handleAvatarChange}
                          disabled={isLoading || avatarUploadDisabled}
                          className='hidden'
                        />
                      </label>
                    </div>

                    {/* Or Divider */}
                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-white/10'></div>
                      </div>
                      <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-[#1e1416] px-2 text-gray-500'>Or paste URL</span>
                      </div>
                    </div>

                    {/* URL Input */}
                    <div className='flex flex-col'>
                      <Input
                        type='url'
                        placeholder='https://example.com/photo.jpg'
                        value={
                          formData.avatarUrl && formData.avatarUrl.startsWith('http')
                            ? formData.avatarUrl
                            : ''
                        }
                        onChange={e => handleAvatarUrlChange(e.target.value)}
                        disabled={isLoading}
                        className='h-12 w-full rounded-lg border border-white/10 bg-[#141414] p-[15px] text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40 disabled:opacity-50 disabled:cursor-not-allowed'
                      />
                      <p className='mt-1 text-xs text-gray-500'>Direct link to image</p>
                    </div>
                  </div>

                  {/* Full Name */}
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
                      <span className='mt-1 text-xs text-red-400'>{errors.fullName}</span>
                    )}
                  </div>

                  {/* Email (Read-only) */}
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
                      value={user.email}
                      disabled
                      className='h-14 w-full resize-none overflow-hidden rounded-lg border border-white/10 bg-[#141414]/60 p-[15px] text-base font-normal leading-normal text-gray-500 cursor-not-allowed'
                    />
                    <p className='mt-1 text-xs text-gray-500'>Email cannot be changed</p>
                  </div>

                  {/* Age, Height, Weight Grid */}
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
                    {/* Age */}
                    <div className='flex flex-col'>
                      <label
                        htmlFor='age'
                        className='pb-2 text-base font-medium leading-normal text-white'
                      >
                        Age
                      </label>
                      <Input
                        id='age'
                        type='number'
                        placeholder='28'
                        value={formData.age || ''}
                        onChange={e => handleInputChange('age', parseInt(e.target.value) || 0)}
                        onBlur={() => handleBlur('age')}
                        disabled={isLoading}
                        className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                        ${
                          errors.age && touched.has('age')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {errors.age && touched.has('age') && (
                        <span className='mt-1 text-xs text-red-400'>{errors.age}</span>
                      )}
                    </div>

                    {/* Height */}
                    <div className='flex flex-col'>
                      <label
                        htmlFor='height'
                        className='pb-2 text-base font-medium leading-normal text-white'
                      >
                        Height (cm)
                      </label>
                      <Input
                        id='height'
                        type='number'
                        placeholder='175'
                        value={formData.height || ''}
                        onChange={e => handleInputChange('height', parseInt(e.target.value) || 0)}
                        onBlur={() => handleBlur('height')}
                        disabled={isLoading}
                        className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                        ${
                          errors.height && touched.has('height')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {errors.height && touched.has('height') && (
                        <span className='mt-1 text-xs text-red-400'>{errors.height}</span>
                      )}
                    </div>

                    {/* Weight */}
                    <div className='flex flex-col'>
                      <label
                        htmlFor='weight'
                        className='pb-2 text-base font-medium leading-normal text-white'
                      >
                        Weight (kg)
                      </label>
                      <Input
                        id='weight'
                        type='number'
                        placeholder='72'
                        value={formData.weight || ''}
                        onChange={e => handleInputChange('weight', parseInt(e.target.value) || 0)}
                        onBlur={() => handleBlur('weight')}
                        disabled={isLoading}
                        className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                        ${
                          errors.weight && touched.has('weight')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {errors.weight && touched.has('weight') && (
                        <span className='mt-1 text-xs text-red-400'>{errors.weight}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className='space-y-6'>
                  <div className='rounded-lg border border-white/10 bg-white/5 p-6'>
                    <label className='flex cursor-pointer items-start gap-4'>
                      <input
                        type='checkbox'
                        checked={formDataSubscription.isPremium}
                        onChange={e =>
                          setFormDataSubscription(prev => ({
                            ...prev,
                            isPremium: e.target.checked,
                          }))
                        }
                        disabled={isLoading}
                        className='mt-1 h-5 w-5 cursor-pointer rounded border border-[#D98A9D]/40 bg-[#141414] accent-[#D98A9D] transition-colors hover:border-[#D98A9D]/60 disabled:opacity-50 disabled:cursor-not-allowed'
                      />
                      <div className='flex-1'>
                        <p className='text-base font-semibold text-white'>Premium Subscription</p>
                        <p className='mt-1 text-sm text-gray-400'>
                          Unlock exclusive features and priority support
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Info about coming soon features */}
                  <div className='rounded-lg border border-white/10 bg-[#D98A9D]/5 p-4'>
                    <p className='text-xs font-medium text-gray-300'>
                      ℹ️ Premium subscription management coming soon
                    </p>
                    <p className='mt-2 text-xs text-gray-400'>
                      Subscription features and billing management will be available in an upcoming
                      update. The checkbox below is for future use.
                    </p>
                  </div>

                  {/* Subscription Error */}
                  {subscriptionErrors.general && (
                    <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400'>
                      {subscriptionErrors.general}
                    </div>
                  )}
                </div>
              )}
              {/* Password changing Tab */}
              {activeTab === 'changePassword' && (
                <div className='space-y-6'>
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
                      value={user.email}
                      disabled
                      className='h-14 w-full resize-none overflow-hidden rounded-lg border border-white/10 bg-[#141414]/60 p-[15px] text-base font-normal leading-normal text-gray-500 cursor-not-allowed'
                    />
                    <p className='mt-1 text-xs text-gray-500'>Email cannot be changed</p>
                  </div>
                  {/* Password Field */}
                  <div className='flex flex-col'>
                    <label
                      htmlFor='newPassword'
                      className='pb-2 text-base font-medium leading-normal text-white'
                    >
                      New Password
                    </label>
                    <div className='relative'>
                      <Input
                        id='newPassword'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter new password'
                        value={formDataPasswordChange.newPassword}
                        onChange={e => {
                          setFormDataPasswordChange(prev => ({
                            ...prev,
                            newPassword: e.target.value,
                          }));
                          validateFieldChangePassword('newPassword', e.target.value);
                        }}
                        onBlur={() => {
                          setTouched(prev => new Set([...prev, 'newPassword']));
                          validateFieldChangePassword(
                            'newPassword',
                            formDataPasswordChange.newPassword
                          );
                        }}
                        disabled={isLoading}
                        className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] pr-12 text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                                            ${
                                              errors.newPassword && touched.has('newPassword')
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
                    {errors.newPassword && touched.has('newPassword') && (
                      <span className='mt-1 text-xs text-red-400'>{errors.newPassword}</span>
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
                        placeholder='Confirm new password'
                        value={formDataPasswordChange.confirmPassword}
                        onChange={e => {
                          setFormDataPasswordChange(prev => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }));
                          validateFieldChangePassword('confirmPassword', e.target.value);
                        }}
                        onBlur={() => {
                          setTouched(prev => new Set([...prev, 'confirmPassword']));
                          validateFieldChangePassword(
                            'confirmPassword',
                            formDataPasswordChange.confirmPassword
                          );
                        }}
                        disabled={isLoading}
                        className={`h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-[15px] pr-12 text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2
                                            ${
                                              errors.confirmPassword &&
                                              touched.has('confirmPassword')
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
                      <span className='mt-1 text-xs text-red-400'>{errors.confirmPassword}</span>
                    )}
                  </div>
                </div>
              )}

              {/* General Error */}
              {(errors.general || error) && (
                <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400'>
                  {errors.general || error}
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex flex-col gap-3 pt-6 sm:flex-row sm:justify-end'>
                <button
                  type='button'
                  onClick={onClose}
                  disabled={isLoading}
                  className='rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Cancel
                </button>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='transform rounded-lg bg-[#D98A9D] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#D98A9D]/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#D98A9D]/50 disabled:scale-100 disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Live Preview */}
          <div className='flex flex-col items-center justify-center rounded-xl bg-black/40 p-8'>
            <div className='text-center mb-8'>
              <h3 className='text-2xl font-black uppercase tracking-widest text-gray-400'>
                Profile Preview
              </h3>
              <p className='mt-2 text-sm text-gray-500'>See how your profile will look</p>
            </div>

            <div className='w-full max-w-sm rounded-2xl border border-white/10 bg-[#160C11]/80 p-8 shadow-xl'>
              <div className='flex flex-col items-center text-center'>
                <img
                  alt='User Avatar Preview'
                  className='h-28 w-28 rounded-full border-4 border-[#D98A9D]/20 object-cover shadow-lg'
                  src={avatarPreview}
                />
                <h2 className='mt-6 text-3xl font-black leading-tight text-white'>
                  {formData.fullName}
                </h2>
                <span className='mt-3 inline-block rounded-full bg-[#D98A9D]/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#D98A9D] border border-[#D98A9D]/30'>
                  {formDataSubscription.isPremium ? 'Premium User' : 'Regular User'}
                </span>

                <div className='mt-8 w-full grid grid-cols-3 gap-4 border-t border-white/10 pt-8'>
                  <div className='text-center'>
                    <p className='text-xs font-medium text-gray-400'>Age</p>
                    <p className='mt-3 text-2xl font-black text-white'>{formData.age || '—'}</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-xs font-medium text-gray-400'>Height</p>
                    <p className='mt-3 text-2xl font-black text-white'>
                      {formData.height || '—'}
                      <span className='text-xs font-normal text-gray-400'>cm</span>
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-xs font-medium text-gray-400'>Weight</p>
                    <p className='mt-3 text-2xl font-black text-white'>
                      {formData.weight || '—'}
                      <span className='text-xs font-normal text-gray-400'>kg</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

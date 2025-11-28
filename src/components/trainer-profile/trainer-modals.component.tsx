import type { CreateExperienceRequest, UpdateExperienceRequest } from '@/types/trainer.types';
import { useState, useEffect } from 'react';
import { X, Upload, EyeOff, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormValidator } from '@/utils/form-validator.utils';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { useUserStore } from '@/store/user.store';
import { useTrainerStore } from '@/store/trainer.store';
import { useAuthStore } from '@/store/auth.store';
import type { UpdateUserRequest } from '@/types/user.types';
import type { UpdateTrainerRequest } from '@/types/trainer.types';

const avatarUploadDisabled = true;

interface EditTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: {
    fullName: string;
    avatarUrl: string;
    age: number;
    height: number;
    weight: number;
    bio: string;
    specialization: string;
    location: string;
    isActive?: boolean;
  };
  isLoading?: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface FormDataPasswordChange {
  newPassword: string;
  confirmPassword: string;
}

type TabType = 'personal' | 'changePassword';

export const EditTrainerModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditTrainerModalProps) => {
  const { success, error: toastError } = useCustomToast();
  const { updateUser } = useUserStore();
  const { updateTrainer } = useTrainerStore();
  const { resetPassword, user: authUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formDataPasswordChange, setFormDataPasswordChange] = useState<FormDataPasswordChange>({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setFullName(initialData.fullName || '');
      setAge(initialData.age || 0);
      setHeight(initialData.height || 0);
      setWeight(initialData.weight || 0);
      setAvatarPreview(initialData.avatarUrl || '');
      setBio(initialData.bio || '');
      setSpecialization(initialData.specialization || '');
      setLocation(initialData.location || '');
      setIsActive(initialData.isActive ?? true);
      setErrors({});
      setTouched(new Set());
      setActiveTab('personal');
      setFormDataPasswordChange({ newPassword: '', confirmPassword: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setErrors({});
    setTouched(new Set());
  };

  const validateField = (field: string, value: string | number) => {
    let error: string | undefined;

    if (field === 'fullName') {
      error = FormValidator.validateFullName(String(value));
    } else if (field === 'age') {
      error = FormValidator.validateAge(Number(value));
    } else if (field === 'height') {
      error = FormValidator.validateHeight(Number(value));
    } else if (field === 'weight') {
      error = FormValidator.validateWeight(Number(value));
    } else if (field === 'bio') {
      error = FormValidator.validateBio(String(value));
    } else if (field === 'specialization') {
      error = FormValidator.validateSpecialization(String(value));
    } else if (field === 'location') {
      error = FormValidator.validateLocation(String(value));
    }

    setErrors(prev => ({ ...prev, [field]: error }));
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      fullName: FormValidator.validateFullName(fullName),
      age: FormValidator.validateAge(age),
      height: FormValidator.validateHeight(height),
      weight: FormValidator.validateWeight(weight),
      bio: FormValidator.validateBio(bio),
      specialization: FormValidator.validateSpecialization(specialization),
      location: FormValidator.validateLocation(location),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set([...prev, field]));
    let value: string | number = '';
    if (field === 'fullName') value = fullName;
    else if (field === 'age') value = age;
    else if (field === 'height') value = height;
    else if (field === 'weight') value = weight;
    else if (field === 'bio') value = bio;
    else if (field === 'specialization') value = specialization;
    else if (field === 'location') value = location;

    validateField(field, value);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUrlChange = (url: string) => {
    setAvatarPreview(url);
  };

  const handleSave = async () => {
    if (activeTab === 'personal') {
      setTouched(
        new Set(['fullName', 'age', 'height', 'weight', 'bio', 'specialization', 'location'])
      );

      if (!validateForm()) {
        return;
      }

      setIsSaving(true);

      try {
        const userData: UpdateUserRequest = {
          fullName,
          age,
          height,
          weight,
          avatarUrl: avatarPreview,
        };

        const trainerData: UpdateTrainerRequest = {
          bio,
          specialization,
          location,
          isActive,
        };

        const userSuccess = await updateUser(userData);
        if (!userSuccess) {
          throw new Error('Failed to update user profile');
        }

        const trainerSuccess = await updateTrainer(trainerData);
        if (!trainerSuccess) {
          throw new Error('Failed to update trainer profile');
        }

        success('Profile Updated', {
          description: 'Your profile has been updated successfully',
        });

        onSave();
        onClose();
      } catch (error) {
        console.error('Error saving profile:', error);
        toastError('Error', {
          description: error instanceof Error ? error.message : 'Failed to save profile',
        });
      } finally {
        setIsSaving(false);
      }
    } else if (activeTab === 'changePassword') {
      if (!validateFormChangePassword()) {
        return;
      }

      setIsSaving(true);

      try {
        if (!authUser) {
          throw new Error('User not authenticated');
        }

        const passwordSuccess = await resetPassword(
          authUser.email,
          formDataPasswordChange.newPassword
        );
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
          onClose();
        } else {
          throw new Error('Failed to change password');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        toastError('Password update failed', {
          description: error instanceof Error ? error.message : 'Failed to change your password',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-3 sm:p-4'>
      <div className='relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#1e1416] shadow-2xl shadow-[#D98A9D]/5 max-h-[95vh] overflow-y-auto'>
        <button
          onClick={onClose}
          disabled={isSaving}
          className='sticky top-0 right-0 z-20 float-right m-4 text-gray-400 transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
          aria-label='Close modal'
          type='button'
        >
          <X size={24} />
        </button>

        <div className='grid grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 md:gap-8 md:p-8 lg:grid-cols-2 lg:p-10'>
          <div className='flex flex-col'>
            <h2 className='text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white'>
              Edit Profile
            </h2>
            <p className='mt-1 text-xs sm:text-sm text-gray-400'>Update your trainer details</p>

            {/* Tabs */}
            <div className='mt-6 flex border-b border-white/10 gap-2'>
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
                onClick={() => handleTabChange('changePassword')}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                  activeTab === 'changePassword'
                    ? 'border-[#D98A9D] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
                type='button'
              >
                Change Password
              </button>
            </div>

            <form className='mt-4 sm:mt-6 md:mt-8 space-y-4 sm:space-y-6'>
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className='space-y-4 sm:space-y-6'>
                  {/* Avatar Upload */}
                  <div className='flex flex-col gap-2 sm:gap-3'>
                    <div>
                      <label
                        htmlFor='avatar'
                        className='pb-2 text-sm sm:text-base font-medium leading-normal text-white block'
                      >
                        Profile Photo
                      </label>
                      <label
                        htmlFor='avatar'
                        className={`relative flex items-center justify-center rounded-lg border-2 border-dashed p-4 sm:p-6 transition-colors ${
                          avatarUploadDisabled
                            ? 'cursor-not-allowed border-white/5 bg-[#141414]/30 opacity-50'
                            : 'cursor-pointer border-white/10 bg-[#141414]/50 hover:border-[#D98A9D]/40 hover:bg-[#141414]/70'
                        }`}
                      >
                        <div className='flex flex-col items-center gap-1 sm:gap-2'>
                          <Upload size={20} className='text-gray-400 sm:w-6 sm:h-6' />
                          <span className='text-xs sm:text-sm font-medium text-gray-400'>
                            {avatarUploadDisabled
                              ? 'Upload temporarily disabled'
                              : 'Click to upload photo'}
                          </span>
                          <span className='text-[10px] sm:text-xs text-gray-500'>
                            {avatarUploadDisabled
                              ? 'Feature coming soon'
                              : 'JPG, PNG, GIF, WebP up to 5MB'}
                          </span>
                        </div>
                        <input
                          id='avatar'
                          type='file'
                          accept='image/jpeg,image/png,image/gif,image/webp'
                          onChange={e => void handleAvatarChange(e)}
                          disabled={isSaving || avatarUploadDisabled}
                          className='hidden'
                        />
                      </label>
                    </div>

                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-white/10'></div>
                      </div>
                      <div className='relative flex justify-center text-[10px] sm:text-xs uppercase'>
                        <span className='bg-[#1e1416] px-2 text-gray-500'>Or paste URL</span>
                      </div>
                    </div>

                    <div className='flex flex-col'>
                      <Input
                        type='url'
                        placeholder='https://example.com/photo.jpg'
                        value={
                          avatarPreview && avatarPreview.startsWith('http') ? avatarPreview : ''
                        }
                        onChange={e => handleAvatarUrlChange(e.target.value)}
                        disabled={isSaving}
                        className='h-10 sm:h-12 w-full rounded-lg border border-white/10 bg-[#141414] p-2 sm:p-[15px] text-sm sm:text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40 disabled:opacity-50 disabled:cursor-not-allowed'
                      />
                      <p className='mt-1 text-[10px] sm:text-xs text-gray-500'>
                        Direct link to image
                      </p>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className='flex flex-col'>
                    <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
                      Full Name
                    </label>
                    <Input
                      id='fullName'
                      type='text'
                      placeholder='John Doe'
                      value={fullName}
                      onChange={e => {
                        setFullName(e.target.value);
                        if (touched.has('fullName')) {
                          validateField('fullName', e.target.value);
                        }
                      }}
                      onBlur={() => handleBlur('fullName')}
                      disabled={isSaving}
                      className={`h-10 sm:h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-2 sm:p-[15px] text-sm sm:text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2 ${
                        errors.fullName && touched.has('fullName')
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                          : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {errors.fullName && touched.has('fullName') && (
                      <span className='mt-1 text-xs text-red-400'>{errors.fullName}</span>
                    )}
                  </div>

                  {/* Age, Height, Weight */}
                  <div className='grid grid-cols-1 gap-3 sm:gap-4 xs:grid-cols-3'>
                    {/* Age */}
                    <div className='flex flex-col'>
                      <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
                        Age
                      </label>
                      <Input
                        type='number'
                        placeholder='28'
                        value={age || ''}
                        onChange={e => {
                          setAge(parseInt(e.target.value) || 0);
                          if (touched.has('age')) {
                            validateField('age', parseInt(e.target.value) || 0);
                          }
                        }}
                        onBlur={() => handleBlur('age')}
                        disabled={isSaving}
                        className={`h-10 sm:h-14 w-full rounded-lg border bg-[#141414] p-2 sm:p-[15px] text-sm sm:text-base font-normal text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 ${
                          errors.age && touched.has('age')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50`}
                      />
                      {errors.age && touched.has('age') && (
                        <span className='mt-1 text-xs text-red-400'>{errors.age}</span>
                      )}
                    </div>

                    {/* Height */}
                    <div className='flex flex-col'>
                      <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
                        Height (cm)
                      </label>
                      <Input
                        type='number'
                        placeholder='175'
                        value={height || ''}
                        onChange={e => {
                          setHeight(parseInt(e.target.value) || 0);
                          if (touched.has('height')) {
                            validateField('height', parseInt(e.target.value) || 0);
                          }
                        }}
                        onBlur={() => handleBlur('height')}
                        disabled={isSaving}
                        className={`h-10 sm:h-14 w-full rounded-lg border bg-[#141414] p-2 sm:p-[15px] text-sm sm:text-base font-normal text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 ${
                          errors.height && touched.has('height')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50`}
                      />
                      {errors.height && touched.has('height') && (
                        <span className='mt-1 text-xs text-red-400'>{errors.height}</span>
                      )}
                    </div>

                    {/* Weight */}
                    <div className='flex flex-col'>
                      <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
                        Weight (kg)
                      </label>
                      <Input
                        type='number'
                        placeholder='72'
                        value={weight || ''}
                        onChange={e => {
                          setWeight(parseInt(e.target.value) || 0);
                          if (touched.has('weight')) {
                            validateField('weight', parseInt(e.target.value) || 0);
                          }
                        }}
                        onBlur={() => handleBlur('weight')}
                        disabled={isSaving}
                        className={`h-10 sm:h-14 w-full rounded-lg border bg-[#141414] p-2 sm:p-[15px] text-sm sm:text-base font-normal text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 ${
                          errors.weight && touched.has('weight')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50`}
                      />
                      {errors.weight && touched.has('weight') && (
                        <span className='mt-1 text-xs text-red-400'>{errors.weight}</span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className='flex flex-col'>
                    <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
                      Bio
                    </label>
                    <textarea
                      placeholder='Tell clients about your experience and approach...'
                      value={bio}
                      onChange={e => {
                        setBio(e.target.value);
                        if (touched.has('bio')) {
                          validateField('bio', e.target.value);
                        }
                      }}
                      onBlur={() => handleBlur('bio')}
                      disabled={isSaving}
                      rows={3}
                      className={`w-full rounded-lg border bg-[#141414] p-2 sm:p-[15px] text-sm sm:text-base font-normal text-white focus:outline-0 focus:ring-2 transition-all resize-none placeholder:text-gray-500 ${
                        errors.bio && touched.has('bio')
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                          : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                      } disabled:opacity-50`}
                    />
                    <p className='mt-1 text-[10px] sm:text-xs text-gray-500'>{bio.length}/500</p>
                    {errors.bio && touched.has('bio') && (
                      <p className='mt-2 text-xs text-red-400'>{errors.bio}</p>
                    )}
                  </div>

                  {/* Specialization and Location */}
                  <div className='grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2'>
                    <div className='flex flex-col'>
                      <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
                        Specialization
                      </label>
                      <Input
                        type='text'
                        placeholder='e.g., Strength Training'
                        value={specialization}
                        onChange={e => {
                          setSpecialization(e.target.value);
                          if (touched.has('specialization')) {
                            validateField('specialization', e.target.value);
                          }
                        }}
                        onBlur={() => handleBlur('specialization')}
                        disabled={isSaving}
                        className={`h-10 sm:h-14 w-full rounded-lg border bg-[#141414] p-2 sm:p-[15px] text-sm sm:text-base font-normal text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 ${
                          errors.specialization && touched.has('specialization')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50`}
                      />
                      {errors.specialization && touched.has('specialization') && (
                        <span className='mt-1 text-xs text-red-400'>{errors.specialization}</span>
                      )}
                    </div>

                    <div className='flex flex-col'>
                      <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
                        Location
                      </label>
                      <Input
                        type='text'
                        placeholder='e.g., New York, USA'
                        value={location}
                        onChange={e => {
                          setLocation(e.target.value);
                          if (touched.has('location')) {
                            validateField('location', e.target.value);
                          }
                        }}
                        onBlur={() => handleBlur('location')}
                        disabled={isSaving}
                        className={`h-10 sm:h-14 w-full rounded-lg border bg-[#141414] p-2 sm:p-[15px] text-sm sm:text-base font-normal text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 ${
                          errors.location && touched.has('location')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50`}
                      />
                      {errors.location && touched.has('location') && (
                        <span className='mt-1 text-xs text-red-400'>{errors.location}</span>
                      )}
                    </div>
                  </div>
                  {/* Activity Status Checkbox */}
                  <div className='flex items-start gap-4 rounded-lg border border-white/10 bg-black/30 p-4 sm:p-6'>
                    <input
                      type='checkbox'
                      id='isActive'
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      disabled={isSaving}
                      className='mt-1 h-5 w-5 cursor-pointer rounded border border-[#D98A9D]/40 bg-[#141414] accent-[#D98A9D] transition-colors hover:border-[#D98A9D]/60 disabled:opacity-50 disabled:cursor-not-allowed'
                    />
                    <div className='flex-1'>
                      <label
                        htmlFor='isActive'
                        className='text-sm sm:text-base font-semibold text-white cursor-pointer'
                      >
                        Active Status
                      </label>
                      <p className='mt-1 text-xs sm:text-sm text-gray-400'>
                        {isActive
                          ? '🟢 You are currently accepting new clients'
                          : '🔴 You are not accepting new clients'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Password Tab */}
              {activeTab === 'changePassword' && (
                <div className='space-y-4 sm:space-y-6'>
                  {/* New Password */}
                  <div className='flex flex-col'>
                    <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
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
                        disabled={isSaving}
                        className={`h-10 sm:h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-2 sm:p-[15px] pr-12 text-sm sm:text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2 ${
                          errors.newPassword && touched.has('newPassword')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSaving}
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

                  {/* Confirm Password */}
                  <div className='flex flex-col'>
                    <label className='pb-2 text-sm sm:text-base font-medium leading-normal text-white'>
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
                        disabled={isSaving}
                        className={`h-10 sm:h-14 w-full resize-none overflow-hidden rounded-lg border bg-[#141414] p-2 sm:p-[15px] pr-12 text-sm sm:text-base font-normal leading-normal text-white placeholder:text-gray-500 transition-shadow duration-300 focus:outline-0 focus:ring-2 ${
                          errors.confirmPassword && touched.has('confirmPassword')
                            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40'
                            : 'border-white/10 focus:border-[#D98A9D]/80 focus:ring-[#D98A9D]/40'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSaving}
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

              {/* Action Buttons */}
              <div className='flex flex-col gap-2 pt-3 sm:gap-3 sm:pt-4 md:pt-6 sm:flex-row sm:justify-end'>
                <button
                  type='button'
                  onClick={onClose}
                  disabled={isSaving}
                  className='rounded-lg border border-white/10 bg-white/5 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-bold text-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className='rounded-lg bg-[#D98A9D] px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-base font-bold text-white shadow-lg shadow-[#D98A9D]/20 transition-all hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#D98A9D]/50 disabled:opacity-70 disabled:scale-100'
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className='flex flex-col items-center justify-center rounded-xl bg-black/40 p-4 sm:p-6 md:p-8'>
            <div className='text-center mb-4 sm:mb-8'>
              <h3 className='text-lg sm:text-2xl font-black uppercase tracking-widest text-gray-400'>
                Profile Preview
              </h3>
              <p className='mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500'>
                See how your profile will look
              </p>
            </div>

            <div className='w-full max-w-sm rounded-2xl border border-white/10 bg-[#160C11]/80 p-4 sm:p-6 md:p-8 shadow-xl'>
              <div className='flex flex-col items-center text-center'>
                <img
                  alt='User Avatar Preview'
                  className='h-20 w-20 sm:h-28 sm:w-28 rounded-full border-4 border-[#D98A9D]/20 object-cover shadow-lg'
                  src={avatarPreview || 'https://via.placeholder.com/112'}
                />
                <h2 className='mt-4 sm:mt-6 text-xl sm:text-3xl font-black leading-tight text-white'>
                  {fullName || 'â€"'}
                </h2>

                {/* Activity Status Badge in Preview */}
                <div
                  className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] sm:text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30'
                      : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      isActive ? 'bg-[#4ade80]' : 'bg-[#ef4444]'
                    }`}
                  ></span>
                  {isActive ? 'Active' : 'Inactive'}
                </div>

                <p className='mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400'>Trainer</p>

                <div className='mt-4 sm:mt-8 w-full space-y-2 sm:space-y-4 border-t border-white/10 pt-4 sm:pt-8'>
                  <div className='text-center'>
                    <p className='text-[10px] sm:text-xs font-medium text-gray-400'>Age</p>
                    <p className='mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-white'>
                      {age || 'â€"'}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-[10px] sm:text-xs font-medium text-gray-400'>Height</p>
                    <p className='mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-white'>
                      {height || 'â€"'}
                      <span className='text-[9px] sm:text-xs font-normal text-gray-400 block'>
                        cm
                      </span>
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-[10px] sm:text-xs font-medium text-gray-400'>Weight</p>
                    <p className='mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-white'>
                      {weight || 'â€"'}
                      <span className='text-[9px] sm:text-xs font-normal text-gray-400 block'>
                        kg
                      </span>
                    </p>
                  </div>
                  <div className='pt-2 sm:pt-4 border-t border-white/10'>
                    <p className='text-[10px] sm:text-xs font-medium text-gray-400'>
                      Specialization
                    </p>
                    <p className='mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-white line-clamp-1'>
                      {specialization || 'â€"'}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-[10px] sm:text-xs font-medium text-gray-400'>Location</p>
                    <p className='mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-white line-clamp-1'>
                      {location || 'â€"'}
                    </p>
                  </div>
                  {bio && (
                    <div className='text-center'>
                      <p className='text-[10px] sm:text-xs font-medium text-gray-400'>Bio</p>
                      <p className='mt-1 sm:mt-2 text-[9px] sm:text-xs text-gray-300 line-clamp-2'>
                        {bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cert: { name: string; url: string }) => void;
  isLoading?: boolean;
  initialData?: { id: string; name: string; url: string };
  isEditing?: boolean;
}

export const AddCertificationModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: CertificationModalProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: toastError } = useCustomToast();
  const { trainer, updateTrainer } = useTrainerStore();

  useEffect(() => {
    if (isOpen && initialData && isEditing) {
      setName(initialData.name);
      setUrl(initialData.url);
      setErrors({});
      setTouched(new Set());
    } else if (isOpen) {
      setName('');
      setUrl('');
      setErrors({});
      setTouched(new Set());
    }
  }, [isOpen, initialData, isEditing]);

  if (!isOpen) return null;

  const validateField = (field: string, value: string) => {
    let error: string | undefined;

    if (field === 'name') {
      error = FormValidator.validateCertificationName(value);
    } else if (field === 'url') {
      error = FormValidator.validateUrl(value);
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: FormValidator.validateCertificationName(name),
      url: FormValidator.validateUrl(url),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set([...prev, field]));
    validateField(field, field === 'name' ? name : url);
  };

  const handleSave = async () => {
    setTouched(new Set(['name', 'url']));

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      let currentCerts: Array<{ id: string; name: string; url: string }> = [];
      if (trainer?.certification && trainer.certification.trim()) {
        try {
          const parsed = JSON.parse(trainer.certification) as Array<{
            id: string;
            name: string;
            url: string;
          }>;
          currentCerts = parsed;
        } catch {
          currentCerts = [];
        }
      }

      let updatedCerts;

      if (isEditing && initialData) {
        updatedCerts = currentCerts.map(cert =>
          cert.id === initialData.id ? { ...cert, name, url } : cert
        );
      } else {
        const newCert = {
          id: Date.now().toString(),
          name,
          url,
        };
        updatedCerts = [...currentCerts, newCert];
      }

      const success_result = await updateTrainer({
        certification: JSON.stringify(updatedCerts),
      });

      if (!success_result) {
        throw new Error('Failed to save certification to server');
      }

      onSave({ name, url });

      success(isEditing ? 'Certification Updated' : 'Certification Added', {
        description: isEditing
          ? 'Your certification has been updated successfully'
          : 'Your certification has been added successfully',
        duration: 3000,
      });
      setName('');
      setUrl('');
      setErrors({});
      setTouched(new Set());
      onClose();
    } catch (error) {
      console.error('Error saving certification:', error);
      toastError('Server Error', {
        description: 'Failed to save certification. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-8 max-w-md w-full shadow-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-white'>
            {isEditing ? 'Edit Certification' : 'Add Certification'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className='text-gray-400 hover:text-white transition-colors disabled:opacity-50'
          >
            <X size={24} />
          </button>
        </div>

        <div className='space-y-5'>
          <div className='flex flex-col'>
            <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
              Certification Name
            </label>
            <Input
              type='text'
              placeholder='e.g., NASM Certified Personal Trainer'
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (touched.has('name')) {
                  validateField('name', e.target.value);
                }
              }}
              onBlur={() => handleBlur('name')}
              disabled={isSaving}
              className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all ${
                errors.name && touched.has('name')
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-[#ff1493]'
              } disabled:opacity-50`}
            />
            {errors.name && touched.has('name') && (
              <p className='mt-2 text-xs text-red-400'>{errors.name}</p>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
              Certification URL (Optional)
            </label>
            <Input
              type='url'
              placeholder='https://example.com'
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                if (touched.has('url')) {
                  validateField('url', e.target.value);
                }
              }}
              onBlur={() => handleBlur('url')}
              disabled={isSaving}
              className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all ${
                errors.url && touched.has('url')
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-[#ff1493]'
              } disabled:opacity-50`}
            />
            {errors.url && touched.has('url') && (
              <p className='mt-2 text-xs text-red-400'>{errors.url}</p>
            )}
          </div>
        </div>

        <div className='flex gap-3 mt-8'>
          <button
            onClick={onClose}
            disabled={isSaving}
            className='flex-1 bg-white/10 text-white font-semibold py-3 rounded-xl transition-all hover:bg-white/20 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className='flex-1 bg-[#D98A9D] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#D98A9D]/20 hover:bg-[#c87b8f] hover:scale-[1.02] disabled:opacity-70 disabled:scale-100'
          >
            {isSaving
              ? isEditing
                ? 'Updating...'
                : 'Adding...'
              : isEditing
                ? 'Update Certification'
                : 'Add Certification'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: CreateExperienceRequest | UpdateExperienceRequest) => void;
  initialData?: UpdateExperienceRequest;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const ExperienceModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: ExperienceModalProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(
    initialData?.endDate === 'Present' ? '' : initialData?.endDate || ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: toastError } = useCustomToast();

  useEffect(() => {
    if (isOpen && initialData && isEditing) {
      console.log('Modal получил initialData:', initialData);
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setErrors({});
      setTouched(new Set());
    } else if (isOpen && !isEditing) {
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setErrors({});
      setTouched(new Set());
    }
  }, [isOpen, initialData, isEditing]);

  if (!isOpen) return null;

  const validateField = (field: string, value: string) => {
    let error: string | undefined;

    if (field === 'title') {
      error = FormValidator.validateJobTitle(value);
    } else if (field === 'description') {
      error = FormValidator.validateDescription(value);
    } else if (field === 'startDate') {
      error = FormValidator.validateStartDate(value);
    } else if (field === 'endDate') {
      error = FormValidator.validateEndDate(value, startDate);
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      title: FormValidator.validateJobTitle(title),
      description: FormValidator.validateDescription(description),
      startDate: FormValidator.validateStartDate(startDate),
      endDate: FormValidator.validateEndDate(endDate, startDate),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };
  const handleBlur = (field: string) => {
    setTouched(prev => new Set([...prev, field]));
    const value =
      field === 'title'
        ? title
        : field === 'description'
          ? description
          : field === 'startDate'
            ? startDate
            : endDate;
    validateField(field, value);
  };

  const handleSave = () => {
    setTouched(new Set(['title', 'description', 'startDate', 'endDate']));

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const formatDateToISO = (dateStr: string): string | null => {
        if (!dateStr) return null;

        if (/^\d{4}-\d{2}$/.test(dateStr)) {
          return `${dateStr}-01T00:00:00.000Z`;
        }

        const date = new Date(dateStr);
        return date.toISOString();
      };

      onSave({
        title,
        description,
        startDate: formatDateToISO(startDate),
        endDate: formatDateToISO(endDate),
      });

      success(isEditing ? 'Experience Updated' : 'Experience Added', {
        description: isEditing
          ? 'Your experience has been updated successfully'
          : 'Your experience has been added successfully',
        duration: 3000,
      });
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setErrors({});
      setTouched(new Set());
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error saving experience:', errorMsg);
      toastError('Server Error', {
        description: isEditing
          ? 'Failed to update experience. Please try again.'
          : 'Failed to add experience. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-white'>
            {isEditing ? 'Edit Experience' : 'Add Experience'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className='text-gray-400 hover:text-white transition-colors disabled:opacity-50'
          >
            <X size={24} />
          </button>
        </div>

        <div className='space-y-5'>
          <div className='flex flex-col'>
            <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
              Job Title
            </label>
            <Input
              type='text'
              placeholder='e.g., Head Trainer'
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (touched.has('title')) {
                  validateField('title', e.target.value);
                }
              }}
              onBlur={() => handleBlur('title')}
              disabled={isSaving}
              className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all ${
                errors.title && touched.has('title')
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-[#ff1493]'
              } disabled:opacity-50`}
            />
            {errors.title && touched.has('title') && (
              <p className='mt-2 text-xs text-red-400'>{errors.title}</p>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
              Description (Optional)
            </label>
            <textarea
              placeholder='Describe your responsibilities and achievements...'
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                if (touched.has('description')) {
                  validateField('description', e.target.value);
                }
              }}
              onBlur={() => handleBlur('description')}
              disabled={isSaving}
              rows={4}
              className={`w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all resize-none ${
                errors.description && touched.has('description')
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-[#ff1493]'
              } disabled:opacity-50 placeholder-gray-500`}
            />
            <p className='mt-1 text-xs text-gray-500'>{description.length}/500</p>
            {errors.description && touched.has('description') && (
              <p className='mt-2 text-xs text-red-400'>{errors.description}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col'>
              <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
                Start Date
              </label>
              <Input
                type='month'
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  if (touched.has('startDate')) {
                    validateField('startDate', e.target.value);
                  }
                  if (endDate && e.target.value > endDate) {
                    validateField('endDate', endDate);
                  }
                }}
                onBlur={() => handleBlur('startDate')}
                disabled={isSaving}
                className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all ${
                  errors.startDate && touched.has('startDate')
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-[#ff1493]'
                } disabled:opacity-50`}
              />
              {errors.startDate && touched.has('startDate') && (
                <p className='mt-2 text-xs text-red-400'>{errors.startDate}</p>
              )}
            </div>

            <div className='flex flex-col'>
              <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
                End Date
              </label>
              <Input
                type='month'
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value);
                  if (touched.has('endDate')) {
                    validateField('endDate', e.target.value);
                  }
                }}
                onBlur={() => handleBlur('endDate')}
                disabled={isSaving}
                className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all ${
                  errors.endDate && touched.has('endDate')
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-[#ff1493]'
                } disabled:opacity-50`}
              />
              {errors.endDate && touched.has('endDate') && (
                <p className='mt-2 text-xs text-red-400'>{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        <div className='flex gap-3 mt-8'>
          <button
            onClick={onClose}
            disabled={isSaving}
            className='flex-1 bg-white/10 text-white font-semibold py-3 rounded-xl transition-all hover:bg-white/20 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className='flex-1 bg-[#D98A9D] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#D98A9D]/20 hover:bg-[#c87b8f] hover:scale-[1.02] disabled:opacity-70 disabled:scale-100'
          >
            {isSaving
              ? isEditing
                ? 'Updating...'
                : 'Adding...'
              : isEditing
                ? 'Update Experience'
                : 'Add Experience'}
          </button>
        </div>
      </div>
    </div>
  );
};

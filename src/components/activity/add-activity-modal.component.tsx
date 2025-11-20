import { useState } from 'react';
import { X } from 'lucide-react';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { FormValidator } from '@/utils/form-validator.utils';
import { getIntensityIcon } from '@/utils/activity-logs.utils';
import type { CreateActivityLogRequest } from '@/types/activity.types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activity: CreateActivityLogRequest) => Promise<void>;
}

export const AddActivityModal = ({ isOpen, onClose, onAdd }: AddActivityModalProps) => {
  const toast = useCustomToast();
  const [activityType, setActivityType] = useState('');
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    activityType: '',
    duration: '',
    intensity: '',
  });

  if (!isOpen) return null;

  const validateActivity = () => {
    const newErrors = {
      activityType: FormValidator.validateActivityType(activityType) || '',
      duration: FormValidator.validateActivityDuration(duration) || '',
      intensity: FormValidator.validateActivityIntensity(intensity) || '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleAdd = async () => {
    if (!validateActivity()) {
      return;
    }

    setIsLoading(true);
    try {
      await onAdd({
        activityType: activityType.trim(),
        intensity,
        durationMinutes: Number(duration),
        completedAt: new Date().toISOString(),
      });

      toast.success('Activity Logged Successfully', {
        description: 'Your activity has been added to the tracker',
        duration: 3000,
      });

      resetForm();
      onClose();
    } catch (_) {
      toast.error('Server Error', {
        description: 'Failed to log activity. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberInput = (value: string, setter: (value: string) => void, errorKey: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setter(value);
      if (errors[errorKey as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [errorKey]: '' }));
      }
    }
  };

  const resetForm = () => {
    setActivityType('');
    setIntensity('Medium');
    setDuration('');
    setErrors({ activityType: '', duration: '', intensity: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const intensityOptions: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High'];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto relative scrollbar-hide'>
        <button
          onClick={handleClose}
          className='absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg'
        >
          <X className='w-6 h-6' />
        </button>

        <h2 className='text-3xl font-bold text-white mb-8'>Log New Activity</h2>

        <div className='mb-6'>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Activity Type
          </label>
          <input
            type='text'
            value={activityType}
            onChange={e => {
              setActivityType(e.target.value);
              if (errors.activityType) {
                setErrors(prev => ({ ...prev, activityType: '' }));
              }
            }}
            className={`w-full bg-[#322840]/60 border ${
              errors.activityType ? 'border-red-500/50' : 'border-white/10'
            } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#d98a9d] focus:bg-[#322840]/80 transition-all`}
            placeholder='e.g., Running, Yoga, Swimming'
          />
          {errors.activityType && (
            <p className='mt-2 text-sm text-red-400'>{errors.activityType}</p>
          )}
        </div>

        <div className='mb-6'>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Intensity Level
          </label>
          <div className='grid grid-cols-3 gap-3'>
            {intensityOptions.map(level => (
              <button
                key={level}
                onClick={() => setIntensity(level)}
                className={`p-4 rounded-xl font-medium transition-all flex flex-col items-center gap-2 ${
                  intensity === level
                    ? level === 'Low'
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : level === 'Medium'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {getIntensityIcon(level)}
                {level}
              </button>
            ))}
          </div>
          {errors.intensity && <p className='mt-2 text-sm text-red-400'>{errors.intensity}</p>}
        </div>

        <div className='mb-8'>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Duration
          </label>
          <div className='relative'>
            <input
              type='text'
              inputMode='numeric'
              value={duration}
              onChange={e => handleNumberInput(e.target.value, setDuration, 'duration')}
              className={`w-full bg-[#322840]/60 border ${
                errors.duration ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#d98a9d] focus:bg-[#322840]/80 transition-all`}
              placeholder='30'
            />
            <span className='absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none'>
              minutes
            </span>
          </div>
          {errors.duration && <p className='mt-2 text-sm text-red-400'>{errors.duration}</p>}
        </div>

        <div className='flex gap-4'>
          <button
            onClick={() => {
              void handleAdd().catch(console.error);
            }}
            disabled={isLoading}
            className='flex-1 bg-[#d98a9d] text-white font-semibold py-4 rounded-xl uppercase tracking-wide shadow-lg shadow-[#d98a9d]/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#d98a9d]/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
          >
            {isLoading ? 'Logging Activity...' : 'Log Activity'}
          </button>
          <button
            onClick={handleClose}
            className='px-8 bg-white/10 text-white font-semibold py-4 rounded-xl uppercase tracking-wide hover:bg-white/20 transition-all'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

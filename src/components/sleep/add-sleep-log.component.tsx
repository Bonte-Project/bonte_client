import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { useSleepLogsStore } from '@/store/sleep-logs.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';

export const AddSleepLog = () => {
  const { addSleepLog, isLoading } = useSleepLogsStore();
  const toast = useCustomToast();

  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const defaultEndDate = `${year}-${month}-${day}`;
  const defaultEndTime = `${hours}:${minutes}`;

  const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
  const startYear = eightHoursAgo.getFullYear();
  const startMonth = String(eightHoursAgo.getMonth() + 1).padStart(2, '0');
  const startDay = String(eightHoursAgo.getDate()).padStart(2, '0');
  const startHours = String(eightHoursAgo.getHours()).padStart(2, '0');
  const startMinutes = String(eightHoursAgo.getMinutes()).padStart(2, '0');

  const defaultStartDate = `${startYear}-${startMonth}-${startDay}`;
  const defaultStartTime = `${startHours}:${startMinutes}`;

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [quality, setQuality] = useState('');
  const [durationHours, setDurationHours] = useState(8);
  const [durationMinutes, setDurationMinutes] = useState(0);

  const [errors, setErrors] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    quality: '',
    dateRange: '',
  });

  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime();
        const totalMinutes = Math.floor(diffMs / (1000 * 60));

        if (totalMinutes >= 0) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          setDurationHours(hours);
          setDurationMinutes(minutes);
          setErrors(prev => ({ ...prev, dateRange: '' }));
        } else {
          setDurationHours(0);
          setDurationMinutes(0);
          setErrors(prev => ({ ...prev, dateRange: 'End time must be after start time' }));
        }
      }
    }
  }, [startDate, startTime, endDate, endTime]);

  const validateForm = () => {
    const newErrors = {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      quality: '',
      dateRange: '',
    };

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }

    const qualityNum = parseInt(quality);
    if (!quality || qualityNum < 1 || qualityNum > 10) {
      newErrors.quality = 'Quality must be between 1 and 10';
    }

    if (startDate && startTime && endDate && endTime) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);

      if (end <= start) {
        newErrors.dateRange = 'End time must be after start time';
      }

      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24) {
        newErrors.dateRange = 'Sleep duration cannot exceed 24 hours';
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    try {
      await addSleepLog({
        startTime: startDateTime,
        endTime: endDateTime,
        quality: parseInt(quality),
      });

      const now = new Date();
      const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

      setStartDate(eightHoursAgo.toISOString().split('T')[0]);
      setStartTime(eightHoursAgo.toTimeString().slice(0, 5));
      setEndDate(now.toISOString().split('T')[0]);
      setEndTime(now.toTimeString().slice(0, 5));
      setQuality('');
      setDurationHours(8);
      setDurationMinutes(0);
      setErrors({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        quality: '',
        dateRange: '',
      });

      toast.success('Sleep Log Added Successfully', {
        description: 'Your sleep log has been added to the tracker',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Error Occured', {
        description: 'Failed to add sleep log. Please try again.',
        duration: 4000,
      });
      console.error('Failed to add sleep log:', error);
    }
  };

  const getMinEndDate = () => {
    return startDate || '';
  };

  return (
    <Card className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 shadow-2xl'>
      <h2 className='text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8'>Log Sleep Session</h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Start Date
          </label>
          <input
            type='date'
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              if (errors.startDate) {
                setErrors(prev => ({ ...prev, startDate: '' }));
              }
            }}
            disabled={isLoading}
            className={`w-full bg-[#322840]/60 border ${
              errors.startDate ? 'border-red-500/50' : 'border-[#322840]'
            } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]`}
          />
          {errors.startDate && <p className='mt-2 text-sm text-red-400'>{errors.startDate}</p>}
        </div>
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Start Time
          </label>
          <input
            type='time'
            value={startTime}
            onChange={e => {
              setStartTime(e.target.value);
              if (errors.startTime) {
                setErrors(prev => ({ ...prev, startTime: '' }));
              }
            }}
            disabled={isLoading}
            className={`w-full bg-[#322840]/60 border ${
              errors.startTime ? 'border-red-500/50' : 'border-[#322840]'
            } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]`}
          />
          {errors.startTime && <p className='mt-2 text-sm text-red-400'>{errors.startTime}</p>}
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            End Date
          </label>
          <input
            type='date'
            value={endDate}
            min={getMinEndDate()}
            onChange={e => {
              setEndDate(e.target.value);
              if (errors.endDate || errors.dateRange) {
                setErrors(prev => ({ ...prev, endDate: '', dateRange: '' }));
              }
            }}
            disabled={isLoading}
            className={`w-full bg-[#322840]/60 border ${
              errors.endDate ? 'border-red-500/50' : 'border-[#322840]'
            } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]`}
          />
          {errors.endDate && <p className='mt-2 text-sm text-red-400'>{errors.endDate}</p>}
        </div>
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            End Time
          </label>
          <input
            type='time'
            value={endTime}
            onChange={e => {
              setEndTime(e.target.value);
              if (errors.endTime || errors.dateRange) {
                setErrors(prev => ({ ...prev, endTime: '', dateRange: '' }));
              }
            }}
            disabled={isLoading}
            className={`w-full bg-[#322840]/60 border ${
              errors.endTime ? 'border-red-500/50' : 'border-[#322840]'
            } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]`}
          />
          {errors.endTime && <p className='mt-2 text-sm text-red-400'>{errors.endTime}</p>}
        </div>
      </div>

      {errors.dateRange && (
        <div className='mb-6'>
          <p className='text-sm text-red-400'>{errors.dateRange}</p>
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Duration
          </label>
          <div className='relative'>
            <div className='w-full bg-[#322840]/40 border border-[#322840] rounded-xl px-5 py-3 text-lg text-gray-300 cursor-not-allowed flex items-center'>
              <span className='text-2xl font-bold text-white'>{durationHours}</span>
              <span className='text-sm text-gray-400 ml-1 mr-3'>h</span>
              <span className='text-2xl font-bold text-white'>{durationMinutes}</span>
              <span className='text-sm text-gray-400 ml-1'>m</span>
            </div>
          </div>
          <p className='mt-2 text-xs text-gray-500'>Calculated automatically</p>
        </div>
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Quality (1-10)
          </label>
          <input
            type='number'
            min='1'
            max='10'
            placeholder='e.g., 8'
            value={quality}
            onChange={e => {
              setQuality(e.target.value);
              if (errors.quality) {
                setErrors(prev => ({ ...prev, quality: '' }));
              }
            }}
            disabled={isLoading}
            className={`w-full bg-[#322840]/60 border ${
              errors.quality ? 'border-red-500/50' : 'border-[#322840]'
            } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {errors.quality && <p className='mt-2 text-sm text-red-400'>{errors.quality}</p>}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className='w-full bg-[#D98A9D] hover:bg-[#e09ab0] active:bg-[#c87a8d] text-white font-semibold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide'
      >
        {isLoading ? 'Saving...' : 'Save Sleep Log'}
      </button>
    </Card>
  );
};

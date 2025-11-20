import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useSleepLogsStore } from '@/store/sleep-logs.store';
import { format, startOfDay, subDays, differenceInMinutes } from 'date-fns';
import { Trash2, Edit2 } from 'lucide-react';
import type { TimePeriod } from '@/types/nutrition.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import type { SleepLog } from '@/types/sleep.types';

export const SleepLogsList = () => {
  const [period, setPeriod] = useState<TimePeriod>('7days');
  const { sleepLogs, getSleepLogs, isLoading, deleteSleepLog, updateSleepLog } =
    useSleepLogsStore();
  const toast = useCustomToast();

  const [editingLog, setEditingLog] = useState<any>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editQuality, setEditQuality] = useState('');
  const [editDurationHours, setEditDurationHours] = useState(0);
  const [editDurationMinutes, setEditDurationMinutes] = useState(0);
  const [editErrors, setEditErrors] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    quality: '',
    dateRange: '',
  });

  useEffect(() => {
    getSleepLogs();
  }, []);

  useEffect(() => {
    if (editStartDate && editStartTime && editEndDate && editEndTime) {
      const start = new Date(`${editStartDate}T${editStartTime}`);
      const end = new Date(`${editEndDate}T${editEndTime}`);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime();
        const totalMinutes = Math.floor(diffMs / (1000 * 60));

        if (totalMinutes >= 0) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          setEditDurationHours(hours);
          setEditDurationMinutes(minutes);
          setEditErrors(prev => ({ ...prev, dateRange: '' }));
        } else {
          setEditDurationHours(0);
          setEditDurationMinutes(0);
          setEditErrors(prev => ({ ...prev, dateRange: 'End time must be after start time' }));
        }
      }
    }
  }, [editStartDate, editStartTime, editEndDate, editEndTime]);

  const filteredLogs = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case '7days':
        startDate = subDays(startOfDay(now), 6);
        break;
      case '30days':
        startDate = subDays(startOfDay(now), 29);
        break;
      default:
        startDate = subDays(startOfDay(now), 6);
    }

    return sleepLogs
      .filter(log => {
        const logDate = new Date(log.startTime);
        return logDate >= startDate && logDate <= now;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [sleepLogs, period]);

  const formatTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  const calculateDuration = (start: Date, end: Date) => {
    const totalMinutes = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-[#4ade80]';
    if (quality >= 6) return 'text-[#fbbf24]';
    if (quality >= 4) return 'text-[#fb923c]';
    return 'text-[#ef4444]';
  };

  const getQualityBgColor = (quality: number) => {
    if (quality >= 8) return 'bg-[#4ade80]/10';
    if (quality >= 6) return 'bg-[#fbbf24]/10';
    if (quality >= 4) return 'bg-[#fb923c]/10';
    return 'bg-[#ef4444]/10';
  };

  const handleEdit = (log: any) => {
    setEditingLog(log);

    const startDateTime = new Date(log.startTime);
    const endDateTime = new Date(log.endTime);

    setEditStartDate(format(startDateTime, 'yyyy-MM-dd'));
    setEditStartTime(format(startDateTime, 'HH:mm'));
    setEditEndDate(format(endDateTime, 'yyyy-MM-dd'));
    setEditEndTime(format(endDateTime, 'HH:mm'));
    setEditQuality(log.quality.toString());

    const duration = calculateDuration(log.startTime, log.endTime);
    setEditDurationHours(duration.hours);
    setEditDurationMinutes(duration.minutes);

    setEditErrors({
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      quality: '',
      dateRange: '',
    });
  };

  const validateEditForm = () => {
    const newErrors = {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      quality: '',
      dateRange: '',
    };

    if (!editStartDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!editStartTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!editEndDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!editEndTime) {
      newErrors.endTime = 'End time is required';
    }

    const qualityNum = parseInt(editQuality);
    if (!editQuality || qualityNum < 1 || qualityNum > 10) {
      newErrors.quality = 'Quality must be between 1 and 10';
    }

    if (editStartDate && editStartTime && editEndDate && editEndTime) {
      const start = new Date(`${editStartDate}T${editStartTime}`);
      const end = new Date(`${editEndDate}T${editEndTime}`);

      if (end <= start) {
        newErrors.dateRange = 'End time must be after start time';
      }

      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24) {
        newErrors.dateRange = 'Sleep duration cannot exceed 24 hours';
      }
    }

    setEditErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleUpdateSubmit = async () => {
    if (!validateEditForm() || !editingLog) {
      return;
    }

    const startDateTime = new Date(`${editStartDate}T${editStartTime}`);
    const endDateTime = new Date(`${editEndDate}T${editEndTime}`);

    try {
      await updateSleepLog(editingLog.id, {
        startTime: startDateTime,
        endTime: endDateTime,
        quality: parseInt(editQuality),
      } as SleepLog);

      setEditingLog(null);
      toast.success('Sleep Log Updated Successfully', {
        description: 'Your sleep log has been updated',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Error Occured', {
        description: 'Failed to update sleep log. Please try again.',
        duration: 4000,
      });
      console.error('Failed to update sleep log:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSleepLog(id);
      toast.success('Sleep Log Deleted Successfully', {
        description: 'Your sleep log has been deleted',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Error Occured', {
        description: 'Failed to delete sleep log. Please try again.',
        duration: 4000,
      });
      console.error('Failed to delete sleep log:', error);
    }
  };

  const getMinEndDate = () => {
    return editStartDate || '';
  };

  return (
    <Card className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8'>
        <h2 className='text-2xl sm:text-3xl font-bold text-white'>Sleep History</h2>

        <Select value={period} onValueChange={value => setPeriod(value as TimePeriod)}>
          <SelectTrigger className='w-full sm:w-[180px] bg-[#322840]/60 border-[#322840] text-white'>
            <SelectValue placeholder='Select period' />
          </SelectTrigger>
          <SelectContent className='bg-[#1a0F16] border-[#36282F]'>
            <SelectGroup>
              <SelectLabel className='text-gray-400'>Time Period</SelectLabel>
              <SelectItem value='today' className='text-white focus:bg-[#322840] focus:text-white'>
                Today
              </SelectItem>
              <SelectItem value='7days' className='text-white focus:bg-[#322840] focus:text-white'>
                Last 7 Days
              </SelectItem>
              <SelectItem value='30days' className='text-white focus:bg-[#322840] focus:text-white'>
                Last 30 Days
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff1493]'></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-400 text-lg'>No sleep logs found for this period</p>
          <p className='text-gray-500 text-sm mt-2'>Start logging your sleep to see your history</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredLogs.map((sleepLog, index) => {
            const duration = calculateDuration(sleepLog.startTime, sleepLog.endTime);

            return (
              <div
                key={index}
                className='bg-[#322840]/40 border border-[#322840] rounded-2xl p-5 sm:p-6 hover:bg-[#322840]/60 transition-all group'
              >
                <div className='flex flex-col lg:flex-row justify-between items-start gap-4'>
                  <div className='flex-1'>
                    <div className='text-white font-semibold text-lg mb-2'>
                      {formatDate(sleepLog.startTime)}
                    </div>
                    <div className='flex flex-wrap items-center gap-3 text-sm text-gray-400'>
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-500'>Bedtime:</span>
                        <span className='text-white font-medium'>
                          {formatTime(sleepLog.startTime)}
                        </span>
                      </div>
                      <span className='text-gray-600'>→</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-500'>Wake:</span>
                        <span className='text-white font-medium'>
                          {formatTime(sleepLog.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap w-full lg:w-auto'>
                    <div className='text-center'>
                      <div className='text-gray-400 text-xs uppercase tracking-wide mb-1'>
                        Duration
                      </div>
                      <div className='text-white font-semibold'>
                        <span className='text-2xl'>{duration.hours}</span>
                        <span className='text-lg text-gray-400'>h </span>
                        <span className='text-2xl'>{duration.minutes}</span>
                        <span className='text-lg text-gray-400'>m</span>
                      </div>
                    </div>

                    <div
                      className={`${getQualityBgColor(
                        sleepLog.quality
                      )} rounded-xl px-4 py-3 min-w-[80px] text-center`}
                    >
                      <div className='text-gray-400 text-xs uppercase tracking-wide mb-1'>
                        Quality
                      </div>
                      <div className={`${getQualityColor(sleepLog.quality)} font-bold`}>
                        <span className='text-3xl'>{sleepLog.quality}</span>
                        <span className='text-lg text-gray-400'>/10</span>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 ml-auto lg:ml-0'>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={() => handleEdit(sleepLog)}
                            className='p-2.5 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-lg transition-all group/edit'
                            title='Edit'
                          >
                            <Edit2 className='w-4 h-4 text-[#8b5cf6] group-hover/edit:text-[#a78bfa]' />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className='bg-[#1a0F16] border-2 border-[#36282F] max-w-2xl max-h-[90vh] overflow-y-auto'>
                          <AlertDialogHeader>
                            <AlertDialogTitle className='text-white text-xl font-bold mb-4'>
                              Edit Sleep Log
                            </AlertDialogTitle>
                          </AlertDialogHeader>

                          <div className='space-y-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                              <div>
                                <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                  Start Date
                                </label>
                                <input
                                  type='date'
                                  value={editStartDate}
                                  onChange={e => {
                                    setEditStartDate(e.target.value);
                                    if (editErrors.startDate) {
                                      setEditErrors(prev => ({ ...prev, startDate: '' }));
                                    }
                                  }}
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.startDate ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all [color-scheme:dark]`}
                                />
                                {editErrors.startDate && (
                                  <p className='mt-1 text-xs text-red-400'>
                                    {editErrors.startDate}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                  Start Time
                                </label>
                                <input
                                  type='time'
                                  value={editStartTime}
                                  onChange={e => {
                                    setEditStartTime(e.target.value);
                                    if (editErrors.startTime) {
                                      setEditErrors(prev => ({ ...prev, startTime: '' }));
                                    }
                                  }}
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.startTime ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all [color-scheme:dark]`}
                                />
                                {editErrors.startTime && (
                                  <p className='mt-1 text-xs text-red-400'>
                                    {editErrors.startTime}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                              <div>
                                <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                  End Date
                                </label>
                                <input
                                  type='date'
                                  value={editEndDate}
                                  min={getMinEndDate()}
                                  onChange={e => {
                                    setEditEndDate(e.target.value);
                                    if (editErrors.endDate || editErrors.dateRange) {
                                      setEditErrors(prev => ({
                                        ...prev,
                                        endDate: '',
                                        dateRange: '',
                                      }));
                                    }
                                  }}
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.endDate ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all [color-scheme:dark]`}
                                />
                                {editErrors.endDate && (
                                  <p className='mt-1 text-xs text-red-400'>{editErrors.endDate}</p>
                                )}
                              </div>
                              <div>
                                <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                  End Time
                                </label>
                                <input
                                  type='time'
                                  value={editEndTime}
                                  onChange={e => {
                                    setEditEndTime(e.target.value);
                                    if (editErrors.endTime || editErrors.dateRange) {
                                      setEditErrors(prev => ({
                                        ...prev,
                                        endTime: '',
                                        dateRange: '',
                                      }));
                                    }
                                  }}
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.endTime ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all [color-scheme:dark]`}
                                />
                                {editErrors.endTime && (
                                  <p className='mt-1 text-xs text-red-400'>{editErrors.endTime}</p>
                                )}
                              </div>
                            </div>

                            {editErrors.dateRange && (
                              <div>
                                <p className='text-xs text-red-400'>{editErrors.dateRange}</p>
                              </div>
                            )}

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                              <div>
                                <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                  Duration
                                </label>
                                <div className='w-full bg-[#322840]/40 border border-[#322840] rounded-xl px-4 py-2.5 text-gray-300 cursor-not-allowed flex items-center'>
                                  <span className='text-xl font-bold text-white'>
                                    {editDurationHours}
                                  </span>
                                  <span className='text-xs text-gray-400 ml-1 mr-2'>h</span>
                                  <span className='text-xl font-bold text-white'>
                                    {editDurationMinutes}
                                  </span>
                                  <span className='text-xs text-gray-400 ml-1'>m</span>
                                </div>
                                <p className='mt-1 text-xs text-gray-500'>
                                  Calculated automatically
                                </p>
                              </div>
                              <div>
                                <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                  Quality (1-10)
                                </label>
                                <input
                                  type='number'
                                  min='1'
                                  max='10'
                                  placeholder='e.g., 8'
                                  value={editQuality}
                                  onChange={e => {
                                    setEditQuality(e.target.value);
                                    if (editErrors.quality) {
                                      setEditErrors(prev => ({ ...prev, quality: '' }));
                                    }
                                  }}
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.quality ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all`}
                                />
                                {editErrors.quality && (
                                  <p className='mt-1 text-xs text-red-400'>{editErrors.quality}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <AlertDialogFooter className='mt-6'>
                            <AlertDialogCancel
                              onClick={() => setEditingLog(null)}
                              className='bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white'
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleUpdateSubmit}
                              className='bg-[#D98A9D] hover:bg-[#e09ab0] text-white border-0'
                            >
                              Save Changes
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className='p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all group/delete'
                            title='Delete'
                          >
                            <Trash2 className='w-4 h-4 text-red-400 group-hover/delete:text-red-300' />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className='bg-[#1a0F16] border-2 border-[#36282F]'>
                          <AlertDialogHeader>
                            <AlertDialogTitle className='text-white text-xl font-bold'>
                              Delete Sleep Log
                            </AlertDialogTitle>
                            <div className='text-gray-400 text-sm mt-2'>
                              Are you sure you want to delete this sleep log? This action cannot be
                              undone.
                            </div>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className='bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white'>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                handleDelete(sleepLog.id).catch(console.error);
                              }}
                              className='bg-red-500 text-white hover:bg-red-600 border-0'
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

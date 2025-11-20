import { Flame, Zap, Battery } from 'lucide-react';
import type { ReactElement } from 'react';

type Intensity = 'low' | 'medium' | 'high';

export const getIntensityIcon = (intensity: string): ReactElement => {
  switch (intensity.toLowerCase() as Intensity) {
    case 'low':
      return <Battery className='w-5 h-5 text-emerald-500' />;
    case 'medium':
      return <Zap className='w-5 h-5 text-amber-500' />;
    case 'high':
      return <Flame className='w-5 h-5 text-red-500' />;
    default:
      return <Battery className='w-5 h-5' />;
  }
};

export const getIntensityColor = (intensity: string): string => {
  switch (intensity.toLowerCase() as Intensity) {
    case 'low':
      return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
    case 'medium':
      return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
    case 'high':
      return 'from-red-500/20 to-pink-500/20 border-red-500/30';
    default:
      return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
  }
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

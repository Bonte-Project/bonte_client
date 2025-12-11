import { Coffee, Cookie, Moon, Sun } from 'lucide-react';

export const getMealIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'breakfast':
      return <Coffee className='w-5 h-5' />;
    case 'lunch':
      return <Sun className='w-5 h-5' />;
    case 'dinner':
      return <Moon className='w-5 h-5' />;
    case 'snack':
      return <Cookie className='w-5 h-5' />;
    default:
      return <Coffee className='w-5 h-5' />;
  }
};

export const getMealColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'breakfast':
      return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
    case 'lunch':
      return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
    case 'dinner':
      return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
    case 'snack':
      return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
    default:
      return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
  }
};

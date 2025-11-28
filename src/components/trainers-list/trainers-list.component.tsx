import { TrainerCard } from './trainer-card.component';
import type { Trainer } from '@/types/trainer.types';

interface TrainersListProps {
  trainers: Trainer[];
  isLoading: boolean;
}

export const TrainersList = ({ trainers, isLoading }: TrainersListProps) => {
  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#D98A9D]'></div>
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className='bg-[#322840]/40 border border-[#322840] rounded-2xl p-12 text-center'>
        <div className='text-4xl mb-4'>🔍</div>
        <p className='text-gray-400 text-lg font-semibold'>No trainers found</p>
        <p className='text-gray-500 text-sm mt-2'>
          Try adjusting your search or filters to find the perfect trainer for you.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {trainers.map(trainer => (
        <TrainerCard key={trainer.id} trainer={trainer} />
      ))}
    </div>
  );
};

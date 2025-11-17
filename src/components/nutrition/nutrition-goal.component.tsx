import { useEffect, useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { NutritionGoalModal } from './nutrition-goal-modal.component';
import { useNutritionGoal } from '@/store/nutrition-goal.store';
import type { NutritionData } from '@/types/nutrition.types';

export const NutritionGoal = ({ data }: { data: NutritionData }) => {
  const { isLoading, error, nutritionGoal, getNutritionGoal, setNutritionGoal } =
    useNutritionGoal();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calorieGoal = nutritionGoal?.calories ?? null;
  const proteinGoal = nutritionGoal?.protein ?? null;
  const carbsGoal = nutritionGoal?.carbs ?? null;
  const fatGoal = nutritionGoal?.fat ?? null;

  const percentage =
    calorieGoal !== null ? Math.min(100, Math.round((data.calories / calorieGoal) * 100)) : 0;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    getNutritionGoal().catch(console.error);
  }, [getNutritionGoal]);

  const handleSaveGoals = async (goals: {
    goal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  }) => {
    try {
      await setNutritionGoal({
        calories: goals.goal,
        protein: goals.proteinGoal,
        carbs: goals.carbsGoal,
        fat: goals.fatGoal,
      });
    } catch (err) {
      console.error('Failed to save goals:', err);
    }
  };

  const formatGoal = (value: number | null) => {
    return value !== null ? value.toLocaleString() : 'N/A ';
  };

  if (isLoading) {
    return (
      <div className='w-full'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl sm:text-2xl font-bold text-white'>Today's Nutrition Summary</h2>
          <button
            disabled
            className='flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 text-white rounded-lg opacity-50 cursor-not-allowed'
          >
            <Settings size={18} />
            <span className='hidden sm:inline text-sm font-medium'>Set Goals</span>
          </button>
        </div>
        <div className='flex items-center justify-center py-16 sm:py-24'>
          <div className='flex flex-col items-center gap-4'>
            <Loader2 className='w-12 h-12 sm:w-16 sm:h-16 text-purple-400 animate-spin' />
            <p className='text-gray-400 text-sm sm:text-base'>Loading nutrition data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6'>
        <h2 className='text-xl sm:text-2xl font-bold text-white'>Today's Nutrition Summary</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all hover:shadow-lg w-full sm:w-auto justify-center'
        >
          <Settings size={18} />
          <span className='text-sm font-medium'>{nutritionGoal ? 'Edit Goals' : 'Set Goals'}</span>
        </button>
      </div>

      {error && (
        <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4'>
          {error}
        </div>
      )}

      <div className='flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8'>
        <div className='flex-1 w-full lg:w-auto'>
          <div className='mb-2'>
            <span className='text-gray-400 text-xs sm:text-sm'>Total Calories</span>
          </div>
          <div className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1'>
            {data.calories.toLocaleString()}
          </div>
          <div className='text-gray-500 text-xs sm:text-sm'>
            / {formatGoal(calorieGoal)} kcal goal
          </div>
        </div>

        <div className='flex gap-6 sm:gap-8 lg:gap-12 flex-1 w-full lg:w-auto justify-around lg:justify-start'>
          <div className='flex-1 sm:flex-none'>
            <div className='text-white font-semibold mb-1 text-sm sm:text-base'>Protein</div>
            <div className='text-2xl sm:text-3xl font-bold text-white'>{Number(data.protein)}g</div>
            <div className='text-gray-500 text-xs sm:text-sm'>/ {formatGoal(proteinGoal)}g</div>
          </div>
          <div className='flex-1 sm:flex-none'>
            <div className='text-white font-semibold mb-1 text-sm sm:text-base'>Carbs</div>
            <div className='text-2xl sm:text-3xl font-bold text-white'>{Number(data.carbs)}g</div>
            <div className='text-gray-500 text-xs sm:text-sm'>/ {formatGoal(carbsGoal)}g</div>
          </div>
          <div className='flex-1 sm:flex-none'>
            <div className='text-white font-semibold mb-1 text-sm sm:text-base'>Fat</div>
            <div className='text-2xl sm:text-3xl font-bold text-white'>{Number(data.fat)}g</div>
            <div className='text-gray-500 text-xs sm:text-sm'>/ {formatGoal(fatGoal)}g</div>
          </div>
        </div>

        <div className='relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto lg:mx-0'>
          <svg className='w-full h-full transform -rotate-90'>
            <circle
              cx='50%'
              cy='50%'
              r='70'
              stroke='#3d2a4d'
              strokeWidth='12'
              fill='none'
              className='sm:stroke-[14] lg:stroke-[16]'
            />
            <circle
              cx='50%'
              cy='50%'
              r='70'
              stroke='url(#gradient)'
              strokeWidth='12'
              fill='none'
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap='round'
              className='sm:stroke-[14] lg:stroke-[16]'
            />
            <defs>
              <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                <stop offset='0%' stopColor='#a8317a' />
                <stop offset='100%' stopColor='#ff2d95' />
              </linearGradient>
            </defs>
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <div className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white'>
              {percentage}%
            </div>
            <div className='text-gray-400 text-xs sm:text-sm'>OF GOAL</div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <NutritionGoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentGoals={{
            goal: calorieGoal ?? 2400,
            proteinGoal: proteinGoal ?? 150,
            carbsGoal: carbsGoal ?? 250,
            fatGoal: fatGoal ?? 70,
          }}
          onSave={handleSaveGoals}
        />
      )}
    </>
  );
};

import { Card } from '@/components/ui/card';
import { NutritionGoal } from './nutrition-goal.component';
import { NutritionLogs } from './nutrition-logs.component';
import { useNutritionLogsStore } from '@/store/nutrition-logs.store';
import type { NutritionData } from '@/types/nutrition.types';
import { endOfDay, isWithinInterval, startOfDay } from 'date-fns';
import { NutritionChart } from './nutrition-chart.component';
import { Salad } from 'lucide-react';

export const NutritionSummary = () => {
  const { logs } = useNutritionLogsStore();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const totals = logs
    .filter(log => {
      const logDate = new Date(log.eatenAt);
      return isWithinInterval(logDate, { start: todayStart, end: todayEnd });
    })
    .reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

  const nutritionData: NutritionData = {
    ...totals,
    goal: null,
    proteinGoal: null,
    carbsGoal: null,
    fatGoal: null,
  };

  return (
    <>
      <div className='flex flex-col items-center justify-center text-center mb-12'>
        <div className='mb-2'>
          <Salad className='w-14 h-14 sm:w-16 sm:h-16 mx-auto opacity-90 text-[#d98a9d]' />
        </div>
        <h1 className='text-3xl sm:text-4xl font-black text-white'>Nutrition Log</h1>
        <p className='mt-2 text-gray-400 text-sm sm:text-base max-w-2xl'>
          Track every bite. Fuel your goals.
        </p>
      </div>
      <Card className='bg-[#1a0F16] border-[#36282F] p-8 mb-6'>
        <NutritionGoal data={nutritionData} />
        <NutritionLogs />
        <NutritionChart />
      </Card>
    </>
  );
};

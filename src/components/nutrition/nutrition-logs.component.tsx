import { useNutritionLogs } from '@/store/nutrition-logs.store';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AddNutritionModal } from './add-nutrition-modal.component';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { getMealColor, getMealIcon } from '@/utils/nutrition-logs.utils';
import { formatTime } from '@/utils/format-time.utils';
import type { Meal, TimePeriod } from '@/types/nutrition.types';
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

export const NutritionLogs = () => {
  const [isAddNutritionModalOpen, setIsAddNutritionModalOpen] = useState(false);
  const { logs, isLoading, getNutritionLogs, addNutritionLog, deleteNutritionLog } =
    useNutritionLogs();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');

  useEffect(() => {
    getNutritionLogs().catch(console.error);
  }, [getNutritionLogs]);

  const getFilteredLogs = (period: TimePeriod) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    switch (period) {
      case 'today': {
        return logs.filter(log => {
          const logDate = new Date(log.eatenAt);
          return isWithinInterval(logDate, { start: todayStart, end: todayEnd });
        });
      }
      case '7days': {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return logs.filter(log => {
          const logDate = new Date(log.eatenAt);
          return logDate >= sevenDaysAgo && logDate <= now;
        });
      }
      case '30days': {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return logs.filter(log => {
          const logDate = new Date(log.eatenAt);
          return logDate >= thirtyDaysAgo && logDate <= now;
        });
      }
      default:
        return logs;
    }
  };

  const handleAddMeal = async (meal: Omit<Meal, 'id'>) => {
    try {
      await addNutritionLog(meal);
      setIsAddNutritionModalOpen(false);
    } catch (error) {
      console.error('Failed to add meal:', error);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteNutritionLog(id);
  };

  const todaysLogs = getFilteredLogs(timePeriod);

  return (
    <>
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-2xl p-8'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-2xl font-bold text-white'>
            {' '}
            {timePeriod === 'today'
              ? "Today's Meals"
              : timePeriod === '7days'
                ? 'Last 7 Days'
                : 'Last 30 Days'}
          </h3>

          <div className='flex gap-2'>
            <Tabs value={timePeriod} onValueChange={value => setTimePeriod(value as TimePeriod)}>
              <TabsList className='bg-white/5 border border-white/10'>
                <TabsTrigger
                  value='today'
                  className='text-white data-[state=active]:bg-primary-button'
                >
                  Today
                </TabsTrigger>
                <TabsTrigger
                  value='7days'
                  className='text-white data-[state=active]:bg-primary-button'
                >
                  Last 7 Days
                </TabsTrigger>
                <TabsTrigger
                  value='30days'
                  className='text-white data-[state=active]:bg-primary-button'
                >
                  Last 30 Days
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <button
            onClick={() => setIsAddNutritionModalOpen(true)}
            disabled={isLoading}
            className='flex items-center gap-2 px-5 py-2.5 bg-primary-button text-white rounded-lg font-medium shadow-lg shadow-primary-button/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-button/50 disabled:opacity-70 disabled:cursor-not-allowed'
          >
            <Plus size={18} />
            Add Meal
          </button>
        </div>

        {isLoading && (
          <div className='text-center py-16'>
            <div className='text-gray-500 text-lg'>Loading meals...</div>
          </div>
        )}

        {!isLoading && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {todaysLogs.map(meal => (
              <div
                key={meal.id}
                className={`bg-linear-to-br ${getMealColor(meal.mealType)} border rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 group`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2.5 bg-white/10 rounded-xl'>{getMealIcon(meal.mealType)}</div>
                    <div>
                      <div className='text-xs text-gray-400 uppercase tracking-wide font-medium mb-1'>
                        {meal.mealType} • {formatTime(meal.eatenAt)}
                      </div>
                      <div className='text-white font-bold text-lg'>{meal.name}</div>
                      <div className='text-xs text-gray-400 mt-1'>{meal.weightInGrams}g</div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className='opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-400 hover:text-red-300'>
                        <Trash2 size={18} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className='bg-[#1a0F16] border-2 border-[#36282F]'>
                      <AlertDialogHeader>
                        <AlertDialogTitle className='text-white text-xl font-bold'>
                          Delete Meal
                        </AlertDialogTitle>
                        <div className='text-gray-400 text-sm mt-2'>
                          Are you sure you want to delete &quot;{meal.name}&quot;? This action
                          cannot be undone.
                        </div>
                      </AlertDialogHeader>
                      <AlertDialogFooter className='gap-2 sm:gap-2'>
                        <AlertDialogCancel className='bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white'>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteMeal(meal.id).catch(console.error);
                          }}
                          className='bg-red-500 text-white hover:bg-red-600 border-0'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className='flex items-end justify-between'>
                  <div className='flex gap-6'>
                    <div>
                      <div className='text-xs text-gray-400 mb-1'>Protein</div>
                      <div className='text-white font-bold text-sm'>{meal.protein}g</div>
                    </div>
                    <div>
                      <div className='text-xs text-gray-400 mb-1'>Carbs</div>
                      <div className='text-white font-bold text-sm'>{meal.carbs}g</div>
                    </div>
                    <div>
                      <div className='text-xs text-gray-400 mb-1'>Fat</div>
                      <div className='text-white font-bold text-sm'>{meal.fat}g</div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-3xl font-bold text-white'>{meal.calories}</div>
                    <div className='text-xs text-gray-400'>kcal</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && todaysLogs.length === 0 && (
          <div className='text-center py-16'>
            <div className='text-gray-500 text-lg mb-4'>No meals added yet</div>
            <p className='text-gray-600 text-sm'>
              Start tracking your nutrition by adding your first meal
            </p>
          </div>
        )}
      </div>

      <AddNutritionModal
        isOpen={isAddNutritionModalOpen}
        onClose={() => setIsAddNutritionModalOpen(false)}
        onAdd={handleAddMeal}
      />
    </>
  );
};

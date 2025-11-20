import { useNutritionLogsStore } from '@/store/nutrition-logs.store';
import { Edit2, Plus, Trash2 } from 'lucide-react';
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
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';

export const NutritionLogs = () => {
  const [isAddNutritionModalOpen, setIsAddNutritionModalOpen] = useState(false);
  const {
    logs,
    isLoading,
    getNutritionLogs,
    addNutritionLog,
    deleteNutritionLog,
    updateNutritionLog,
  } = useNutritionLogsStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const toast = useCustomToast();

  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editMealType, setEditMealType] = useState('');
  const [editMealName, setEditMealName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');
  const [editWeightInGrams, setEditWeightInGrams] = useState('');
  const [editEatenAtDate, setEditEatenAtDate] = useState('');
  const [editEatenAtTime, setEditEatenAtTime] = useState('');

  const [editErrors, setEditErrors] = useState({
    mealName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    weightInGrams: '',
    eatenAtDate: '',
    eatenAtTime: '',
  });

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

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setEditMealType(meal.mealType);
    setEditMealName(meal.name);
    setEditCalories(meal.calories.toString());
    setEditProtein(meal.protein.toString());
    setEditCarbs(meal.carbs.toString());
    setEditFat(meal.fat.toString());
    setEditWeightInGrams(meal.weightInGrams.toString());

    const date = new Date(meal.eatenAt);
    setEditEatenAtDate(date.toISOString().split('T')[0]);
    setEditEatenAtTime(date.toTimeString().slice(0, 5));

    setEditErrors({
      mealName: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      weightInGrams: '',
      eatenAtDate: '',
      eatenAtTime: '',
    });
  };

  const validateEditForm = () => {
    const newErrors = {
      mealName: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      weightInGrams: '',
      eatenAtDate: '',
      eatenAtTime: '',
    };

    if (!editMealName.trim()) {
      newErrors.mealName = 'Meal name is required';
    } else if (editMealName.trim().length < 2) {
      newErrors.mealName = 'Meal name must be at least 2 characters';
    }

    const caloriesNum = Number(editCalories);
    const proteinNum = Number(editProtein);
    const carbsNum = Number(editCarbs);
    const fatNum = Number(editFat);
    const weightNum = Number(editWeightInGrams);

    if (!editCalories || caloriesNum <= 0) {
      newErrors.calories = 'Calories must be greater than 0';
    } else if (caloriesNum > 5000) {
      newErrors.calories = 'Calories cannot exceed 5,000 kcal';
    }

    if (!editProtein || proteinNum < 0) {
      newErrors.protein = 'Protein must be 0 or greater';
    } else if (proteinNum > 500) {
      newErrors.protein = 'Protein cannot exceed 500g';
    }

    if (!editCarbs || carbsNum < 0) {
      newErrors.carbs = 'Carbs must be 0 or greater';
    } else if (carbsNum > 500) {
      newErrors.carbs = 'Carbs cannot exceed 500g';
    }

    if (!editFat || fatNum < 0) {
      newErrors.fat = 'Fat must be 0 or greater';
    } else if (fatNum > 300) {
      newErrors.fat = 'Fat cannot exceed 300g';
    }

    if (!editWeightInGrams || weightNum <= 0) {
      newErrors.weightInGrams = 'Weight must be greater than 0';
    } else if (weightNum > 5000) {
      newErrors.weightInGrams = 'Weight cannot exceed 5,000g';
    }

    if (!editEatenAtDate) {
      newErrors.eatenAtDate = 'Date is required';
    }

    if (!editEatenAtTime) {
      newErrors.eatenAtTime = 'Time is required';
    }

    setEditErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleUpdateSubmit = async () => {
    if (!validateEditForm() || !editingMeal) {
      return;
    }

    const dateTime = new Date(`${editEatenAtDate}T${editEatenAtTime}`);

    if (isNaN(dateTime.getTime())) {
      setEditErrors(prev => ({ ...prev, eatenAtDate: 'Invalid date or time' }));
      return;
    }

    try {
      await updateNutritionLog(editingMeal.id, {
        id: editingMeal.id,
        mealType: editMealType.toLowerCase(),
        name: editMealName.trim(),
        calories: Number(editCalories),
        protein: Number(editProtein),
        carbs: Number(editCarbs),
        fat: Number(editFat),
        weightInGrams: Number(editWeightInGrams),
        eatenAt: dateTime,
      });

      toast.success('Meal Updated Successfully', {
        description: 'Your meal has been updated',
        duration: 3000,
      });

      setEditingMeal(null);
    } catch (error) {
      toast.error('Error Occurred', {
        description: 'Failed to update meal. Please try again.',
        duration: 4000,
      });
      console.error('Failed to update meal:', error);
    }
  };

  const handleNumberInput = (value: string, setter: (value: string) => void, errorKey: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setter(value);
      if (editErrors[errorKey as keyof typeof editErrors]) {
        setEditErrors(prev => ({ ...prev, [errorKey]: '' }));
      }
    }
  };

  const todaysLogs = getFilteredLogs(timePeriod);
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

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

                  <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={() => handleEditMeal(meal)}
                          className='p-2 hover:bg-[#8b5cf6]/20 rounded-lg transition-all text-[#8b5cf6] hover:text-[#a78bfa]'
                        >
                          <Edit2 size={18} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className='bg-[#1a0F16] border-2 border-[#36282F] max-w-2xl max-h-[90vh] overflow-y-auto'>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-white text-xl font-bold mb-4'>
                            Edit Meal
                          </AlertDialogTitle>
                        </AlertDialogHeader>

                        <div className='space-y-4'>
                          <div>
                            <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                              Meal Type
                            </label>
                            <div className='grid grid-cols-4 gap-2'>
                              {mealTypes.map(type => (
                                <button
                                  key={type}
                                  onClick={() => setEditMealType(type.toLowerCase())}
                                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                    editMealType === type.toLowerCase()
                                      ? 'bg-[#D98A9D] text-white shadow-lg'
                                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                              Meal Name
                            </label>
                            <input
                              type='text'
                              value={editMealName}
                              onChange={e => {
                                setEditMealName(e.target.value);
                                if (editErrors.mealName) {
                                  setEditErrors(prev => ({ ...prev, mealName: '' }));
                                }
                              }}
                              className={`w-full bg-[#322840]/60 border ${
                                editErrors.mealName ? 'border-red-500/50' : 'border-[#322840]'
                              } rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all`}
                              placeholder='e.g., Grilled Chicken Salad'
                            />
                            {editErrors.mealName && (
                              <p className='mt-1 text-xs text-red-400'>{editErrors.mealName}</p>
                            )}
                          </div>

                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div>
                              <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                Date
                              </label>
                              <input
                                type='date'
                                value={editEatenAtDate}
                                onChange={e => {
                                  setEditEatenAtDate(e.target.value);
                                  if (editErrors.eatenAtDate) {
                                    setEditErrors(prev => ({ ...prev, eatenAtDate: '' }));
                                  }
                                }}
                                className={`w-full bg-[#322840]/60 border ${
                                  editErrors.eatenAtDate ? 'border-red-500/50' : 'border-[#322840]'
                                } rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all [color-scheme:dark]`}
                              />
                              {editErrors.eatenAtDate && (
                                <p className='mt-1 text-xs text-red-400'>
                                  {editErrors.eatenAtDate}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                Time
                              </label>
                              <input
                                type='time'
                                value={editEatenAtTime}
                                onChange={e => {
                                  setEditEatenAtTime(e.target.value);
                                  if (editErrors.eatenAtTime) {
                                    setEditErrors(prev => ({ ...prev, eatenAtTime: '' }));
                                  }
                                }}
                                className={`w-full bg-[#322840]/60 border ${
                                  editErrors.eatenAtTime ? 'border-red-500/50' : 'border-[#322840]'
                                } rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all [color-scheme:dark]`}
                              />
                              {editErrors.eatenAtTime && (
                                <p className='mt-1 text-xs text-red-400'>
                                  {editErrors.eatenAtTime}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div>
                              <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                Calories
                              </label>
                              <div className='relative'>
                                <input
                                  type='text'
                                  inputMode='numeric'
                                  value={editCalories}
                                  onChange={e =>
                                    handleNumberInput(e.target.value, setEditCalories, 'calories')
                                  }
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.calories ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-4 py-2.5 pr-12 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all`}
                                  placeholder='350'
                                />
                                <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium pointer-events-none'>
                                  kcal
                                </span>
                              </div>
                              {editErrors.calories && (
                                <p className='mt-1 text-xs text-red-400'>{editErrors.calories}</p>
                              )}
                            </div>
                            <div>
                              <label className='block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide'>
                                Weight
                              </label>
                              <div className='relative'>
                                <input
                                  type='text'
                                  inputMode='numeric'
                                  value={editWeightInGrams}
                                  onChange={e =>
                                    handleNumberInput(
                                      e.target.value,
                                      setEditWeightInGrams,
                                      'weightInGrams'
                                    )
                                  }
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.weightInGrams
                                      ? 'border-red-500/50'
                                      : 'border-[#322840]'
                                  } rounded-xl px-4 py-2.5 pr-8 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all`}
                                  placeholder='250'
                                />
                                <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium pointer-events-none'>
                                  g
                                </span>
                              </div>
                              {editErrors.weightInGrams && (
                                <p className='mt-1 text-xs text-red-400'>
                                  {editErrors.weightInGrams}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className='grid grid-cols-3 gap-3'>
                            <div>
                              <label className='block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide'>
                                Protein
                              </label>
                              <div className='relative'>
                                <input
                                  type='text'
                                  inputMode='numeric'
                                  value={editProtein}
                                  onChange={e =>
                                    handleNumberInput(e.target.value, setEditProtein, 'protein')
                                  }
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.protein ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-3 py-2.5 pr-7 text-white focus:outline-none focus:border-[#ff1493] transition-all`}
                                  placeholder='12'
                                />
                                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none'>
                                  g
                                </span>
                              </div>
                              {editErrors.protein && (
                                <p className='mt-1 text-xs text-red-400'>{editErrors.protein}</p>
                              )}
                            </div>
                            <div>
                              <label className='block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide'>
                                Carbs
                              </label>
                              <div className='relative'>
                                <input
                                  type='text'
                                  inputMode='numeric'
                                  value={editCarbs}
                                  onChange={e =>
                                    handleNumberInput(e.target.value, setEditCarbs, 'carbs')
                                  }
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.carbs ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-3 py-2.5 pr-7 text-white focus:outline-none focus:border-[#ff1493] transition-all`}
                                  placeholder='65'
                                />
                                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none'>
                                  g
                                </span>
                              </div>
                              {editErrors.carbs && (
                                <p className='mt-1 text-xs text-red-400'>{editErrors.carbs}</p>
                              )}
                            </div>
                            <div>
                              <label className='block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide'>
                                Fat
                              </label>
                              <div className='relative'>
                                <input
                                  type='text'
                                  inputMode='numeric'
                                  value={editFat}
                                  onChange={e =>
                                    handleNumberInput(e.target.value, setEditFat, 'fat')
                                  }
                                  className={`w-full bg-[#322840]/60 border ${
                                    editErrors.fat ? 'border-red-500/50' : 'border-[#322840]'
                                  } rounded-xl px-3 py-2.5 pr-7 text-white focus:outline-none focus:border-[#ff1493] transition-all`}
                                  placeholder='8'
                                />
                                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none'>
                                  g
                                </span>
                              </div>
                              {editErrors.fat && (
                                <p className='mt-1 text-xs text-red-400'>{editErrors.fat}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <AlertDialogFooter className='mt-6'>
                          <AlertDialogCancel
                            onClick={() => setEditingMeal(null)}
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
                        <button className='p-2 hover:bg-red-500/20 rounded-lg transition-all text-red-400 hover:text-red-300'>
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

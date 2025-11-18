import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { useState } from 'react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoals: {
    goal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  };
  onSave: (goals: {
    goal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  }) => Promise<void>;
}

export const NutritionGoalModal = ({ isOpen, onClose, currentGoals, onSave }: GoalModalProps) => {
  const [calories, setCalories] = useState<string>(currentGoals.goal.toString());
  const [protein, setProtein] = useState<string>(currentGoals.proteinGoal.toString());
  const [carbs, setCarbs] = useState<string>(currentGoals.carbsGoal.toString());
  const [fat, setFat] = useState<string>(currentGoals.fatGoal.toString());

  const [errors, setErrors] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    macros: '',
  });

  const toast = useCustomToast();

  if (!isOpen) return null;

  const validateGoals = () => {
    const newErrors = {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      macros: '',
    };

    const caloriesNum = Number(calories);
    const proteinNum = Number(protein);
    const carbsNum = Number(carbs);
    const fatNum = Number(fat);

    if (!calories || caloriesNum <= 0) {
      newErrors.calories = 'Calorie goal must be greater than 0';
    } else if (caloriesNum > 10000) {
      newErrors.calories = 'Calorie goal cannot exceed 10,000 kcal';
    }

    if (!protein || proteinNum <= 0) {
      newErrors.protein = 'Protein goal must be greater than 0';
    } else if (proteinNum > 1000) {
      newErrors.protein = 'Protein goal cannot exceed 1,000g';
    }

    if (!carbs || carbsNum <= 0) {
      newErrors.carbs = 'Carbs goal must be greater than 0';
    } else if (carbsNum > 1000) {
      newErrors.carbs = 'Carbs goal cannot exceed 1,000g';
    }

    if (!fat || fatNum <= 0) {
      newErrors.fat = 'Fat goal must be greater than 0';
    } else if (fatNum > 500) {
      newErrors.fat = 'Fat goal cannot exceed 500g';
    }

    if (!newErrors.calories && !newErrors.protein && !newErrors.carbs && !newErrors.fat) {
      const calculatedCalories = proteinNum * 4 + carbsNum * 4 + fatNum * 9;
      const difference = Math.abs(calculatedCalories - caloriesNum);
      const percentDiff = (difference / caloriesNum) * 100;

      if (percentDiff > 20) {
        newErrors.macros = `Macros calculate to ${Math.round(calculatedCalories)} kcal, but goal is ${caloriesNum} kcal`;
      }
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSave = async () => {
    if (!validateGoals()) {
      return;
    }

    try {
      const newGoals = {
        goal: Number(calories),
        proteinGoal: Number(protein),
        carbsGoal: Number(carbs),
        fatGoal: Number(fat),
      };

      await onSave(newGoals);
      toast.success('Goals Updated Successfully', {
        description: 'Your nutrition goals have been saved',
        duration: 3000,
      });
      onClose();
    } catch (_) {
      toast.error('Server Error', {
        description: 'Failed to update goals. Please try again.',
        duration: 4000,
      });
    }
  };

  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    if (value === '' || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  const onClickSave = () => {
    void handleSave().catch(console.error);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-12 max-w-2xl w-full shadow-2xl'>
        <h2 className='text-3xl font-bold text-white mb-10'>Set Your Nutrition Goals</h2>

        <div className='mb-8'>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Daily Calorie Goal
          </label>
          <div className='relative'>
            <input
              type='text'
              inputMode='numeric'
              value={calories}
              onChange={e => handleNumberInput(e.target.value, setCalories)}
              className={`w-full bg-[#322840]/60 border ${
                errors.calories ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl px-5 py-4 text-2xl font-semibold text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all`}
              placeholder='2400'
            />
            <span className='absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium pointer-events-none'>
              kcal
            </span>
          </div>
          {errors.calories && <p className='mt-2 text-sm text-red-400'>{errors.calories}</p>}
        </div>

        <div className='grid grid-cols-3 gap-5 mb-6'>
          {[
            {
              label: 'Protein',
              value: protein,
              setValue: setProtein,
              error: errors.protein,
              placeholder: '150',
            },
            {
              label: 'Carbs',
              value: carbs,
              setValue: setCarbs,
              error: errors.carbs,
              placeholder: '250',
            },
            { label: 'Fat', value: fat, setValue: setFat, error: errors.fat, placeholder: '70' },
          ].map(({ label, value, setValue, error, placeholder }) => (
            <div key={label}>
              <div
                className={`bg-[#322840]/40 border ${
                  error ? 'border-red-500/50' : 'border-white/8'
                } rounded-2xl p-5`}
              >
                <label className='block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide'>
                  {label}
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    inputMode='numeric'
                    value={value}
                    onChange={e => handleNumberInput(e.target.value, setValue)}
                    className='w-full bg-transparent text-xl font-semibold text-white focus:outline-none'
                    placeholder={placeholder}
                  />
                  <span className='absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none'>
                    g
                  </span>
                </div>
              </div>
              {error && <p className='mt-1.5 text-xs text-red-400 px-1'>{error}</p>}
            </div>
          ))}
        </div>

        {errors.macros && (
          <div className='mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl'>
            <p className='text-sm text-yellow-400'>{errors.macros}</p>
          </div>
        )}

        <div className='flex gap-4'>
          <button
            onClick={onClickSave}
            className='flex-1 bg-primary-button text-white font-semibold py-4 rounded-xl uppercase tracking-wide shadow-lg shadow-primary-button/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-button/50 disabled:opacity-70 disabled:cursor-not-allowed'
          >
            Save Goals
          </button>
          <button
            onClick={onClose}
            className='px-8 bg-white/10 text-white font-semibold py-4 rounded-xl uppercase tracking-wide hover:bg-white/20 transition-all'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

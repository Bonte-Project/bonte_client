import { useState } from 'react';
import { X } from 'lucide-react';
import { useNutritionLogs } from '@/store/nutrition-logs.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';

interface Meal {
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weightInGrams: number;
  eatenAt: Date;
}

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (meal: Omit<Meal, 'id'>) => Promise<void>;
}

export const AddNutritionModal = ({ isOpen, onClose, onAdd }: AddMealModalProps) => {
  const { isLoading } = useNutritionLogs();
  const toast = useCustomToast();

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const [mealType, setMealType] = useState('breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [weightInGrams, setWeightInGrams] = useState('');
  const [eatenAtDate, setEatenAtDate] = useState(defaultDate);
  const [eatenAtTime, setEatenAtTime] = useState(defaultTime);

  const [errors, setErrors] = useState({
    mealName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    weightInGrams: '',
    eatenAtDate: '',
    eatenAtTime: '',
    macros: '',
  });

  if (!isOpen) return null;

  const validateMeal = () => {
    const newErrors = {
      mealName: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      weightInGrams: '',
      eatenAtDate: '',
      eatenAtTime: '',
      macros: '',
    };

    if (!mealName.trim()) {
      newErrors.mealName = 'Meal name is required';
    } else if (mealName.trim().length < 2) {
      newErrors.mealName = 'Meal name must be at least 2 characters';
    }

    const caloriesNum = Number(calories);
    const proteinNum = Number(protein);
    const carbsNum = Number(carbs);
    const fatNum = Number(fat);
    const weightNum = Number(weightInGrams);

    if (!calories || caloriesNum <= 0) {
      newErrors.calories = 'Calories must be greater than 0';
    } else if (caloriesNum > 5000) {
      newErrors.calories = 'Calories cannot exceed 5,000 kcal';
    }

    if (!protein || proteinNum < 0) {
      newErrors.protein = 'Protein must be 0 or greater';
    } else if (proteinNum > 500) {
      newErrors.protein = 'Protein cannot exceed 500g';
    }

    if (!carbs || carbsNum < 0) {
      newErrors.carbs = 'Carbs must be 0 or greater';
    } else if (carbsNum > 500) {
      newErrors.carbs = 'Carbs cannot exceed 500g';
    }

    if (!fat || fatNum < 0) {
      newErrors.fat = 'Fat must be 0 or greater';
    } else if (fatNum > 300) {
      newErrors.fat = 'Fat cannot exceed 300g';
    }

    if (!weightInGrams || weightNum <= 0) {
      newErrors.weightInGrams = 'Weight must be greater than 0';
    } else if (weightNum > 5000) {
      newErrors.weightInGrams = 'Weight cannot exceed 5,000g';
    }

    if (!eatenAtDate) {
      newErrors.eatenAtDate = 'Date is required';
    }

    if (!eatenAtTime) {
      newErrors.eatenAtTime = 'Time is required';
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleAdd = async () => {
    if (!validateMeal()) {
      return;
    }

    const dateTime = new Date(`${eatenAtDate}T${eatenAtTime}`);

    if (isNaN(dateTime.getTime())) {
      setErrors(prev => ({ ...prev, eatenAtDate: 'Invalid date or time' }));
      return;
    }

    try {
      await onAdd({
        mealType: mealType.toLowerCase(),
        name: mealName.trim(),
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        weightInGrams: Number(weightInGrams),
        eatenAt: dateTime,
      });

      toast.success('Meal Added Successfully', {
        description: 'Your meal has been added to the tracker',
        duration: 3000,
      });

      resetForm();
      onClose();
    } catch (_) {
      toast.error('Server Error', {
        description: 'Failed to add meal. Please try again.',
        duration: 4000,
      });
    }
  };

  const handleNumberInput = (value: string, setter: (value: string) => void, errorKey: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setter(value);
      if (errors[errorKey as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [errorKey]: '' }));
      }
    }
  };

  const resetForm = () => {
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setWeightInGrams('');
    const now = new Date();
    setEatenAtDate(now.toISOString().split('T')[0]);
    setEatenAtTime(now.toTimeString().slice(0, 5));
    setErrors({
      mealName: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      weightInGrams: '',
      eatenAtDate: '',
      eatenAtTime: '',
      macros: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto relative scrollbar-hide'>
        <button
          onClick={handleClose}
          className='absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg'
        >
          <X className='w-6 h-6' />
        </button>

        <h2 className='text-3xl font-bold text-white mb-4'>Add New Meal</h2>

        <div className='mb-6'>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Meal Type
          </label>
          <div className='grid grid-cols-4 gap-3'>
            {mealTypes.map(type => (
              <button
                key={type}
                onClick={() => setMealType(type.toLowerCase())}
                className={`p-3 rounded-xl font-medium transition-all ${
                  mealType === type.toLowerCase()
                    ? 'bg-[#D98A9D] text-white shadow-lg'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className='mb-6'>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Meal Name
          </label>
          <input
            type='text'
            value={mealName}
            onChange={e => {
              setMealName(e.target.value);
              if (errors.mealName) {
                setErrors(prev => ({ ...prev, mealName: '' }));
              }
            }}
            className={`w-full bg-[#322840]/60 border ${
              errors.mealName ? 'border-red-500/50' : 'border-white/10'
            } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all`}
            placeholder='e.g., Grilled Chicken Salad'
          />
          {errors.mealName && <p className='mt-2 text-sm text-red-400'>{errors.mealName}</p>}
        </div>

        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div>
            <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
              Date
            </label>
            <input
              type='date'
              value={eatenAtDate}
              onChange={e => {
                setEatenAtDate(e.target.value);
                if (errors.eatenAtDate) {
                  setErrors(prev => ({ ...prev, eatenAtDate: '' }));
                }
              }}
              className={`w-full bg-[#322840]/60 border ${
                errors.eatenAtDate ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all scheme-dark`}
            />
            {errors.eatenAtDate && (
              <p className='mt-2 text-sm text-red-400'>{errors.eatenAtDate}</p>
            )}
          </div>
          <div>
            <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
              Time
            </label>
            <input
              type='time'
              value={eatenAtTime}
              onChange={e => {
                setEatenAtTime(e.target.value);
                if (errors.eatenAtTime) {
                  setErrors(prev => ({ ...prev, eatenAtTime: '' }));
                }
              }}
              className={`w-full bg-[#322840]/60 border ${
                errors.eatenAtTime ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all scheme-dark`}
            />
            {errors.eatenAtTime && (
              <p className='mt-2 text-sm text-red-400'>{errors.eatenAtTime}</p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div>
            <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
              Calories
            </label>
            <div className='relative'>
              <input
                type='text'
                inputMode='numeric'
                value={calories}
                onChange={e => handleNumberInput(e.target.value, setCalories, 'calories')}
                className={`w-full bg-[#322840]/60 border ${
                  errors.calories ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all`}
                placeholder='350'
              />
              <span className='absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none'>
                kcal
              </span>
            </div>
            {errors.calories && <p className='mt-2 text-sm text-red-400'>{errors.calories}</p>}
          </div>
          <div>
            <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
              Weight
            </label>
            <div className='relative'>
              <input
                type='text'
                inputMode='numeric'
                value={weightInGrams}
                onChange={e => handleNumberInput(e.target.value, setWeightInGrams, 'weightInGrams')}
                className={`w-full bg-[#322840]/60 border ${
                  errors.weightInGrams ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl px-5 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all`}
                placeholder='250'
              />
              <span className='absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none'>
                g
              </span>
            </div>
            {errors.weightInGrams && (
              <p className='mt-2 text-sm text-red-400'>{errors.weightInGrams}</p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-3 gap-4 mb-6'>
          {[
            {
              label: 'Protein',
              value: protein,
              setValue: setProtein,
              error: errors.protein,
              placeholder: '12',
              errorKey: 'protein',
            },
            {
              label: 'Carbs',
              value: carbs,
              setValue: setCarbs,
              error: errors.carbs,
              placeholder: '65',
              errorKey: 'carbs',
            },
            {
              label: 'Fat',
              value: fat,
              setValue: setFat,
              error: errors.fat,
              placeholder: '8',
              errorKey: 'fat',
            },
          ].map(({ label, value, setValue, error, placeholder, errorKey }) => (
            <div key={label}>
              <label className='block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide'>
                {label}
              </label>
              <div className='relative'>
                <input
                  type='text'
                  inputMode='numeric'
                  value={value}
                  onChange={e => handleNumberInput(e.target.value, setValue, errorKey)}
                  className={`w-full bg-[#322840]/60 border ${
                    error ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl px-4 py-3 text-lg text-white focus:outline-none focus:border-[#ff1493] transition-all`}
                  placeholder={placeholder}
                />
                <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none'>
                  g
                </span>
              </div>
              {error && <p className='mt-1.5 text-xs text-red-400'>{error}</p>}
            </div>
          ))}
        </div>

        <div className='flex gap-4'>
          <button
            onClick={() => {
              void handleAdd().catch(console.error);
            }}
            className='flex-1 bg-primary-button text-white font-semibold py-4 rounded-xl uppercase tracking-wide shadow-lg shadow-primary-button/20 transition-all duration-300 ease-in-out hover:bg-[#c87b8f] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-button/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100'
          >
            {isLoading ? 'Adding Meal...' : 'Add Meal'}
          </button>
          <button
            onClick={handleClose}
            className='px-8 bg-white/10 text-white font-semibold py-4 rounded-xl uppercase tracking-wide hover:bg-white/20 transition-all'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

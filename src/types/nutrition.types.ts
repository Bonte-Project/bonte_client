export interface Meal {
  id: string;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weightInGrams: number;
  eatenAt: Date;
}

export interface NutritionState {
  isLoading: boolean;
  error: string | null;
  logs: Meal[];
  getNutritionLogs: () => Promise<void>;
  addNutritionLog: (meal: Omit<Meal, 'id'>) => Promise<void>;
  deleteNutritionLog: (id: string) => Promise<void>;
  updateNutritionLog: (id: string, nutritionLog: Meal) => Promise<void>;
}

export interface NutritionLogsResponse {
  message: string;
  logs: Meal[];
}

export interface CreateNutritionLogResponse {
  message: string;
  log: Meal;
}

export interface UpdateNutritionLogResponse {
  message: string;
  log: Meal;
}

export interface NutritionGoal {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionGoalState {
  isLoading: boolean;
  error: string | null;
  nutritionGoal: NutritionGoal | null;
  getNutritionGoal: () => Promise<void>;
  setNutritionGoal: (goal: NutritionGoal) => Promise<void>;
}

export interface NutritionGoalResponse {
  message: string;
  goal: NutritionGoal & { id: number; userId: string };
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: number | null;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
}

export type TimePeriod = 'today' | '7days' | '30days';

import { create } from 'zustand';

interface CounterStore {
  counter: number;
  increaseCounter: () => void;
}

export const useCounter = create<CounterStore>(set => ({
  counter: 0,
  increaseCounter: () => {
    set(state => ({ counter: state.counter + 1 }));
  },
}));

import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTrainerStore } from '@/store/trainer.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { TrainersFilters } from './trainers-filters.component';
import { TrainersList } from './trainers-list.component';
import type { Trainer } from '@/types/trainer.types';

const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(217, 138, 157, 0.3);
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(217, 138, 157, 0.5);
  }
`;

export const TrainersComponent = () => {
  const { getAllTrainers, isLoading } = useTrainerStore();
  const toast = useCustomToast();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        const data = await getAllTrainers();
        if (data) {
          setTrainers(data);
        } else {
          toast.error('Failed to Load', {
            description: 'Could not fetch trainers',
            duration: 3000,
          });
        }
      } catch (error) {
        toast.error('Error', {
          description: 'An error occurred while loading trainers',
          duration: 3000,
        });
        console.error('Failed to load trainers:', error);
      }
    };

    void loadTrainers();
  }, []);

  const availableSpecializations = useMemo(() => {
    return [...new Set(trainers.map(t => t.specialization).filter(Boolean))].sort();
  }, [trainers]);

  const calculateExperience = (experiences: any[] | undefined) => {
    if (!experiences || experiences.length === 0) return '<1 year';

    let totalMonths = 0;
    const now = new Date();

    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : now;

      if (start <= end) {
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    });

    const years = Math.floor(totalMonths / 12);
    return years === 0 ? '<1 year' : `${years}+ years`;
  };

  const filteredTrainers = useMemo(() => {
    let filtered = trainers;

    if (activeOnly) {
      filtered = filtered.filter(t => t.isActive);
    }

    if (specialization) {
      filtered = filtered.filter(
        t => t.specialization?.toLowerCase() === specialization.toLowerCase()
      );
    }

    if (location) {
      filtered = filtered.filter(t => t.location?.toLowerCase().includes(location.toLowerCase()));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.specialization?.toLowerCase().includes(query) ||
          t.location?.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => {
        const expA = calculateExperience(a.experience);
        const expB = calculateExperience(b.experience);
        const yearsA = parseInt(expA) || 0;
        const yearsB = parseInt(expB) || 0;
        return yearsB - yearsA;
      });
    } else if (sortBy === 'location') {
      filtered.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
    }

    return filtered;
  }, [trainers, searchQuery, specialization, location, activeOnly, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSpecialization('');
    setLocation('');
    setActiveOnly(false);
    setSortBy('name');
    toast.info('Filters Cleared', {
      description: 'All filters have been reset',
      duration: 2000,
    });
  };

  return (
    <div className='space-y-6'>
      <style>{scrollbarStyles}</style>
      {/* Header */}
      <div className='flex flex-col items-center justify-center text-center mb-8'>
        <div className='mb-3'>
          <Search className='w-14 h-14 sm:w-16 sm:h-16 mx-auto opacity-90 text-[#d98a9d]' />
        </div>
        <h1 className='text-3xl sm:text-4xl font-black text-white'>Find Your Trainer</h1>
        <p className='mt-2 text-gray-400 text-sm sm:text-base max-w-2xl'>
          Discover the perfect fitness professional to help you achieve your health and wellness
          goals.
        </p>
      </div>

      {/* Filters */}
      <TrainersFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        specialization={specialization}
        setSpecialization={setSpecialization}
        location={location}
        setLocation={setLocation}
        activeOnly={activeOnly}
        setActiveOnly={setActiveOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
        availableSpecializations={availableSpecializations}
        onClearFilters={handleClearFilters}
        hasActiveFilters={
          !!searchQuery || !!specialization || !!location || activeOnly || sortBy !== 'name'
        }
      />

      {/* List */}
      <TrainersList trainers={filteredTrainers} isLoading={isLoading} />

      {/* Results count */}
      {filteredTrainers.length > 0 && (
        <div className='text-center text-gray-400 text-sm mt-8'>
          Showing {filteredTrainers.length} of {trainers.length} trainers
        </div>
      )}
    </div>
  );
};

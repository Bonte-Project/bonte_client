import { useState } from 'react';
import { Search, ChevronDown, ToggleRight, ToggleLeft, X } from 'lucide-react';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';

class TrainerFiltersValidator {
  static validateSearchQuery(query: string): string | undefined {
    if (query && query.length > 100) {
      return 'Search query cannot exceed 100 characters';
    }
    return undefined;
  }

  static validateLocationFilter(location: string): string | undefined {
    if (location && location.length > 50) {
      return 'Location filter cannot exceed 50 characters';
    }
    return undefined;
  }

  static validateSpecializationFilter(spec: string): string | undefined {
    if (spec && spec.length > 100) {
      return 'Specialization cannot exceed 100 characters';
    }
    return undefined;
  }
}

interface TrainersFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  specialization: string;
  setSpecialization: (spec: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  activeOnly: boolean;
  setActiveOnly: (active: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  availableSpecializations: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const TrainersFilters = ({
  searchQuery,
  setSearchQuery,
  specialization,
  setSpecialization,
  location,
  setLocation,
  activeOnly,
  setActiveOnly,
  sortBy,
  setSortBy,
  availableSpecializations,
  onClearFilters,
  hasActiveFilters,
}: TrainersFiltersProps) => {
  const [specInput, setSpecInput] = useState('');
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const toast = useCustomToast();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = TrainerFiltersValidator.validateSearchQuery(value);
    if (error) {
      toast.error('Validation Error', { description: error });
      return;
    }
    setSearchQuery(value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = TrainerFiltersValidator.validateLocationFilter(value);
    if (error) {
      toast.error('Validation Error', { description: error });
      return;
    }
    setLocation(value);
  };

  const handleSpecChange = (value: string) => {
    const error = TrainerFiltersValidator.validateSpecializationFilter(value);
    if (error) {
      toast.error('Validation Error', { description: error });
      return;
    }
    setSpecialization(value);
    setShowSpecDropdown(false);
    setSpecInput('');
  };

  const filteredSpecs = specInput
    ? availableSpecializations.filter(s => s?.toLowerCase().includes(specInput.toLowerCase()))
    : availableSpecializations;

  return (
    <details
      className='flex flex-col rounded-3xl border border-[#36282F] bg-[#1a0F16] p-6 sm:p-8 group open:mb-6'
      open
    >
      <summary className='flex cursor-pointer list-none items-center justify-between py-2 mb-6'>
        <div className='flex items-center gap-3'>
          <Search className='w-5 h-5 text-[#D98A9D]' />
          <p className='text-white text-lg font-bold'>Filter & Search</p>
        </div>
        <div className='text-gray-400 group-open:rotate-180 transition-transform'>
          <ChevronDown size={20} />
        </div>
      </summary>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
        {/* Search */}
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Search
          </label>
          <input
            type='text'
            placeholder='Specialty, location...'
            value={searchQuery}
            onChange={handleSearchChange}
            className='w-full bg-[#322840]/60 border border-[#322840] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all text-sm placeholder:text-gray-500'
          />
        </div>

        {/* Specialization - Dropdown with input */}
        <div className='relative'>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Specialization
          </label>
          <button
            onClick={() => setShowSpecDropdown(!showSpecDropdown)}
            className='w-full bg-[#322840]/60 border border-[#322840] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all text-sm flex items-center justify-between hover:bg-[#322840]/80'
          >
            <span className={`truncate ${specialization ? 'text-white' : 'text-gray-500'}`}>
              {specialization || 'Select...'}
            </span>
            <ChevronDown
              size={16}
              className={`flex-shrink-0 transition-transform ${showSpecDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showSpecDropdown && (
            <div className='absolute top-full mt-2 left-0 right-0 bg-[#322840] border border-[#36282F] rounded-xl z-10 shadow-lg max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-[#D98A9D]/30 scrollbar-track-[#322840]'>
              <div className='p-2 sticky top-0 bg-[#322840] z-20'>
                <input
                  type='text'
                  placeholder='Search or type...'
                  value={specInput}
                  onChange={e => setSpecInput(e.target.value)}
                  className='w-full bg-[#1a0F16] border border-[#36282F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D98A9D]'
                  onClick={e => e.stopPropagation()}
                />
              </div>
              {filteredSpecs.map(spec => (
                <button
                  key={spec}
                  onClick={() => handleSpecChange(spec)}
                  className='w-full text-left px-4 py-2.5 text-white hover:bg-[#D98A9D]/20 cursor-pointer text-sm transition-colors truncate'
                  title={spec}
                >
                  {spec}
                </button>
              ))}
              {filteredSpecs.length === 0 && (
                <div className='px-4 py-2 text-gray-500 text-sm text-center'>No results</div>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Location
          </label>
          <input
            type='text'
            placeholder='e.g., New York'
            value={location}
            onChange={handleLocationChange}
            className='w-full bg-[#322840]/60 border border-[#322840] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all text-sm placeholder:text-gray-500'
          />
        </div>

        {/* Sort By - Same style as Specialization */}
        <div className='relative'>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Sort By
          </label>
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className='w-full bg-[#322840]/60 border border-[#322840] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff1493] focus:bg-[#322840]/80 transition-all text-sm flex items-center justify-between hover:bg-[#322840]/80'
          >
            <span className='truncate text-white'>
              {sortBy === 'name' && 'Name (A-Z)'}
              {sortBy === 'experience' && 'Experience (High to Low)'}
              {sortBy === 'location' && 'Location (A-Z)'}
            </span>
            <ChevronDown
              size={16}
              className={`flex-shrink-0 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Custom dropdown */}
          {showSortDropdown && (
            <div className='absolute top-full mt-2 left-0 right-0 bg-[#322840] border border-[#36282F] rounded-xl z-10 shadow-lg'>
              <button
                onClick={() => {
                  setSortBy('name');
                  setShowSortDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  sortBy === 'name'
                    ? 'bg-[#D98A9D]/30 text-[#D98A9D] font-medium'
                    : 'text-white hover:bg-[#D98A9D]/20'
                }`}
              >
                Name (A-Z)
              </button>
              <button
                onClick={() => {
                  setSortBy('experience');
                  setShowSortDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-t border-[#36282F] ${
                  sortBy === 'experience'
                    ? 'bg-[#D98A9D]/30 text-[#D98A9D] font-medium'
                    : 'text-white hover:bg-[#D98A9D]/20'
                }`}
              >
                Experience (High to Low)
              </button>
              <button
                onClick={() => {
                  setSortBy('location');
                  setShowSortDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-t border-[#36282F] ${
                  sortBy === 'location'
                    ? 'bg-[#D98A9D]/30 text-[#D98A9D] font-medium'
                    : 'text-white hover:bg-[#D98A9D]/20'
                }`}
              >
                Location (A-Z)
              </button>
            </div>
          )}
        </div>

        {/* Active Toggle */}
        <div>
          <label className='block text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide'>
            Status
          </label>
          <button
            onClick={() => setActiveOnly(!activeOnly)}
            className='w-full h-12 bg-[#322840]/60 border border-[#322840] rounded-xl flex items-center justify-between px-4 hover:bg-[#322840]/80 transition-all'
          >
            <span className='text-white text-sm font-medium'>Active Only</span>
            {activeOnly ? (
              <ToggleRight className='w-5 h-5 text-[#D98A9D] flex-shrink-0' />
            ) : (
              <ToggleLeft className='w-5 h-5 text-gray-500 flex-shrink-0' />
            )}
          </button>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className='flex justify-center'>
          <button
            onClick={onClearFilters}
            className='flex items-center gap-2 px-6 py-2.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 hover:border-red-500/50 transition-all text-sm font-medium'
          >
            <X size={16} />
            Clear All Filters
          </button>
        </div>
      )}
    </details>
  );
};

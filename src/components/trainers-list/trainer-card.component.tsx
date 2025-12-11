import { useNavigate } from '@tanstack/react-router';
import { MapPin, Clock, Award } from 'lucide-react';
import { useUserStore } from '@/store/user.store';
import { useState, useEffect } from 'react';
import type { Trainer } from '@/types/trainer.types';

interface Certification {
  id: string;
  name: string;
  url: string;
}

const isCertification = (obj: any): obj is Certification => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.url === 'string'
  );
};

interface TrainerCardProps {
  trainer: Trainer;
}

const calculateExperience = (experiences: any[] | undefined): string => {
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

const parseCertifications = (certString: string): Certification[] => {
  try {
    const parsed = JSON.parse(certString || '[]');

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCertification);
  } catch {
    return [];
  }
};

const truncateText = (text: string, length: number): string => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const TrainerCard = ({ trainer }: TrainerCardProps) => {
  const navigate = useNavigate();
  const { getUserById } = useUserStore();
  const [user, setUser] = useState<any>(null);

  const experience = calculateExperience(trainer.experience);
  const certs = parseCertifications(trainer.certification);
  const bioPreview = trainer.bio.length > 85 ? `${trainer.bio.substring(0, 85)}...` : trainer.bio;
  const specializationDisplay = truncateText(trainer.specialization, 20);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserById(trainer.userId);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    void loadUser();
  }, [trainer.userId, getUserById]);

  const handleCardClick = async () => {
    await navigate({ to: `/trainer/${trainer.id}` });
  };

  return (
    <button
      onClick={handleCardClick}
      className='w-full bg-[#322840]/40 border border-[#322840] rounded-2xl p-5 sm:p-6 hover:bg-[#322840]/60 hover:border-[#D98A9D]/30 transition-all group text-left'
    >
      <div className='flex flex-col items-center text-center gap-4'>
        {/* Avatar */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className='w-16 h-16 rounded-full object-cover border-2 border-[#D98A9D]/30 group-hover:border-[#D98A9D]/50 transition-all'
          />
        ) : (
          <div className='w-16 h-16 rounded-full bg-gradient-to-br from-[#D98A9D]/30 to-[#D98A9D]/10 border-2 border-[#D98A9D]/30 flex items-center justify-center group-hover:border-[#D98A9D]/50 transition-all'>
            <span className='text-2xl font-bold text-[#D98A9D]'>
              {user?.fullName?.charAt(0) || trainer.specialization.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Specialization */}
        <div>
          <h3 className='text-lg font-bold text-white group-hover:text-[#D98A9D] transition-colors truncate'>
            {specializationDisplay}
          </h3>
        </div>

        {/* Location & Experience */}
        <div className='flex flex-col gap-2 w-full text-sm text-gray-400'>
          <div className='flex items-center justify-center gap-2'>
            <MapPin size={16} className='flex-shrink-0' />
            <span className='truncate'>{trainer.location}</span>
          </div>
          <div className='flex items-center justify-center gap-2'>
            <Clock size={16} className='flex-shrink-0' />
            <span>{experience}</span>
          </div>
        </div>

        {/* Bio Preview */}
        <p className='text-xs text-gray-500 line-clamp-2 min-h-[2.5rem] leading-relaxed'>
          {bioPreview}
        </p>

        {/* Certifications & Status */}
        <div className='w-full flex items-center justify-between pt-4 border-t border-[#322840] group-hover:border-[#D98A9D]/20 transition-colors'>
          <div className='flex items-center gap-1.5 text-sm text-gray-400'>
            <Award size={16} className='flex-shrink-0' />
            <span className='font-medium'>{certs.length}</span>
          </div>
          {trainer.isActive ? (
            <span className='px-2.5 py-1 bg-[#4ade80]/20 text-[#4ade80] text-xs font-semibold rounded-full border border-[#4ade80]/30 flex-shrink-0'>
              Active
            </span>
          ) : (
            <span className='px-2.5 py-1 bg-[#ef4444]/20 text-[#ef4444] text-xs font-semibold rounded-full border border-[#ef4444]/30 flex-shrink-0'>
              Inactive
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

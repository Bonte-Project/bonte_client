import { useState } from 'react';
import { apiRequest } from '@/api/client';

export const CreateTrainerProfileButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateProfile = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Токен не найден. Пожалуйста, авторизуйтесь.');
        setIsLoading(false);
        return;
      }

      const emptyTrainerProfile = {
        bio: '',
        certification: JSON.stringify([]),
        specialization: '',
        location: '',
        experience: [],
      };

      await apiRequest('/trainers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emptyTrainerProfile),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании профиля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <button
        onClick={handleCreateProfile}
        disabled={isLoading}
        className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      >
        {isLoading ? 'Создание профиля...' : 'Создать профиль тренера'}
      </button>

      {error && <div className='p-3 bg-red-100 text-red-800 rounded-lg text-sm'>{error}</div>}

      {success && (
        <div className='p-3 bg-green-100 text-green-800 rounded-lg text-sm'>
          Профиль тренера успешно создан!
        </div>
      )}
    </div>
  );
};

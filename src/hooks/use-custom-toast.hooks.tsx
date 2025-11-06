import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

/**
 * Custom Toast Hook
 * Provides typed toast notifications with icons and custom styling
 *
 * @example
 * const { success, error, info, warning } = useCustomToast();
 *
 * success('Account created', {
 *   description: 'You can now sign in'
 * });
 */
export function useCustomToast() {
  const success = (title: string, options?: ToastOptions) => {
    return toast.custom(
      () => (
        <div className='w-full max-w-sm rounded-lg border border-green-500/30 bg-[#1a2a1a] p-5 text-white shadow-xl backdrop-blur-md'>
          <div className='flex items-start gap-4'>
            <CheckCircle2 className='h-6 w-6 text-green-500 mt-0.5' />
            <div className='grow'>
              <h3 className='font-bold text-green-500'>{title}</h3>
              {options?.description && (
                <p className='mt-1 text-sm font-light text-gray-300'>{options.description}</p>
              )}
              {options?.action && (
                <button
                  onClick={options.action.onClick}
                  className='mt-3 text-xs font-semibold text-green-500/80 transition-colors hover:text-green-500'
                >
                  {options.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => toast.dismiss()}
              className='text-gray-400 hover:text-white transition-colors'
            >
              ✕
            </button>
          </div>
        </div>
      ),
      { duration: options?.duration || 5000 }
    );
  };

  const error = (title: string, options?: ToastOptions) => {
    return toast.custom(
      () => (
        <div className='w-full max-w-sm rounded-lg border border-red-500/30 bg-[#2a1a1a] p-5 text-white shadow-xl backdrop-blur-md'>
          <div className='flex items-start gap-4'>
            <AlertCircle className='h-6 w-6 text-red-500  mt-0.5' />
            <div className='grow'>
              <h3 className='font-bold text-red-500'>{title}</h3>
              {options?.description && (
                <p className='mt-1 text-sm font-light text-gray-300'>{options.description}</p>
              )}
              {options?.action && (
                <button
                  onClick={options.action.onClick}
                  className='mt-3 text-xs font-semibold text-red-500/80 transition-colors hover:text-red-500'
                >
                  {options.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => toast.dismiss()}
              className='text-gray-400 hover:text-white transition-colors'
            >
              ✕
            </button>
          </div>
        </div>
      ),
      { duration: options?.duration || 5000 }
    );
  };

  const info = (title: string, options?: ToastOptions) => {
    return toast.custom(
      () => (
        <div className='w-full max-w-sm rounded-lg border border-blue-500/30 bg-[#1a1f2a] p-5 text-white shadow-xl backdrop-blur-md'>
          <div className='flex items-start gap-4'>
            <Info className='h-6 w-6 text-blue-500 mt-0.5' />
            <div className='grow'>
              <h3 className='font-bold text-blue-500'>{title}</h3>
              {options?.description && (
                <p className='mt-1 text-sm font-light text-gray-300'>{options.description}</p>
              )}
              {options?.action && (
                <button
                  onClick={options.action.onClick}
                  className='mt-3 text-xs font-semibold text-blue-500/80 transition-colors hover:text-blue-500'
                >
                  {options.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => toast.dismiss()}
              className='text-gray-400 hover:text-white transition-colors '
            >
              ✕
            </button>
          </div>
        </div>
      ),
      { duration: options?.duration || 5000 }
    );
  };

  const warning = (title: string, options?: ToastOptions) => {
    return toast.custom(
      () => (
        <div className='w-full max-w-sm rounded-lg border border-yellow-500/30 bg-[#2a2410] p-5 text-white shadow-xl backdrop-blur-md'>
          <div className='flex items-start gap-4'>
            <AlertTriangle className='h-6 w-6 text-yellow-500 mt-0.5' />
            <div className='grow'>
              <h3 className='font-bold text-yellow-500'>{title}</h3>
              {options?.description && (
                <p className='mt-1 text-sm font-light text-gray-300'>{options.description}</p>
              )}
              {options?.action && (
                <button
                  onClick={options.action.onClick}
                  className='mt-3 text-xs font-semibold text-yellow-500/80 transition-colors hover:text-yellow-500'
                >
                  {options.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => toast.dismiss()}
              className='text-gray-400 hover:text-white transition-colors'
            >
              ✕
            </button>
          </div>
        </div>
      ),
      { duration: options?.duration || 5000 }
    );
  };

  return { success, error, info, warning };
}

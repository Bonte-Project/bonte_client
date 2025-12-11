import { Toaster } from '@/components/ui/sonner';
import '@/styles/toast-provider.style.css';

export const ToastProvider = () => {
  return (
    <Toaster
      position='top-right'
      expand
      richColors
      closeButton
      theme='dark'
      toastOptions={{
        className: 'custom-toast',
      }}
      style={
        {
          '--sonner-text-color': '#ffffff',
          '--sonner-border-radius': '8px',
          '--sonner-background': '#181114',
        } as React.CSSProperties
      }
    />
  );
};

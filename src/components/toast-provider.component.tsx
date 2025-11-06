import { Toaster } from '@/components/ui/sonner';
import '@/styles/toast-provider.style.css'; // создадим отдельный CSS-файл

/**
 * Toast Provider Component
 * Wraps the Sonner Toaster with custom styling
 */
function ToastProvider() {
  return (
    <Toaster
      position='top-right'
      expand
      richColors
      closeButton
      theme='dark'
      toastOptions={{
        className: 'custom-toast', // базовый класс
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
}

export { ToastProvider };

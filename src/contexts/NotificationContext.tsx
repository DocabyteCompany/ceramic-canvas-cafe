import React, { createContext, useContext, ReactNode, lazy, Suspense } from 'react';
import { useNotifications } from '@/components/ui/notification';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load del NotificationContainer
const NotificationContainer = lazy(() => 
  import('@/components/ui/notification').then(module => ({ 
    default: module.NotificationContainer 
  }))
);

interface NotificationContextType {
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const notificationMethods = useNotifications();

  return (
    <NotificationContext.Provider value={notificationMethods}>
      {children}
      <Suspense fallback={<LoadingSpinner size="sm" text="Cargando notificaciones..." />}>
        <NotificationContainer />
      </Suspense>
    </NotificationContext.Provider>
  );
};

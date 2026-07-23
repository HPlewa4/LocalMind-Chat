import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastComponent: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          background: 'bg-green-800 border-green-600',
          icon: <CheckCircle className="h-5 w-5 text-green-400" />,
          text: 'text-green-100'
        };
      case 'error':
        return {
          background: 'bg-red-800 border-red-600',
          icon: <AlertCircle className="h-5 w-5 text-red-400" />,
          text: 'text-red-100'
        };
      case 'warning':
        return {
          background: 'bg-yellow-800 border-yellow-600',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
          text: 'text-yellow-100'
        };
      case 'info':
      default:
        return {
          background: 'bg-blue-800 border-blue-600',
          icon: <Info className="h-5 w-5 text-blue-400" />,
          text: 'text-blue-100'
        };
    }
  };

  const styles = getToastStyles(toast.type);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div className={`${styles.background} ${styles.text} border-l-4 p-4 rounded-lg shadow-lg mb-3 animate-slide-in-right flex items-start gap-3 min-w-80 max-w-96`}>
      <div className="flex-shrink-0">
        {styles.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium break-words">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string) => addToast(message, 'success');
  const showError = (message: string) => addToast(message, 'error');
  const showWarning = (message: string) => addToast(message, 'warning');
  const showInfo = (message: string) => addToast(message, 'info');

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};
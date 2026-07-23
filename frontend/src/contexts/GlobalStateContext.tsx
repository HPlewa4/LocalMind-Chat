import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalState {
  user: {
    id: string | null;
    name: string;
    email: string;
    isLoggedIn: boolean;
    plan: 'free' | 'pro' | 'enterprise';
  };
  theme: 'light' | 'dark';
  notifications: string[];
}

interface GlobalStateContextType {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  updateUser: (user: Partial<GlobalState['user']>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (message: string) => void;
  removeNotification: (index: number) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

const initialState: GlobalState = {
  user: {
    id: null,
    name: '',
    email: '',
    isLoggedIn: false,
    plan: 'free'
  },
  theme: 'dark',
  notifications: [],
};

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(initialState);

  const updateUser = (userUpdates: Partial<GlobalState['user']>) => {
    setState(prevState => ({
      ...prevState,
      user: { ...prevState.user, ...userUpdates }
    }));
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setState(prevState => ({
      ...prevState,
      theme
    }));
  };

  const addNotification = (message: string) => {
    setState(prevState => ({
      ...prevState,
      notifications: [...prevState.notifications, message]
    }));
  };

  const removeNotification = (index: number) => {
    setState(prevState => ({
      ...prevState,
      notifications: prevState.notifications.filter((_, i) => i !== index)
    }));
  };

  const contextValue: GlobalStateContextType = {
    state,
    setState,
    updateUser,
    setTheme,
    addNotification,
    removeNotification,
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use the global state
export const useGlobalState = (): GlobalStateContextType => {
  const context = useContext(GlobalStateContext);
  
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  
  return context;
};
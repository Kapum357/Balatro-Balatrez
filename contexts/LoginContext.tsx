import React, { createContext, ReactNode, useContext, useState } from 'react';

interface LoginContextProps {
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  getGreeting: () => string;
}

const LoginContext = createContext<LoginContextProps | null>(null);

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider: React.FC<LoginProviderProps> = ({ children }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Player!';
    if (hour < 18) return 'Good afternoon, Player!';
    return 'Good evening, Player!';
  };

  return (
    <LoginContext.Provider
      value={{ username, setUsername, password, setPassword, getGreeting }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLoginContext = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLoginContext must be used within a LoginProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';

interface HostelContextType {
  selectedHostelId: string;
  setSelectedHostelId: (id: string) => void;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const HostelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedHostelId, setSelectedHostelIdState] = useState<string>(() => {
    const saved = localStorage.getItem('selectedHostelId');
    return saved || '';
  });

  const setSelectedHostelId = (id: string) => {
    setSelectedHostelIdState(id);
    if (id) {
      localStorage.setItem('selectedHostelId', id);
    } else {
      localStorage.removeItem('selectedHostelId');
    }
  };

  return (
    <HostelContext.Provider value={{ selectedHostelId, setSelectedHostelId }}>
      {children}
    </HostelContext.Provider>
  );
};

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (context === undefined) {
    throw new Error('useHostel must be used within a HostelProvider');
  }
  return context;
};

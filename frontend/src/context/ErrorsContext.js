import React, { createContext, useContext, useReducer, useState } from 'react';

const ErrorsContext = createContext();

export const useError = () => useContext(ErrorsContext);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const triggerError = (message) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  return (
    <ErrorsContext.Provider value={{ error, triggerError }}>
      {children}
    </ErrorsContext.Provider>
  );
};

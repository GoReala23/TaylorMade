import React, { createContext, useContext, useReducer, useState } from 'react';

const ErrorsContext = createContext();

export const useError = () => useContext(ErrorsContext);

export const ErrorProvider = ({ children }) => {
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const triggerError = (msg) => {
    console.log('[ErrorContext] Triggered error:', msg);
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const triggerSuccess = (msg) => {
    console.log('[ErrorContext] Triggered success:', msg);
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };
  return (
    <ErrorsContext.Provider
      value={{ successMessage, errorMessage, triggerError, triggerSuccess }}
    >
      {children}
    </ErrorsContext.Provider>
  );
};

import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Auth from '../utils/Auth';
import CurrentUserContext from './CurrentUserContext';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuthState = async () => {
      const token = localStorage.getItem('token');
      const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (token && localLoggedIn) {
        try {
          const user =
            (await Auth.getCurrentUser(token)) ||
            JSON.parse(localStorage.getItem('user'));
          setCurrentUser(user);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          localStorage.removeItem('token');
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      }
      setIsLoading(false);
    };
    initializeAuthState();
  }, []);
  const clearMessages = () => {
    setAuthError(null);
    setSuccessMessage(null);
  };
  const register = async (userData) => {
    try {
      const response = await Auth.register(
        userData.name,
        userData.email,
        userData.password,
      );
      setSuccessMessage('Registration successful! Please log in.');
      setAuthError(null);
      setTimeout(clearMessages, 3000);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.message || 'Registration failed. Please try again.');
      setSuccessMessage(null);
      setTimeout(clearMessages, 3000);
      throw error;
    }
  };
  const login = async (userData) => {
    try {
      setAuthError(null);
      setSuccessMessage(null);

      const response = await Auth.login(userData.email, userData.password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('isLoggedIn', true);
      setCurrentUser(response.user);
      setIsLoggedIn(true);

      setSuccessMessage('Login successful!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setAuthError(
        error.message && 'Login failed. Please check your credentials.',
      );
      setSuccessMessage(null);
      setTimeout(() => setAuthError(null), 3000);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate('/');
  };

  const isAdmin = () => {
    return currentUser?.isAdmin === true;
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        register,
        login,
        logout,
        isAdmin,
        authError,
        successMessage,
      }}
    >
      <CurrentUserContext.Provider value={currentUser}>
        {children}
      </CurrentUserContext.Provider>
    </AuthContext.Provider>
  );
};

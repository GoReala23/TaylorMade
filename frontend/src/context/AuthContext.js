import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Auth from '../utils/Auth';
import CurrentUserContext from './CurrentUserContext';
import { useError } from './ErrorsContext';

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
  const { triggerError, triggerSuccess, successMessage, errorMessage } =
    useError();
  const navigate = useNavigate();
  const location = useLocation();

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

  const register = async (userData) => {
    try {
      const response = await Auth.register(
        userData.name,
        userData.email,
        userData.password,
      );
      triggerSuccess('Registration successful! 🎉');

      return response;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Registration failed.';

      triggerError(msg);
    }
    return null;
  };

  const login = async (userData) => {
    try {
      const response = await Auth.login(userData.email, userData.password);

      localStorage.setItem('token', response.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(response.user));

      setCurrentUser(response.user);
      setIsLoggedIn(true);
      triggerSuccess('Login successful! 🎉');
      if (location.pathname === '/' || location.pathname === '/login') {
        navigate('/home');
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || 'Login failed.';
      console.error('[AuthContext] Login error:', msg);
      triggerError(msg);
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

  const isAdmin = () => currentUser?.isAdmin === true;

  if (isLoading) return null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        register,
        login,
        logout,
        isAdmin,
        successMessage,
        errorMessage,
      }}
    >
      <CurrentUserContext.Provider value={currentUser}>
        {children}
      </CurrentUserContext.Provider>
    </AuthContext.Provider>
  );
};

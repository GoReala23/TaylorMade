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

  const register = async (userData) => {
    try {
      const response = await Auth.register(
        userData.name,
        userData.email,
        userData.password,
      );
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (userData) => {
    try {
      const response = await Auth.login(userData.email, userData.password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('isLoggedIn', true);
      localStorage.setItem('user', JSON.stringify(response.user));
      setCurrentUser(response.user);
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
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
      value={{ currentUser, isLoggedIn, register, login, logout, isAdmin }}
    >
      <CurrentUserContext.Provider value={currentUser}>
        {children}
      </CurrentUserContext.Provider>
    </AuthContext.Provider>
  );
};

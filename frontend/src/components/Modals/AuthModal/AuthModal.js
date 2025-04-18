import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useError } from '../../../context/ErrorsContext';
import Modal from '../Modal/Modal';
import LoginModal from '../LoginModal/LoginModal';
import RegisterModal from '../RegisterModal/RegisterModal';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'login');

  const { login, register, successMessage, errorMessage } =
    useContext(AuthContext);

  useEffect(() => {
    setActiveTab(initialTab || 'login');
  }, [initialTab, isOpen]);

  const handleLogin = async (userData) => {
    await login(userData);
  };

  useEffect(() => {
    if (successMessage && activeTab === 'login') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage, activeTab, onClose]);

  useEffect(() => {
    if (
      isOpen &&
      activeTab === 'register' &&
      successMessage === 'Registration successful! 🎉'
    ) {
      const timer = setTimeout(() => {
        setActiveTab('login');
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, activeTab, successMessage]);

  const handleRegister = async (userData) => {
    await register(userData);
  };

  if (!isOpen) return null;

  let messageType = '';
  if (successMessage) {
    messageType = 'success';
  } else if (errorMessage) {
    messageType = 'error';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='auth__modal'>
        <div className='auth__modal-tabs'>
          <button
            className={`auth__modal-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`auth__modal-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? (
          <LoginModal
            isOpen={true}
            onClose={onClose}
            onLogin={handleLogin}
            onSwitchToRegister={() => setActiveTab('register')}
            message={errorMessage || successMessage}
            type={messageType}
          />
        ) : (
          <RegisterModal
            isOpen={true}
            onClose={onClose}
            onRegister={handleRegister}
            onSwitchToLogin={() => setActiveTab('login')}
            message={errorMessage || successMessage}
            type={messageType}
          />
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;

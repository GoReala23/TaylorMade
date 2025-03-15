import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import LoginModal from '../LoginModal/LoginModal';
import RegisterModal from '../RegisterModal/RegisterModal';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onLogin, onRegister, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'login');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setActiveTab(initialTab || 'login');
  }, [initialTab, isOpen]);

  // useEffect(() => {
  //   setActiveTab(initialTab || 'login');
  // }, [initialTab, isOpen]);
  // useEffect(() => {
  //   if (successMessage) {
  //     console.log('[AuthModal] Success message updated:', successMessage);
  //   }
  // }, [successMessage]);

  const handleRegister = async (userData) => {
    try {
      await onRegister(userData);
      setSuccessMessage('Registration successful! 🎉'); //  Define successMessage
      setErrorMessage('');
      console.log('[AuthModal] Success message set:', successMessage);

      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab('login'); //  Switch to login after 3 sec
      }, 3000);
    } catch (error) {
      const errorMsg =
        error.message || 'Registration failed. Please try again.';
      setErrorMessage(errorMsg);
      setSuccessMessage('');
      console.log('[AuthModal] Error message set:', errorMsg);

      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleLogin = async (userData) => {
    try {
      await onLogin(userData);
      setSuccessMessage('Login successful! '); //  Define successMessage
      setErrorMessage('');
      console.log('[AuthModal] Success message set:', successMessage);

      setTimeout(() => {
        setSuccessMessage('');
        onClose(); //  Close modal after success
      }, 3000);
    } catch (error) {
      const errorMsg = error.message;
      console.log(errorMsg);
      setErrorMessage(errorMsg);
      setSuccessMessage('');
      console.log('[AuthModal] Error message set:', errorMsg);

      setTimeout(() => {
        setErrorMessage('');
      }, 10000);
    }
  };

  if (!isOpen) return null;

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
            successMessage={successMessage} //  Pass successMessage
            errorMessage={errorMessage} // Pass errorMessage
          />
        ) : (
          <RegisterModal
            isOpen={true}
            onClose={onClose}
            onRegister={handleRegister}
            onSwitchToLogin={() => setActiveTab('login')}
            successMessage={successMessage} //  Pass successMessage
            errorMessage={errorMessage} //  Pass errorMessage
          />
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;

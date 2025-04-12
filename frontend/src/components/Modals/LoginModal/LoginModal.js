import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ModalWithForm from '../ModalWithForm/ModalWithForm';
import { AuthContext } from '../../../context/AuthContext';
import useFormAndValidation from '../../../hooks/useFormAndValidation';

const LoginModal = ({
  isOpen,
  onClose,
  onLogin,
  onSwitchToRegister,
  message,
  type,
}) => {
  const { values, handleChange, errors, isValid, resetForm } =
    useFormAndValidation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await onLogin({ email: values.email, password: values.password });

        if (
          location.pathname !== '/home' &&
          location.pathname !== '/products'
        ) {
          navigate('/');
        }
        resetForm();
      } catch (error) {
        console.error('Login Failed:', error);
      }
    },
    [onLogin, values, resetForm, onClose, navigate, location.pathname],
  );

  return (
    <ModalWithForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title='Login'
      buttonText='Log In'
      isSubmitDisabled={!isValid}
      formTabSwitch={onSwitchToRegister}
      switchText='Need to register?'
      successMessage={type === 'success' ? message : null}
      errorMessage={type === 'error' ? message : null}
    >
      <label className='modal__form-label'>
        Email
        <input
          className='modal__form-input'
          type='email'
          name='email'
          value={values.email || ''}
          onChange={handleChange}
          required
        />
        <span className='modal__form-error'>{errors.email}</span>
      </label>
      <label className='modal__form-label'>
        Password
        <input
          className='modal__form-input'
          type='password'
          name='password'
          value={values.password || ''}
          onChange={handleChange}
          required
        />
        <span className='modal__form-error'>{errors.password}</span>
      </label>
    </ModalWithForm>
  );
};

export default LoginModal;

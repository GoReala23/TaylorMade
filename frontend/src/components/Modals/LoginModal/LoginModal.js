import React, { useCallback, useContext, useState } from 'react';
import ModalWithForm from '../ModalWithForm/ModalWithForm';
import { AuthContext } from '../../../context/AuthContext';
import useFormAndValidation from '../../../hooks/useFormAndValidation';

const LoginModal = ({
  isOpen,
  onClose,
  onLogin,
  onSwitchToRegister,
  successMessage,
  errorMessage,
}) => {
  const {
    login,
    authError,
    successMessage: contextSuccessMessage,
  } = useContext(AuthContext);
  const { values, handleChange, errors, isValid, resetForm } =
    useFormAndValidation();
  const [localSuccessMessage, setLocalSuccessMessage] = useState('');
  const [localErrorMessage, setLocalErrorMessage] = useState('');

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await onLogin({ email: values.email, password: values.password });
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      } catch (error) {
        console.error('Login Failed:', error);
      }
    },
    [onLogin, values, resetForm, onClose],
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
      successMessage={successMessage}
      errorMessage={authError || errorMessage}
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

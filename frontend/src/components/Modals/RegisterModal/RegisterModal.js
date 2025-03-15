import React, { useContext } from 'react';
import ModalWithForm from '../ModalWithForm/ModalWithForm';
import useFormAndValidation from '../../../hooks/useFormAndValidation';
import { AuthContext } from '../../../context/AuthContext';

const RegisterModal = ({ isOpen, onClose, onRegister, onSwitchToLogin }) => {
  const { register, authError, successMessage, errorMessage } =
    useContext(AuthContext);
  const { values, handleChange, errors, isValid, resetForm } =
    useFormAndValidation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onRegister(values);
      resetForm();
    } catch (error) {
      console.error('Registration Failed:', error);
    }
  };
  return (
    <ModalWithForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title='Register'
      buttonText='Sign Up'
      isSubmitDisabled={!isValid}
      formTabSwitch={onSwitchToLogin}
      switchText='Already have an account?'
      successMessage={successMessage}
      errorMessage={errorMessage || authError}
    >
      <label className='modal__form-label'>
        Name
        <input
          className='modal__form-input'
          type='text'
          name='name'
          value={values.name || ''}
          onChange={handleChange}
          required
        />
        <span className='modal__form-error'>{errors.name}</span>
      </label>
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

export default RegisterModal;

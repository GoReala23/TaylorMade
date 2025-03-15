import { useState, useCallback, useEffect } from 'react';
import validator from 'validator';

export default function useFormAndValidation() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (fieldName, fieldValue) => {
    const newErrors = { ...errors };

    if (fieldName === 'email') {
      newErrors.email = validator.isEmail(fieldValue) ? '' : 'Invalid email';
    } else if (fieldName === 'password') {
      const passwordErrors = [];
      if (!validator.isLength(fieldValue, { min: 8 })) {
        passwordErrors.push('Password must be at least 8 characters');
      }
      if (!/[A-Z]/.test(fieldValue)) {
        passwordErrors.push(
          'Password must contain at least one uppercase letter',
        );
      }
      if (!/[a-z]/.test(fieldValue)) {
        passwordErrors.push(
          'Password must contain at least one lowercase letter',
        );
      }
      if (!/\d{2}/.test(fieldValue)) {
        passwordErrors.push('Password must contain at least two digits');
      }
      if (/\s/.test(fieldValue)) {
        passwordErrors.push('Password must not contain spaces');
      }
      newErrors.password = passwordErrors.join(', ');
    } else if (fieldName === 'name') {
      newErrors.name = fieldValue.trim() === '' ? 'Name is required' : '';
    }

    setErrors(newErrors);
    setIsValid(
      Object.values(newErrors).every((err) => err === '') &&
        Object.values(values).every((val) => val !== ''),
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => {
      const newValues = { ...prevValues, [name]: value };
      validateField(name, value);
      return newValues;
    });
  };

  const resetForm = useCallback(
    (newValues = {}, newErrors = {}, newIsValid = false) => {
      setValues(newValues);
      setErrors(newErrors);
      setIsValid(newIsValid);
    },
    [setValues, setErrors, setIsValid],
  );

  return {
    values,
    handleChange,
    errors,
    isValid,
    resetForm,
    setValues,
    setIsValid,
  };
}

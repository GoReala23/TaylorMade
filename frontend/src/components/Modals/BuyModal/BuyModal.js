import React, { useEffect, useState } from 'react';
import { useOrders } from '../../../context/OrdersContext';
import ModalWithForm from '../ModalWithForm/ModalWithForm';
import useFormAndValidation from '../../../hooks/useFormAndValidation';
import Api from '../../../utils/Api';
import './BuyModal.css';

const BuyModal = ({
  isOpen,
  onClose,
  product,
  quantity,
  onSwitchToRegister,
  onPurchase,
  isFeatured = false,
}) => {
  const { values, handleChange, errors, isValid } = useFormAndValidation();
  const { createOrder } = useOrders();
  const [submitStatus, setSubmitStatus] = useState({ success: '', error: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setSubmitStatus({ success: '', error: '' });
      setIsSubmitting(false);
    }
  }, [isOpen, product, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setSubmitStatus({ success: '', error: '' });
    try {
      const token = localStorage.getItem('token');
      if (!product || !product._id) {
        throw new Error('Invalid product data');
      }
      if (!values.name || !values.email || !values.address) {
        throw new Error('Please fill in all required fields');
      }

      setSubmitStatus({ success: 'Order placed successfully!', error: '' });
      setTimeout(() => {
        onPurchase(product, quantity, values.address);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error placing order:', error);
      setSubmitStatus({
        success: '',
        error: error.message || 'Failed to place order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`buy__modal ${isOpen ? 'open' : ''}`}>
      <ModalWithForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={`Buy ${product?.name || ''}`}
        buttonText={isSubmitting ? 'Processing...' : 'Submit'}
        isSubmitDisabled={!isValid || isSubmitting}
        formTabSwitch={onSwitchToRegister}
        switchText='Need to register?'
        successMessage={submitStatus.success}
        errorMessage={submitStatus.error}
      >
        <label className='buy__modal-form-label'>Name</label>
        <input
          className='buy__modal-form-input'
          type='text'
          name='name'
          value={values.name || ''}
          onChange={handleChange}
          required
        />
        <span className='buy__modal-form-error'>{errors.name}</span>

        <label className='buy__modal-form-label'>Email</label>
        <input
          className='buy__modal-form-input'
          type='email'
          name='email'
          value={values.email || ''}
          onChange={handleChange}
          required
        />
        <span className='buy__modal-form-error'>{errors.email}</span>

        <label className='buy__modal-form-label'>Address</label>
        <input
          className='buy__modal-form-input'
          type='text'
          name='address'
          value={values.address || ''}
          onChange={handleChange}
          required
        />
        <span className='buy__modal-form-error'>{errors.address}</span>
      </ModalWithForm>
    </div>
  );
};

export default BuyModal;

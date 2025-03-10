import React, { useEffect } from 'react';
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
}) => {
  const { values, handleChange, errors, isValid } = useFormAndValidation();

  useEffect(() => {}, [isOpen, product, quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const token = localStorage.getItem('token');

      if (!product || !product._id) throw new Error('Invalid product data');
      await Api.createOrder(
        product._id || product.id,
        quantity,
        values.address,
        token,
      );
      onPurchase();
      onClose();
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className={`buy__modal ${isOpen ? 'open' : ''}`}>
      <ModalWithForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={`Buy ${product?.name || ''}`}
        buttonText='Submit'
        isSubmitDisabled={!isValid}
        formTabSwitch={onSwitchToRegister}
        switchText='Need to register?'
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

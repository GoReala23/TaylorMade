import Modal from '../Modal/Modal';
import './ModalWithForm.css';
import { useError } from '../../../context/ErrorsContext';

const ModalWithForm = ({
  isOpen,
  children,
  buttonText,
  title,
  onClose,
  onSubmit,
  isSubmitDisabled,
  formTabSwitch,
  switchText,
  successMessage,
  errorMessage,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='modal__content'>
        <h3 className='modal__title'>{title}</h3>
        <form className='modal__form' onSubmit={onSubmit}>
          <div className=' modal__form-alert'>
            {successMessage && (
              <p className=' modal__form-success'>{successMessage}</p>
            )}
            {errorMessage && (
              <p className='  modal__form-error-alert'>{errorMessage}</p>
            )}
          </div>
          {children}
          <button
            className='modal__form-submit'
            type='submit'
            disabled={isSubmitDisabled}
          >
            {buttonText}
          </button>
          {formTabSwitch && (
            <button
              type='button'
              className='modal__form-switch'
              onClick={formTabSwitch}
            >
              {switchText}
            </button>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default ModalWithForm;

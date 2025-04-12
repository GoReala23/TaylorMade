import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { FaHeart, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../context/CartContext';
import { AuthContext } from '../../../context/AuthContext';
import AuthModal from '../AuthModal/AuthModal';
import './PreviewOverlay.css';

const PreviewOverlay = ({
  isOpen,
  onClose,
  product,
  onQuantityChange,
  quantity,
  isFeatured = false,
  isLiked,
  onFavorite,
  onBuyNow,
}) => {
  const { isLoggedIn } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !product) return null;

  const handleAddToCart = async () => {
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleBuyNow = () => {
    if (typeof onBuyNow === 'function') {
      onClose();
      onBuyNow(product);
    }
  };

  return (
    <div className='preview__overlay' onClick={onClose}>
      <div className='preview__container' onClick={(e) => e.stopPropagation()}>
        <button className='preview__close' onClick={onClose}>
          &times;
        </button>
        <div className='preview__image-container'>
          <img
            src={product.imageUrl}
            alt={product.name}
            className='preview__image'
          />
          <div className='preview__icons'>
            {product.isFeatured && (
              <FaStar className='preview__star-icon' color='gold' size={24} />
            )}
            <FaHeart
              className={`preview__heart-icon ${isLiked ? 'liked' : 'unliked'}`}
              size={24}
              onClick={(e) => {
                e.stopPropagation();
                if (onFavorite) {
                  onFavorite(product);
                }
              }}
            />
          </div>
        </div>
        <div className='preview__content'>
          <h3 className='preview__title'>{product.name}</h3>
          <p className='preview__description'>{product.description}</p>
          <div className='preview__price-container'>
            <p className='preview__price'>${product.price}</p>
            <div className='preview__quantity-controls'>
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => onQuantityChange(quantity + 1)}>+</button>
            </div>
            <p className='card__price-per-quantity'>
              Total: ${(product.price * quantity).toFixed(2)}
            </p>
          </div>
          <div className='preview__actions'>
            {!isLoggedIn ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className='preview__button'
              >
                Log-in to Purchase
              </button>
            ) : (
              <>
                <button onClick={handleAddToCart} className='preview__button'>
                  Add to Cart
                </button>
                <button onClick={handleBuyNow} className='preview__button'>
                  Buy Now
                </button>
              </>
            )}
            {isAuthModalOpen && (
              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                // onLogin={() => navigate('/login')}
                onRegister={() => navigate('/register')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

PreviewOverlay.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onQuantityChange: PropTypes.func,
  quantity: PropTypes.number,
  isFeatured: PropTypes.bool,
  isLiked: PropTypes.bool,
  onFavorite: PropTypes.func,
  onBuyNow: PropTypes.func.isRequired,
};

export default PreviewOverlay;

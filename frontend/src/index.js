import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './index.css';
import App from './components/App/App';
import { AuthProvider } from './context/AuthContext';
import { FeaturedProductsProvider } from './context/FeaturedProductsContext';
import { ProductsProvider } from './context/ProductsContext';
import reportWebVitals from './reportWebVitals';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <ProductsProvider>
          {' '}
          <FeaturedProductsProvider>
            <FavoritesProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </FavoritesProvider>
          </FeaturedProductsProvider>
        </ProductsProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);

reportWebVitals();

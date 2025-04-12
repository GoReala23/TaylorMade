import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './index.css';
import App from './components/App/App';
import { AuthProvider } from './context/AuthContext';
import { FeaturedProductsProvider } from './context/FeaturedProductsContext';
import { ProductsProvider } from './context/ProductsContext';
import { BackupProductProvider } from './context/BackupProductContext';
import reportWebVitals from './reportWebVitals';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ErrorProvider } from './context/ErrorsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <ErrorProvider>
        <AuthProvider>
          <ProductsProvider>
            {' '}
            <FeaturedProductsProvider>
              <BackupProductProvider>
                {' '}
                <FavoritesProvider>
                  <CartProvider>
                    <OrdersProvider>
                      <App />
                    </OrdersProvider>
                  </CartProvider>
                </FavoritesProvider>
              </BackupProductProvider>
            </FeaturedProductsProvider>
          </ProductsProvider>
        </AuthProvider>
      </ErrorProvider>
    </HashRouter>
  </React.StrictMode>,
);

reportWebVitals();

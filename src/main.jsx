import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <CartProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </CartProvider>
        </AuthProvider>
    </StrictMode>
);

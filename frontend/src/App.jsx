import React from 'react';
import { AuthProvider } from './store/authStore';
import { LanguageProvider } from './store/languageStore';
import { CartProvider } from './store/cartStore';
import { LocationProvider } from './store/locationStore';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartService } from '../services';
import { AuthContext } from './authStore';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.getCart();
      setCart(res.data.data || { items: [] });
    } catch (err) {
      // Cart might be empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1, purchaseType = 'RETAIL') => {
    const res = await cartService.addToCart({ productId, quantity, purchaseType });
    setCart(res.data.data);
    return res.data;
  };

  const removeFromCart = async (productId) => {
    const res = await cartService.removeFromCart(productId);
    setCart(res.data.data);
  };

  const itemCount = cart.items ? cart.items.reduce((sum, i) => sum + (i.quantity || 1), 0) : 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, fetchCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

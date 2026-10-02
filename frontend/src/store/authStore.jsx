import React, { createContext, useReducer, useEffect } from 'react';
import { authService } from '../services';
import { setAccessToken, getAccessToken } from '../services/api';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true, user: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const res = await authService.getMe();
        if (res.data?.data) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.data });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        setAccessToken(null);
        dispatch({ type: 'LOGOUT' });
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    return user;
  };

  const register = async ({ name, email, password }) => {
    const res = await authService.register({ name, email, password });
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore logout errors
    }
    setAccessToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

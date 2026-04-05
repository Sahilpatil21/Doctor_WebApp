import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authAPI } from '../services/api';

const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
};

const readStorage = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`Unable to read ${key} from storage:`, error);
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Unable to write ${key} to storage:`, error);
  }
};

const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Unable to remove ${key} from storage:`, error);
  }
};

const getStoredToken = () => readStorage(STORAGE_KEYS.token);

const getStoredUser = () => {
  const rawUser = readStorage(STORAGE_KEYS.user);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.error('Unable to parse stored user:', error);
    removeStorage(STORAGE_KEYS.user);
    return null;
  }
};

const clearStoredAuth = () => {
  removeStorage(STORAGE_KEYS.token);
  removeStorage(STORAGE_KEYS.user);
};

const persistAuth = ({ token, user }) => {
  if (token) {
    writeStorage(STORAGE_KEYS.token, token);
  }

  if (user) {
    writeStorage(STORAGE_KEYS.user, JSON.stringify(user));
  }
};

const getAuthErrorMessage = (error, fallbackMessage) =>
  error?.errors?.[0]?.msg || error?.message || fallbackMessage;

const storedToken = getStoredToken();
const storedUser = getStoredUser();

// Initial state
const initialState = {
  user: storedUser,
  token: storedToken,
  loading: Boolean(storedToken),
  isAuthenticated: Boolean(storedToken && storedUser),
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from token
  const loadUser = async () => {
    const token = getStoredToken();
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
      return;
    }

    try {
      const profile = await authAPI.getProfile();
      persistAuth({ token, user: profile });

      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: profile,
      });
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
      clearStoredAuth();
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const { user, token } = await authAPI.login(credentials);
      persistAuth({ user, token });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      clearStoredAuth();
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: getAuthErrorMessage(error, 'Login failed'),
      });
      return { success: false, error: getAuthErrorMessage(error, 'Login failed') };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const { user, token } = await authAPI.register(userData);
      persistAuth({ user, token });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      clearStoredAuth();
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: getAuthErrorMessage(error, 'Registration failed'),
      });
      return { success: false, error: getAuthErrorMessage(error, 'Registration failed') };
    }
  };

  // Logout function
  const logout = () => {
    clearStoredAuth();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile function
  const updateProfile = (profileData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_PROFILE,
      payload: profileData,
    });
  };

  // Check authentication on mount
  useEffect(() => {
    if (storedToken) {
      loadUser();
    }
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

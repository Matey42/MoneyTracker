import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { loginFailure, setUser, logout } from '../features/auth/authSlice';
import { authService } from '../api/authService';
import { isAuthApiEnabled } from '../config/appConfig';

const AuthBootstrap = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthApiEnabled || !isAuthenticated || user) {
      return;
    }

    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          dispatch(setUser(currentUser));
        }
      } catch (error) {
        dispatch(loginFailure(error instanceof Error ? error.message : 'Failed to restore session'));
        dispatch(logout());
      }
    };

    loadUser();
  }, [dispatch, isAuthenticated, user]);

  return null;
};

export default AuthBootstrap;

import { Navigate } from 'react-router-dom';
import { Box, Container, useTheme } from '@mui/material';
import { useAppSelector } from '../hooks/useAppStore';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {children}
      </Container>
    </Box>
  );
};

export default AuthLayout;

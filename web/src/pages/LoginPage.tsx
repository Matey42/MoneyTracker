import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { loginSuccess, loginFailure, loginStart, clearError } from '../features/auth/authSlice';
import { authService } from '../api/authService';
import { isDevMode } from '../config/appConfig';
import logoLight from '../assets/mt_light.png';
import logoDark from '../assets/mt_dark.png';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState({
    email: isDevMode ? DEMO_EMAIL : '',
    password: isDevMode ? DEMO_PASSWORD : '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) dispatch(clearError());
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    dispatch(loginStart());

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      dispatch(loginSuccess({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }));
      navigate('/dashboard');
    } catch (err) {
      dispatch(loginFailure(err instanceof Error ? err.message : 'Login failed'));
    }
  };

  return (
    <Card sx={{ borderRadius: 4, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            sx={{
              height: 120,
              width: '100%',
              overflow: 'hidden',
              mb: -1,
              pointerEvents: 'none',
              userSelect: 'none',
              caretColor: 'transparent',
            }}
          >
            <Box
              component="img"
              src={isDarkMode ? logoDark : logoLight}
              alt="MoneyTracker logo"
              draggable={false}
              sx={{
                height: '100%',
                width: '100%',
                objectFit: 'contain',
                transform: 'scale(1.6)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back
          </Typography>
          <Typography color="text.secondary">
            Sign in to your MoneyTracker account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isDevMode && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 2, opacity: 0.9 }}>
            <Typography variant="body2" color="info.contrastText">
              <strong>Demo credentials:</strong><br />
              Email: {DEMO_EMAIL}<br />
              Password: {DEMO_PASSWORD}
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ mb: 2 }}
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            sx={{ mb: 3 }}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          <Typography align="center" color="text.secondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" fontWeight={600}>
              Sign up
            </Link>
          </Typography>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;

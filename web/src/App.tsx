import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import { theme } from './utils/theme';
import { AuthLayout, MainLayout } from './layouts';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  WalletsPage,
  WalletDetailPage,
  TransactionsPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
            <Route path="/wallets" element={<MainLayout><WalletsPage /></MainLayout>} />
            <Route path="/wallets/:id" element={<MainLayout><WalletDetailPage /></MainLayout>} />
            <Route path="/transactions" element={<MainLayout><TransactionsPage /></MainLayout>} />
            <Route path="/liabilities" element={<MainLayout><DashboardPage /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><DashboardPage /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><DashboardPage /></MainLayout>} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App

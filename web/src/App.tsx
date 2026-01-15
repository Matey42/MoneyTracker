import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { store } from './store';
import { ColorModeProvider } from './contexts/ColorModeContext';
import { AuthLayout, MainLayout } from './layouts';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  WalletsPage,
  WalletDetailPage,
  TransactionsPage,
  NotFoundPage,
  ReportsPage,
  LiabilitiesPage,
  SettingsPage,
  ProfilePage,
} from './pages';

function AppContent() {
  return (
    <>
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
          <Route path="/reports" element={<MainLayout><ReportsPage /></MainLayout>} />
          <Route path="/liabilities" element={<MainLayout><LiabilitiesPage /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ColorModeProvider>
        <AppContent />
      </ColorModeProvider>
    </Provider>
  );
}

export default App

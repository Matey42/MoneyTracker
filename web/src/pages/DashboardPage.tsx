import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppStore';
import { formatCurrency, formatDate, getWalletTypeColor } from '../utils/formatters';
import type { DashboardData, Transaction, Wallet } from '../types';

// Mock data for development
const mockDashboardData: DashboardData = {
  totalBalance: 15420.50,
  monthlyIncome: 8500.00,
  monthlyExpense: 4230.75,
  wallets: [
    { id: '1', name: 'Personal Account', type: 'PERSONAL', currency: 'PLN', balance: 8500.50, isOwner: true, createdAt: '2024-01-01' },
    { id: '2', name: 'Family Budget', type: 'FAMILY', currency: 'PLN', balance: 4200.00, isOwner: true, createdAt: '2024-01-15' },
    { id: '3', name: 'Savings', type: 'SAVINGS', currency: 'PLN', balance: 2720.00, isOwner: true, createdAt: '2024-02-01' },
  ],
  recentTransactions: [
    { id: '1', walletId: '1', userId: '1', type: 'EXPENSE', amount: 125.50, currency: 'PLN', description: 'Groceries', categoryName: 'Groceries', categoryIcon: 'shopping_cart', categoryColor: '#FF9800', transactionDate: '2024-12-13', createdAt: '2024-12-13' },
    { id: '2', walletId: '1', userId: '1', type: 'INCOME', amount: 5000.00, currency: 'PLN', description: 'Salary', categoryName: 'Salary', categoryIcon: 'work', categoryColor: '#4CAF50', transactionDate: '2024-12-10', createdAt: '2024-12-10' },
    { id: '3', walletId: '2', userId: '1', type: 'EXPENSE', amount: 89.99, currency: 'PLN', description: 'Netflix subscription', categoryName: 'Entertainment', categoryIcon: 'movie', categoryColor: '#9C27B0', transactionDate: '2024-12-09', createdAt: '2024-12-09' },
    { id: '4', walletId: '1', userId: '1', type: 'EXPENSE', amount: 450.00, currency: 'PLN', description: 'Electric bill', categoryName: 'Bills & Utilities', categoryIcon: 'receipt', categoryColor: '#607D8B', transactionDate: '2024-12-08', createdAt: '2024-12-08' },
    { id: '5', walletId: '3', userId: '1', type: 'INCOME', amount: 500.00, currency: 'PLN', description: 'Transfer to savings', categoryName: 'Other Income', categoryIcon: 'attach_money', categoryColor: '#9C27B0', transactionDate: '2024-12-05', createdAt: '2024-12-05' },
  ],
  categoryBreakdown: [
    { categoryId: '1', categoryName: 'Groceries', categoryColor: '#FF9800', amount: 850.00, percentage: 35 },
    { categoryId: '2', categoryName: 'Bills & Utilities', categoryColor: '#607D8B', amount: 650.00, percentage: 27 },
    { categoryId: '3', categoryName: 'Entertainment', categoryColor: '#9C27B0', amount: 450.00, percentage: 18 },
    { categoryId: '4', categoryName: 'Transport', categoryColor: '#2196F3', amount: 300.00, percentage: 12 },
    { categoryId: '5', categoryName: 'Other', categoryColor: '#9E9E9E', amount: 200.00, percentage: 8 },
  ],
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              {trend}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setData(mockDashboardData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {getGreeting()}, {user?.firstName || 'User'}!
        </Typography>
        <Typography color="text.secondary">
          Here's an overview of your finances
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Total Balance"
            value={formatCurrency(data?.totalBalance || 0)}
            icon={<WalletIcon />}
            color="#2563eb"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Monthly Income"
            value={formatCurrency(data?.monthlyIncome || 0)}
            icon={<IncomeIcon />}
            color="#10b981"
            trend="+12% from last month"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(data?.monthlyExpense || 0)}
            icon={<ExpenseIcon />}
            color="#ef4444"
            trend="-5% from last month"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Wallets */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  My Wallets
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/wallets/new')}
                >
                  Add Wallet
                </Button>
              </Box>

              <List disablePadding>
                {data?.wallets.map((wallet: Wallet) => (
                  <ListItem
                    key={wallet.id}
                    sx={{
                      px: 0,
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate(`/wallets/${wallet.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getWalletTypeColor(wallet.type) }}>
                        <WalletIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={wallet.name}
                      secondary={wallet.type}
                    />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Button
                fullWidth
                sx={{ mt: 2 }}
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/wallets')}
              >
                View All Wallets
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Transactions
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/transactions/new')}
                >
                  Add Transaction
                </Button>
              </Box>

              <List disablePadding>
                {data?.recentTransactions.slice(0, 5).map((transaction: Transaction) => (
                  <ListItem
                    key={transaction.id}
                    sx={{
                      px: 0,
                      borderRadius: 2,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: transaction.categoryColor || (transaction.type === 'INCOME' ? '#10b981' : '#ef4444'),
                        }}
                      >
                        {transaction.type === 'INCOME' ? <IncomeIcon /> : <ExpenseIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={transaction.description || transaction.categoryName}
                      secondary={formatDate(transaction.transactionDate)}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </Typography>
                      <Chip
                        label={transaction.categoryName}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Button
                fullWidth
                sx={{ mt: 2 }}
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/transactions')}
              >
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending by Category */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Spending by Category
              </Typography>

              <Grid container spacing={2}>
                {data?.categoryBreakdown.map((category) => (
                  <Grid key={category.categoryId} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: `${category.categoryColor}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" fontWeight={700} color={category.categoryColor}>
                          {category.percentage}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {category.categoryName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(category.amount)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

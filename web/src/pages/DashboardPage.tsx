import { useEffect, useMemo, useState } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getWalletColor, getWalletLabel } from '../utils/walletConfig';
import type { CategoryBreakdown, DashboardData, Transaction, Wallet } from '../types';

// Mock data for development
const mockDashboardData: DashboardData = {
  totalBalance: 15420.50,
  monthlyIncome: 8500.00,
  monthlyExpense: 4230.75,
  wallets: [
    { id: '1', name: 'Personal Account', type: 'BANK', currency: 'PLN', balance: 8500.50, isOwner: true, isShared: false, createdAt: '2024-01-01' },
    { id: '2', name: 'Family Budget', type: 'BANK', currency: 'PLN', balance: 4200.00, isOwner: true, isShared: true, memberCount: 3, createdAt: '2024-01-15' },
    { id: '3', name: 'Savings', type: 'BANK', currency: 'PLN', balance: 2720.00, isOwner: true, isShared: false, createdAt: '2024-02-01' },
  ],
  recentTransactions: [
    { id: '1', walletId: '1', userId: '1', type: 'EXPENSE', amount: 125.50, currency: 'PLN', description: 'Groceries', categoryId: 'groceries', transactionDate: '2024-12-13' },
    { id: '2', walletId: '1', userId: '1', type: 'INCOME', amount: 5000.00, currency: 'PLN', description: 'Salary', categoryId: 'salary', transactionDate: '2024-12-10' },
    { id: '3', walletId: '2', userId: '1', type: 'EXPENSE', amount: 89.99, currency: 'PLN', description: 'Netflix subscription', categoryId: 'entertainment', transactionDate: '2024-12-09' },
    { id: '4', walletId: '1', userId: '1', type: 'EXPENSE', amount: 450.00, currency: 'PLN', description: 'Electric bill', categoryId: 'bills', transactionDate: '2024-12-08' },
    { id: '5', walletId: '3', userId: '1', type: 'INCOME', amount: 500.00, currency: 'PLN', description: 'Transfer to savings', categoryId: 'transfer', transactionDate: '2024-12-05' },
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
  <Card
    sx={{
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      background: `linear-gradient(135deg, ${alpha(color, 0.12)}, ${alpha(color, 0.02)})`,
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom sx={{ letterSpacing: 0.4 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          {trend && (
            <Typography
              variant="body2"
              color={trend.trim().startsWith('-') ? 'error.main' : 'success.main'}
              sx={{ mt: 1 }}
            >
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

  const cashflowTrend = [520, -180, 640, -320, 780, -210, 460];
  const monthlyBudget = 6500;
  const maxCashflowMagnitude = Math.max(...cashflowTrend.map((item) => Math.abs(item)), 1);

  const summary = useMemo(() => {
    const monthlyIncome = data?.monthlyIncome ?? 0;
    const monthlyExpense = data?.monthlyExpense ?? 0;
    const netCashflow = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? netCashflow / monthlyIncome : 0;
    const avgDailySpend = monthlyExpense / 30;
    const topCategory = data?.categoryBreakdown.reduce((best, current) => {
      if (!best || current.amount > best.amount) return current;
      return best;
    }, undefined as CategoryBreakdown | undefined);
    const budgetUsed = monthlyBudget > 0 ? (monthlyExpense / monthlyBudget) * 100 : 0;

    return {
      netCashflow,
      savingsRate,
      avgDailySpend,
      topCategory,
      budgetUsed,
    };
  }, [data, monthlyBudget]);

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
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {getGreeting()}, {user?.firstName || 'User'}!
          </Typography>
          <Typography color="text.secondary">
            Here's a clear snapshot of your finances this month.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip label="This month" variant="outlined" color="primary" />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/transactions/new')}
          >
            New transaction
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Balance"
            value={formatCurrency(data?.totalBalance || 0)}
            icon={<WalletIcon />}
            color="#2563eb"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Monthly Income"
            value={formatCurrency(data?.monthlyIncome || 0)}
            icon={<IncomeIcon />}
            color="#10b981"
            trend="+12% from last month"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(data?.monthlyExpense || 0)}
            icon={<ExpenseIcon />}
            color="#ef4444"
            trend="-5% from last month"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Net Cashflow"
            value={formatCurrency(summary.netCashflow)}
            icon={<IncomeIcon />}
            color="#0ea5e9"
            trend={`${Math.round(summary.savingsRate * 100)}% saved`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={3}>
            {/* Cashflow */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Cashflow Overview
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Net movement over the last 7 days
                      </Typography>
                    </Box>
                    <Chip
                      label={`${Math.round(summary.savingsRate * 100)}% savings rate`}
                      color={summary.netCashflow >= 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg. daily spend
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(summary.avgDailySpend)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Top category
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {summary.topCategory?.categoryName || '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Budget used
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {Math.round(summary.budgetUsed)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, mt: 3, height: 120 }}>
                    {cashflowTrend.map((value, index) => {
                      const height = Math.round((Math.abs(value) / maxCashflowMagnitude) * 90) + 14;
                      return (
                        <Box key={`${value}-${index}`} sx={{ flex: 1, textAlign: 'center' }}>
                          <Box
                            sx={{
                              height,
                              borderRadius: 2,
                              bgcolor: value >= 0 ? 'success.main' : 'error.main',
                              opacity: 0.85,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            D{index + 1}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(summary.budgetUsed, 100)}
                      sx={{ height: 8, borderRadius: 999 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(data?.monthlyExpense || 0)} of {formatCurrency(monthlyBudget)} budget
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Transactions */}
            <Grid size={{ xs: 12 }}>
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
                    {data?.recentTransactions.slice(0, 5).map((transaction: Transaction, index, items) => (
                      <ListItem
                        key={transaction.id}
                        divider={index < items.length - 1}
                        sx={{
                          px: 0,
                          borderRadius: 2,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: transaction.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
                            {transaction.type === 'INCOME' ? <IncomeIcon /> : <ExpenseIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={transaction.description || transaction.categoryId}
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
                            label={transaction.categoryId || 'Uncategorized'}
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
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Grid container spacing={3}>
            {/* Wallets */}
            <Grid size={{ xs: 12 }}>
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
                    {data?.wallets.map((wallet: Wallet, index, items) => (
                      <ListItem
                        key={wallet.id}
                        divider={index < items.length - 1}
                        sx={{
                          px: 0,
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate(`/wallets/${wallet.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getWalletColor(wallet.type) }}>
                            <WalletIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={wallet.name}
                          secondary={getWalletLabel(wallet.type)}
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

            {/* Spending by Category */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Spending by Category
                    </Typography>
                    <Chip label="This month" size="small" variant="outlined" />
                  </Box>

                  <List disablePadding>
                    {data?.categoryBreakdown.map((category, index, items) => (
                      <ListItem
                        key={category.categoryId}
                        divider={index < items.length - 1}
                        sx={{ px: 0, alignItems: 'stretch' }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: category.categoryColor,
                                }}
                              />
                              <Typography variant="body2" fontWeight={600}>
                                {category.categoryName}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(category.amount)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={category.percentage}
                            sx={{
                              height: 8,
                              borderRadius: 999,
                              bgcolor: alpha(category.categoryColor, 0.15),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: category.categoryColor,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {category.percentage}% of spending
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

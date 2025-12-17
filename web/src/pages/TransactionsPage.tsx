import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import type { Transaction, TransactionType, Category, Wallet } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

// Mock wallets data
const mockWallets: Wallet[] = [
  { id: '1', name: 'Personal Account', type: 'PERSONAL', currency: 'PLN', balance: 8500.50, isOwner: true, createdAt: '2024-01-01' },
  { id: '2', name: 'Family Budget', type: 'FAMILY', currency: 'PLN', balance: 4200.00, isOwner: true, createdAt: '2024-01-15' },
  { id: '3', name: 'Emergency Savings', type: 'SAVINGS', currency: 'PLN', balance: 15000.00, isOwner: true, createdAt: '2024-02-01' },
];

// Mock data
const mockTransactions: Transaction[] = [
  { id: '1', walletId: '1', userId: '1', type: 'EXPENSE', amount: 125.50, currency: 'PLN', description: 'Weekly groceries at Biedronka', categoryId: '1', categoryName: 'Groceries', categoryIcon: 'shopping_cart', categoryColor: '#FF9800', transactionDate: '2024-12-13', paymentMethod: 'Card', createdAt: '2024-12-13' },
  { id: '2', walletId: '1', userId: '1', type: 'INCOME', amount: 5000.00, currency: 'PLN', description: 'Monthly salary', categoryId: '2', categoryName: 'Salary', categoryIcon: 'work', categoryColor: '#4CAF50', transactionDate: '2024-12-10', paymentMethod: 'Transfer', createdAt: '2024-12-10' },
  { id: '3', walletId: '2', userId: '1', type: 'EXPENSE', amount: 89.99, currency: 'PLN', description: 'Netflix subscription', categoryId: '3', categoryName: 'Entertainment', categoryIcon: 'movie', categoryColor: '#9C27B0', transactionDate: '2024-12-09', paymentMethod: 'Card', createdAt: '2024-12-09' },
  { id: '4', walletId: '1', userId: '1', type: 'EXPENSE', amount: 450.00, currency: 'PLN', description: 'Electric bill December', categoryId: '4', categoryName: 'Bills & Utilities', categoryIcon: 'receipt', categoryColor: '#607D8B', transactionDate: '2024-12-08', paymentMethod: 'Transfer', createdAt: '2024-12-08' },
  { id: '5', walletId: '3', userId: '1', type: 'INCOME', amount: 500.00, currency: 'PLN', description: 'Transfer to savings', categoryId: '5', categoryName: 'Other Income', categoryIcon: 'attach_money', categoryColor: '#9C27B0', transactionDate: '2024-12-05', paymentMethod: 'Transfer', createdAt: '2024-12-05' },
  { id: '6', walletId: '1', userId: '1', type: 'EXPENSE', amount: 65.00, currency: 'PLN', description: 'Uber rides', categoryId: '6', categoryName: 'Transport', categoryIcon: 'directions_car', categoryColor: '#2196F3', transactionDate: '2024-12-04', paymentMethod: 'Card', createdAt: '2024-12-04' },
  { id: '7', walletId: '1', userId: '1', type: 'EXPENSE', amount: 180.00, currency: 'PLN', description: 'Restaurant dinner', categoryId: '7', categoryName: 'Food & Dining', categoryIcon: 'restaurant', categoryColor: '#FF5722', transactionDate: '2024-12-03', paymentMethod: 'Card', createdAt: '2024-12-03' },
  { id: '8', walletId: '1', userId: '1', type: 'INCOME', amount: 250.00, currency: 'PLN', description: 'Freelance project', categoryId: '8', categoryName: 'Freelance', categoryIcon: 'laptop', categoryColor: '#8BC34A', transactionDate: '2024-12-02', paymentMethod: 'Transfer', createdAt: '2024-12-02' },
];

const mockCategories: Category[] = [
  { id: '1', name: 'Groceries', type: 'EXPENSE', icon: 'shopping_cart', color: '#FF9800', isSystem: true },
  { id: '2', name: 'Salary', type: 'INCOME', icon: 'work', color: '#4CAF50', isSystem: true },
  { id: '3', name: 'Entertainment', type: 'EXPENSE', icon: 'movie', color: '#9C27B0', isSystem: true },
  { id: '4', name: 'Bills & Utilities', type: 'EXPENSE', icon: 'receipt', color: '#607D8B', isSystem: true },
  { id: '5', name: 'Other Income', type: 'INCOME', icon: 'attach_money', color: '#9C27B0', isSystem: true },
  { id: '6', name: 'Transport', type: 'EXPENSE', icon: 'directions_car', color: '#2196F3', isSystem: true },
  { id: '7', name: 'Food & Dining', type: 'EXPENSE', icon: 'restaurant', color: '#FF5722', isSystem: true },
  { id: '8', name: 'Freelance', type: 'INCOME', icon: 'laptop', color: '#8BC34A', isSystem: true },
];

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [walletFilter, setWalletFilter] = useState<string>('ALL');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as TransactionType,
    amount: '',
    description: '',
    categoryId: '',
    walletId: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setTransactions(mockTransactions);
      setIsLoading(false);
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.categoryId === categoryFilter;
    const matchesWallet = walletFilter === 'ALL' || t.walletId === walletFilter;
    return matchesSearch && matchesType && matchesCategory && matchesWallet;
  });

  const getWalletName = (walletId: string) => {
    return mockWallets.find((w) => w.id === walletId)?.name || 'Unknown Wallet';
  };

  const handleCreateTransaction = () => {
    const category = mockCategories.find((c) => c.id === newTransaction.categoryId);
    const wallet = mockWallets.find((w) => w.id === newTransaction.walletId);
    const transaction: Transaction = {
      id: String(Date.now()),
      walletId: newTransaction.walletId,
      userId: '1',
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount) || 0,
      currency: wallet?.currency || 'PLN',
      description: newTransaction.description,
      categoryId: newTransaction.categoryId,
      categoryName: category?.name,
      categoryColor: category?.color,
      transactionDate: newTransaction.transactionDate,
      createdAt: new Date().toISOString(),
    };
    setTransactions([transaction, ...transactions]);
    setCreateDialogOpen(false);
    setNewTransaction({
      type: 'EXPENSE',
      amount: '',
      description: '',
      categoryId: '',
      walletId: '',
      transactionDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const totalIncome = filteredTransactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <IncomeIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="success.contrastText">
                  Total Income
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.contrastText">
                  {formatCurrency(totalIncome)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <ExpenseIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="error.contrastText">
                  Total Expenses
                </Typography>
                <Typography variant="h5" fontWeight={700} color="error.contrastText">
                  {formatCurrency(totalExpense)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Wallet</InputLabel>
                <Select
                  value={walletFilter}
                  label="Wallet"
                  onChange={(e) => setWalletFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Wallets</MenuItem>
                  {mockWallets.map((wallet) => (
                    <MenuItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'ALL')}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENSE">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Categories</MenuItem>
                  {mockCategories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Wallet</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.transactionDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: transaction.type === 'INCOME' ? 'success.light' : 'error.light',
                            width: 36,
                            height: 36,
                          }}
                        >
                          {transaction.type === 'INCOME' ? (
                            <IncomeIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          ) : (
                            <ExpenseIcon sx={{ color: 'error.main', fontSize: 20 }} />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {transaction.description || 'No description'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.paymentMethod}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<WalletIcon sx={{ fontSize: 16 }} />}
                        label={getWalletName(transaction.walletId)}
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/wallets/${transaction.walletId}`)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.categoryName}
                        size="small"
                        sx={{
                          bgcolor: `${transaction.categoryColor}20`,
                          color: transaction.categoryColor,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Wallet</InputLabel>
                <Select
                  value={newTransaction.walletId}
                  label="Wallet"
                  onChange={(e) => setNewTransaction({ ...newTransaction, walletId: e.target.value })}
                >
                  {mockWallets.map((wallet) => (
                    <MenuItem key={wallet.id} value={wallet.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WalletIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        {wallet.name} ({wallet.currency})
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTransaction.type}
                  label="Type"
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as TransactionType, categoryId: '' })}
                >
                  <MenuItem value="INCOME">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IncomeIcon sx={{ color: 'success.main' }} />
                      Income (money in)
                    </Box>
                  </MenuItem>
                  <MenuItem value="EXPENSE">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ExpenseIcon sx={{ color: 'error.main' }} />
                      Expense (money out)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">PLN</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTransaction.categoryId}
                  label="Category"
                  onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                >
                  {mockCategories
                    .filter((c) => c.type === newTransaction.type)
                    .map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: cat.color,
                            }}
                          />
                          {cat.name}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newTransaction.transactionDate}
                onChange={(e) => setNewTransaction({ ...newTransaction, transactionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTransaction}
            disabled={!newTransaction.amount || !newTransaction.categoryId || !newTransaction.walletId}
            color={newTransaction.type === 'INCOME' ? 'success' : 'error'}
          >
            {newTransaction.type === 'INCOME' ? 'Add Income' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import type { Wallet, Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getWalletLabel, getWalletColor } from '../utils/walletConfig';
import { walletsService } from '../api/wallets';
import { transactionsService } from '../api/transactions';
import { mockCategories } from '../api/mocks/transactions';

// Category lookup helpers
const getCategoryById = (id?: string) => mockCategories.find((c) => c.id === id);
const getCategoryName = (id?: string) => getCategoryById(id)?.name || 'Uncategorized';
const getCategoryColor = (id?: string) => getCategoryById(id)?.color || '#9E9E9E';

const WalletDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'EXPENSE' as TransactionType,
    amount: '',
    description: '',
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const foundWallet = id ? await walletsService.getWallet(id) : null;
        setWallet(foundWallet || null);
        const data = id ? await transactionsService.getTransactions(id) : [];
        setTransactions(data);
      } catch {
        setWallet(null);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCreateTransaction = () => {
    if (!wallet) return;
    
    const amount = parseFloat(newTransaction.amount) || 0;

    const transaction: Transaction = {
      id: String(Date.now()),
      walletId: wallet.id,
      userId: '1',
      type: newTransaction.type,
      amount,
      currency: wallet.currency,
      description: newTransaction.description,
      categoryId: newTransaction.categoryId,
      transactionDate: newTransaction.transactionDate,
    };
    
    setTransactions([transaction, ...transactions]);
    
    // Update wallet balance
    const balanceChange = newTransaction.type === 'INCOME' ? amount : -amount;
    setWallet({ ...wallet, balance: wallet.balance + balanceChange });
    
    setCreateDialogOpen(false);
    setNewTransaction({
      type: 'EXPENSE',
      amount: '',
      description: '',
      categoryId: '',
      transactionDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    if (!wallet) return;
    
    setTransactions(transactions.filter((t) => t.id !== transaction.id));
    
    // Revert wallet balance
    const balanceChange = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
    setWallet({ ...wallet, balance: wallet.balance + balanceChange });
  };

  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={100} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  if (!wallet) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Wallet not found
        </Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/wallets')}>
          Back to Wallets
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/wallets')}
        sx={{ mb: 3 }}
      >
        Back to Wallets
      </Button>

      {/* Wallet Header Card */}
      <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${getWalletColor(wallet.type)} 0%, ${getWalletColor(wallet.type)}99 100%)` }}>
        <CardContent sx={{ p: 4, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <WalletIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {wallet.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={getWalletLabel(wallet.type)}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label={wallet.currency}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
            <IconButton sx={{ color: 'white' }}>
              <EditIcon />
            </IconButton>
          </Box>

          <Typography variant="h3" fontWeight={700}>
            {formatCurrency(wallet.balance, wallet.currency)}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            Current Balance
          </Typography>

          {wallet.description && (
            <Typography sx={{ mt: 2, opacity: 0.9 }}>
              {wallet.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.light' }}>
                <IncomeIcon sx={{ color: 'success.main' }} />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Income
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  +{formatCurrency(totalIncome, wallet.currency)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.light' }}>
                <ExpenseIcon sx={{ color: 'error.main' }} />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Expenses
                </Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  -{formatCurrency(totalExpense, wallet.currency)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                <WalletIcon sx={{ color: 'primary.main' }} />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Net Change
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={totalIncome - totalExpense >= 0 ? 'success.main' : 'error.main'}
                >
                  {totalIncome - totalExpense >= 0 ? '+' : ''}
                  {formatCurrency(totalIncome - totalExpense, wallet.currency)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Transactions ({transactions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Transaction
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary" gutterBottom>
                No transactions yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Add your first transaction
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions
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
                                  {getCategoryName(transaction.categoryId)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getCategoryName(transaction.categoryId)}
                              size="small"
                              sx={{
                                bgcolor: `${getCategoryColor(transaction.categoryId)}20`,
                                color: getCategoryColor(transaction.categoryId),
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
                              onClick={() => handleDeleteTransaction(transaction)}
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
                count={transactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Transaction to "{wallet.name}"
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
                  startAdornment: <InputAdornment position="start">{wallet.currency}</InputAdornment>,
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
                placeholder="e.g., Monthly salary, Grocery shopping..."
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
            disabled={!newTransaction.amount || !newTransaction.categoryId}
            color={newTransaction.type === 'INCOME' ? 'success' : 'error'}
          >
            {newTransaction.type === 'INCOME' ? 'Add Income' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletDetailPage;

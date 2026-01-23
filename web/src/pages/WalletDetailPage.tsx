import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  useTheme,
  Tooltip,
  Alert,
} from '@mui/material';
import { alpha, darken, lighten } from '@mui/material/styles';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as TransferIcon,
  AccountBalance as BankIcon,
  ShowChart as InvestmentsIcon,
  CurrencyBitcoin as CryptoIcon,
  Home as RealEstateIcon,
  MoreHoriz as OtherIcon,
} from '@mui/icons-material';
import type { Wallet, WalletCategory, Transaction, TransactionType, Category } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getWalletLabel, getWalletColor } from '../utils/walletConfig';
import { getWalletIconEmoji, walletIconOptions } from '../utils/walletIcons';
import { walletsService } from '../api/wallets';
import { transactionsService } from '../api/transactions';
import { categoriesService } from '../api/categories';
import { useAppDispatch } from '../hooks/useAppStore';
import { fetchWalletsSuccess } from '../features/wallet/walletSlice';

// Category lookup helpers
const getCategoryById = (categories: Category[], id?: string) => categories.find((c) => c.id === id);
const getCategoryName = (categories: Category[], id?: string) => getCategoryById(categories, id)?.name || 'Uncategorized';
const getCategoryColor = (categories: Category[], id?: string) => getCategoryById(categories, id)?.color || '#9E9E9E';

type WalletDetailNavState = {
  from?: 'wallets' | 'category';
  categoryPath?: string;
  categoryLabel?: string;
};

const walletTypeOptions: WalletCategory[] = ['BANK_CASH', 'INVESTMENTS', 'CRYPTO', 'REAL_ESTATE', 'OTHER'];

const categoryIcons: Record<WalletCategory, React.ReactNode> = {
  BANK_CASH: <BankIcon />,
  INVESTMENTS: <InvestmentsIcon />,
  CRYPTO: <CryptoIcon />,
  REAL_ESTATE: <RealEstateIcon />,
  OTHER: <OtherIcon />,
};

const currencies = [
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
];

const WalletDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navState = location.state as WalletDetailNavState | null;
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [allWallets, setAllWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'BANK_CASH' as WalletCategory,
    currency: 'PLN',
    description: '',
    icon: 'wallet',
  });
  const [transferTargetId, setTransferTargetId] = useState('');
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
        const [foundWallet, data, categoriesData, walletsData] = await Promise.all([
          id ? walletsService.getWallet(id) : Promise.resolve(null),
          id ? transactionsService.getTransactions(id) : Promise.resolve([]),
          categoriesService.getCategories(),
          walletsService.getWallets(),
        ]);
        setWallet(foundWallet || null);
        setTransactions(data);
        setCategories(categoriesData);
        setAllWallets(walletsData);
        dispatch(fetchWalletsSuccess(walletsData));
      } catch {
        setWallet(null);
        setTransactions([]);
        setCategories([]);
        setAllWallets([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch, id]);

  useEffect(() => {
    if (!wallet) return;
    setEditForm({
      name: wallet.name,
      type: wallet.type,
      currency: wallet.currency,
      description: wallet.description ?? '',
      icon: wallet.icon ?? 'wallet',
    });
  }, [wallet]);

  const handleCreateTransaction = async () => {
    if (!wallet) return;
    
    const amount = parseFloat(newTransaction.amount) || 0;

    const transaction = await transactionsService.createTransaction({
      walletId: wallet.id,
      type: newTransaction.type,
      amount,
      categoryId: newTransaction.categoryId || undefined,
      description: newTransaction.description,
      transactionDate: newTransaction.transactionDate,
    });
    const normalized = transaction.currency ? transaction : { ...transaction, currency: wallet.currency };
    
    setTransactions([normalized, ...transactions]);
    
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

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!wallet) return;
    
    await transactionsService.deleteTransaction(transaction.id);
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
    const backTarget = navState?.from === 'category' ? (navState.categoryPath ?? '/wallets') : '/wallets';
    const backLabel = navState?.from === 'category'
      ? `Back to ${navState.categoryLabel ?? 'Category'}`
      : 'Back to Wallets';

    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Wallet not found
        </Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate(backTarget)}>
          {backLabel}
        </Button>
      </Box>
    );
  }

  const backTarget = navState?.from === 'category' ? (navState.categoryPath ?? '/wallets') : '/wallets';
  const backLabel = navState?.from === 'category'
    ? `Back to ${navState.categoryLabel ?? getWalletLabel(wallet.type)}`
    : 'Back to Wallets';

  const refreshWallets = async () => {
    const updated = await walletsService.getWallets();
    setAllWallets(updated);
    dispatch(fetchWalletsSuccess(updated));
  };

  const handleEditSave = async () => {
    if (!wallet) return;
    const updatedWallet = await walletsService.updateWallet(wallet.id, {
      name: editForm.name,
      type: editForm.type,
      currency: editForm.currency,
      description: editForm.description,
      icon: editForm.icon,
    });
    setWallet(updatedWallet);
    await refreshWallets();
    setEditDialogOpen(false);
  };

  const handleTransfer = async () => {
    if (!wallet || !transferTargetId) return;
    const target = allWallets.find((item) => item.id === transferTargetId);
    if (!target) return;
    
    // Create a transfer transaction to move funds to target wallet
    await transactionsService.createTransaction({
      walletId: wallet.id,
      type: 'TRANSFER',
      amount: wallet.balance,
      targetWalletId: target.id,
      description: `Transfer to ${target.name}`,
    });
    
    await walletsService.deleteWallet(wallet.id);
    await refreshWallets();
    navigate(`/wallets/${target.id}`, {
      state: navState?.from === 'category'
        ? {
            from: 'category',
            categoryPath: navState.categoryPath,
            categoryLabel: navState.categoryLabel,
          }
        : { from: 'wallets' },
    });
  };

  const handleDeleteWallet = async () => {
    if (!wallet) return;
    await walletsService.deleteWallet(wallet.id);
    await refreshWallets();
    navigate(backTarget);
  };

  const transferTargets = wallet
    ? allWallets.filter((item) => item.type === wallet.type && item.id !== wallet.id)
    : [];

  const headerBaseColor = getWalletColor(wallet.type);
  const headerTextColor = theme.palette.getContrastText(headerBaseColor);
  const headerAccentBg = alpha(headerTextColor, 0.2);
  const headerGradientStart = theme.palette.mode === 'dark'
    ? lighten(headerBaseColor, 0.08)
    : lighten(headerBaseColor, 0.2);
  const headerGradientEnd = theme.palette.mode === 'dark'
    ? darken(headerBaseColor, 0.35)
    : darken(headerBaseColor, 0.12);
  const headerHighlight = alpha('#ffffff', theme.palette.mode === 'dark' ? 0.12 : 0.25);
  const headerSpotlight = alpha('#ffffff', theme.palette.mode === 'dark' ? 0.08 : 0.18);

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(backTarget)}
        sx={{ mb: 3 }}
      >
        {backLabel}
      </Button>

      {/* Wallet Header Card */}
      <Card
        sx={{
          mb: 4,
          color: headerTextColor,
          backgroundColor: headerBaseColor,
          backgroundImage: `linear-gradient(135deg, ${headerGradientStart} 0%, ${headerGradientEnd} 100%)`,
          boxShadow: `0 22px 44px -26px ${alpha(headerBaseColor, 0.7)}`,
          border: `1px solid ${alpha(headerTextColor, 0.12)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 15% 20%, ${headerHighlight} 0%, transparent 45%),
              radial-gradient(circle at 85% 10%, ${headerSpotlight} 0%, transparent 38%)
            `,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(120deg, ${alpha('#ffffff', theme.palette.mode === 'dark' ? 0.06 : 0.16)} 0%, transparent 55%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <CardContent sx={{ p: 4, color: headerTextColor }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: alpha('#ffffff', theme.palette.mode === 'dark' ? 0.18 : 0.35),
                border: `1px solid ${alpha('#ffffff', theme.palette.mode === 'dark' ? 0.25 : 0.4)}`,
                width: 56,
                height: 56,
              }}
            >
              <Box component="span" sx={{ fontSize: 28, lineHeight: 1 }}>
                {getWalletIconEmoji(wallet.icon)}
              </Box>
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {wallet.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={getWalletLabel(wallet.type)}
                  size="small"
                  sx={{ bgcolor: headerAccentBg, color: headerTextColor }}
                />
                <Chip
                  label={wallet.currency}
                  size="small"
                  sx={{ bgcolor: headerAccentBg, color: headerTextColor }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Edit wallet" arrow>
                <IconButton
                  onClick={() => setEditDialogOpen(true)}
                  sx={{
                    color: headerTextColor,
                    bgcolor: alpha(headerTextColor, 0.12),
                    '&:hover': { bgcolor: alpha(headerTextColor, 0.2) },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Transfer" arrow>
                <IconButton
                  onClick={() => setTransferDialogOpen(true)}
                  sx={{
                    color: headerTextColor,
                    bgcolor: alpha(headerTextColor, 0.12),
                    '&:hover': { bgcolor: alpha(headerTextColor, 0.2) },
                  }}
                >
                  <TransferIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete wallet" arrow>
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{
                    color: headerTextColor,
                    bgcolor: alpha(headerTextColor, 0.12),
                    '&:hover': { bgcolor: alpha(headerTextColor, 0.2) },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
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
                <Box component="span" sx={{ fontSize: 20, lineHeight: 1, color: 'primary.main' }}>
                  {getWalletIconEmoji(wallet.icon)}
                </Box>
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
                                  {getCategoryName(categories, transaction.categoryId)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getCategoryName(categories, transaction.categoryId)}
                              size="small"
                              sx={{
                                bgcolor: `${getCategoryColor(categories, transaction.categoryId)}20`,
                                color: getCategoryColor(categories, transaction.categoryId),
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
                  {categories
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

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Wallet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Wallet Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editForm.type}
                label="Type"
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value as WalletCategory })}
              >
                {walletTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: alpha(getWalletColor(type), 0.12),
                          color: getWalletColor(type),
                        }}
                      >
                        {categoryIcons[type]}
                      </Avatar>
                      {getWalletLabel(type)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={editForm.currency}
                label="Currency"
                onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
              >
                {currencies.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600}>{curr.code}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {curr.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Icon
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {walletIconOptions.map((iconOption) => (
              <Box
                key={iconOption.id}
                onClick={() => setEditForm({ ...editForm, icon: iconOption.id })}
                sx={{
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  border: 2,
                  borderColor: editForm.icon === iconOption.id ? 'primary.main' : 'divider',
                  bgcolor: editForm.icon === iconOption.id ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: 24,
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                {iconOption.icon}
              </Box>
            ))}
          </Box>

          <TextField
            fullWidth
            label="Description (optional)"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={!editForm.name.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transfer Wallet Balance</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: alpha(headerBaseColor, 0.15), color: headerBaseColor }}>
              <TransferIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Move balance to another {getWalletLabel(wallet.type)} wallet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The current wallet will be deleted after the transfer.
              </Typography>
            </Box>
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will delete "{wallet.name}" after transferring its balance.
          </Alert>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Transfer To</InputLabel>
            <Select
              value={transferTargetId}
              label="Transfer To"
              onChange={(e) => setTransferTargetId(e.target.value)}
            >
              {transferTargets.length === 0 ? (
                <MenuItem disabled value="">
                  No other wallets available in this category
                </MenuItem>
              ) : (
                transferTargets.map((target) => (
                  <MenuItem key={target.id} value={target.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ fontSize: 18 }}>
                        {getWalletIconEmoji(target.icon)}
                      </Box>
                      <Typography fontWeight={600}>{target.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(target.balance, target.currency)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Transfer Amount"
            value={formatCurrency(wallet.balance, wallet.currency)}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button
            color="warning"
            variant="contained"
            onClick={handleTransfer}
            disabled={!transferTargetId || transferTargets.length === 0}
          >
            Transfer and Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete wallet?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This action cannot be undone. Your wallet and related data will be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteWallet}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletDetailPage;

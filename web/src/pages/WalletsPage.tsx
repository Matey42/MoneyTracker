import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  Skeleton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  ChevronRight as ChevronRightIcon,
  AccountBalance as BankIcon,
  CurrencyBitcoin as CryptoIcon,
  Home as RealEstateIcon,
  MoreHoriz as OtherIcon,
  ShowChart as InvestmentsIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../hooks/useAppStore';
import { fetchWalletsSuccess } from '../features/wallet/walletSlice';
import type { Wallet, WalletCategory } from '../types';
import { formatCurrency, getRelativeTime } from '../utils/formatters';
import { getWalletLabel, getWalletColor } from '../utils/walletConfig';

// Mock data
const mockWallets: Wallet[] = [
  { id: '1', name: 'Personal Account', type: 'BANK_CASH', currency: 'PLN', balance: 8500.5, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-01-01', description: 'My main checking account' },
  { id: '2', name: 'Family Budget', type: 'BANK_CASH', currency: 'PLN', balance: 4200.0, isOwner: true, isShared: true, isFavorite: true, memberCount: 3, createdAt: '2024-01-15', description: 'Shared family expenses' },
  { id: '3', name: 'Emergency Savings', type: 'BANK_CASH', currency: 'PLN', balance: 15000.0, isOwner: true, isShared: false, createdAt: '2024-02-01' },
  { id: '4', name: 'Vacation Fund', type: 'BANK_CASH', currency: 'PLN', balance: 2720.0, isOwner: true, isShared: false, createdAt: '2024-03-01' },
  { id: '5', name: 'Business Account', type: 'BANK_CASH', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, createdAt: '2024-04-01' },
  { id: '6', name: 'Shared Apartment', type: 'BANK_CASH', currency: 'PLN', balance: 800.0, isOwner: false, isShared: true, memberCount: 2, createdAt: '2024-05-01' },
];

const walletTypes: { value: WalletCategory; label: string }[] = [
  { value: 'BANK_CASH', label: 'Bank & Cash' },
  { value: 'INVESTMENTS', label: 'Investments' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'OTHER', label: 'Other' },
];

// Category icons mapping
const categoryIcons: Record<WalletCategory, React.ReactNode> = {
  BANK_CASH: <BankIcon />,
  INVESTMENTS: <InvestmentsIcon />,
  CRYPTO: <CryptoIcon />,
  REAL_ESTATE: <RealEstateIcon />,
  OTHER: <OtherIcon />,
};

// URL slug mapping for categories
const categorySlug: Record<WalletCategory, string> = {
  BANK_CASH: 'bank-cash',
  INVESTMENTS: 'investments',
  CRYPTO: 'crypto',
  REAL_ESTATE: 'real-estate',
  OTHER: 'other',
};

const WalletsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'BANK_CASH' as WalletCategory,
    description: '',
  });

  useEffect(() => {
    const fetchWallets = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setWallets(mockWallets);
      dispatch(fetchWalletsSuccess(mockWallets)); // Update Redux store for sidebar
      setLastUpdated(new Date());
      setIsLoading(false);
    };
    fetchWallets();
  }, [dispatch]);

  const handleCreateWallet = () => {
    const wallet: Wallet = {
      id: String(Date.now()),
      name: newWallet.name,
      type: newWallet.type,
      currency: 'PLN',
      balance: 0,
      isOwner: true,
      isShared: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      description: newWallet.description,
    };
    const updated = [...wallets, wallet];
    setWallets(updated);
    dispatch(fetchWalletsSuccess(updated)); // Update Redux store
    setLastUpdated(new Date());
    setCreateDialogOpen(false);
    setNewWallet({ name: '', type: 'BANK_CASH', description: '' });
  };

  // Calculate totals
  const disposableBalance = wallets
    .filter((wallet) => wallet.type === 'BANK_CASH')
    .reduce((sum, wallet) => sum + wallet.balance, 0);

  const estimatedWorth = wallets
    .filter((wallet) => ['INVESTMENTS', 'REAL_ESTATE', 'CRYPTO', 'OTHER'].includes(wallet.type))
    .reduce((sum, wallet) => sum + wallet.balance, 0);

  const totalBalance = disposableBalance + estimatedWorth;

  // Mock daily changes
  const dailyCashDelta = disposableBalance * 0.0012;
  const dailyInvestDelta = estimatedWorth * 0.0021;
  const totalDailyChange = dailyCashDelta + dailyInvestDelta;
  const formatSigned = (value: number) => `${value >= 0 ? '+' : ''}${formatCurrency(value)}`;

  // Group wallets by category
  const walletGroups = useMemo(() => {
    const groups: Record<WalletCategory, { items: Wallet[]; balance: number }> = {
      BANK_CASH: { items: [], balance: 0 },
      INVESTMENTS: { items: [], balance: 0 },
      CRYPTO: { items: [], balance: 0 },
      REAL_ESTATE: { items: [], balance: 0 },
      OTHER: { items: [], balance: 0 },
    };

    wallets.forEach((wallet) => {
      groups[wallet.type].items.push(wallet);
      groups[wallet.type].balance += wallet.balance;
    });

    return groups;
  }, [wallets]);

  // Get favorite wallets
  const favoriteWallets = useMemo(() => 
    wallets.filter((wallet) => wallet.isFavorite),
  [wallets]);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={180} />
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
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Wallets
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Balance
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(totalBalance)}
              </Typography>
            </Box>
            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Disposable
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatCurrency(disposableBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bank & Cash
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Invested
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatCurrency(estimatedWorth)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assets & investments
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: { xs: 'stretch', lg: 'flex-end' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Daily change
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: totalDailyChange === 0
                    ? 'text.primary'
                    : totalDailyChange > 0
                      ? 'success.main'
                      : 'error.main',
                }}
              >
                {formatSigned(totalDailyChange)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated {lastUpdated ? getRelativeTime(lastUpdated) : '—'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              icon={dailyCashDelta >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`Cash & bank ${formatSigned(dailyCashDelta)}`}
              size="small"
              sx={{
                bgcolor: alpha(dailyCashDelta >= 0 ? '#16a34a' : '#dc2626', 0.12),
                color: dailyCashDelta >= 0 ? 'success.main' : 'error.main',
              }}
            />
            <Chip
              icon={dailyInvestDelta >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`Investments ${formatSigned(dailyInvestDelta)}`}
              size="small"
              sx={{
                bgcolor: alpha(dailyInvestDelta >= 0 ? '#16a34a' : '#dc2626', 0.12),
                color: dailyInvestDelta >= 0 ? 'success.main' : 'error.main',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Favorite Wallets */}
      {favoriteWallets.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            <Typography variant="h6" fontWeight={600}>
              Favorites
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {favoriteWallets.map((wallet) => (
              <Grid key={wallet.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/wallets/${wallet.id}`)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(getWalletColor(wallet.type), 0.12),
                            color: getWalletColor(wallet.type),
                            width: 36,
                            height: 36,
                          }}
                        >
                          <WalletIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {wallet.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getWalletLabel(wallet.type)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Categories */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Categories
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Wallet
          </Button>
        </Box>
        <Grid container spacing={2}>
          {walletTypes.map((type) => {
            const group = walletGroups[type.value];
            const hasWallets = group.items.length > 0;
            const color = getWalletColor(type.value);

            return (
              <Grid key={type.value} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    opacity: hasWallets ? 1 : 0.5,
                    transition: 'all 0.2s',
                    background: hasWallets 
                      ? `linear-gradient(135deg, ${alpha(color, 0.08)}, transparent)`
                      : undefined,
                    '&:hover': hasWallets ? {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: color,
                    } : undefined,
                  }}
                >
                  <CardActionArea
                    onClick={() => hasWallets && navigate(`/wallets/${categorySlug[type.value]}`)}
                    disabled={!hasWallets}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(color, 0.12),
                              color: hasWallets ? color : 'text.disabled',
                              width: 44,
                              height: 44,
                            }}
                          >
                            {categoryIcons[type.value]}
                          </Avatar>
                          <Box>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight={600}
                              color={hasWallets ? 'text.primary' : 'text.disabled'}
                            >
                              {type.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {group.items.length} {group.items.length === 1 ? 'wallet' : 'wallets'}
                            </Typography>
                          </Box>
                        </Box>
                        {hasWallets && (
                          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                        )}
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography 
                          variant="h5" 
                          fontWeight={700}
                          color={hasWallets ? 'primary.main' : 'text.disabled'}
                        >
                          {formatCurrency(group.balance)}
                        </Typography>
                      </Box>
                      {!hasWallets && (
                        <Chip
                          label="No wallets yet"
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* All Wallets (non-favorites) */}
      {wallets.filter(w => !w.isFavorite).length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            All Wallets
          </Typography>
          <Grid container spacing={2}>
            {wallets.filter(w => !w.isFavorite).slice(0, 6).map((wallet) => (
              <Grid key={wallet.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/wallets/${wallet.id}`)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(getWalletColor(wallet.type), 0.12),
                            color: getWalletColor(wallet.type),
                            width: 32,
                            height: 32,
                          }}
                        >
                          <WalletIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {wallet.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getWalletLabel(wallet.type)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Create Wallet Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Wallet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Wallet Name"
            value={newWallet.name}
            onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={newWallet.type}
              label="Type"
              onChange={(e) => setNewWallet({ ...newWallet, type: e.target.value as WalletCategory })}
            >
              {walletTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description (optional)"
            value={newWallet.description}
            onChange={(e) => setNewWallet({ ...newWallet, description: e.target.value })}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateWallet}
            disabled={!newWallet.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletsPage;

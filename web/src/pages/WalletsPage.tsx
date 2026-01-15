import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Autocomplete,
  InputAdornment,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Checkbox,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ChevronRight as ChevronRightIcon,
  AccountBalance as BankIcon,
  CurrencyBitcoin as CryptoIcon,
  Home as RealEstateIcon,
  MoreHoriz as OtherIcon,
  ShowChart as InvestmentsIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../hooks/useAppStore';
import { fetchWalletsSuccess } from '../features/wallet/walletSlice';
import type { Wallet, WalletCategory } from '../types';
import { formatCurrency, getRelativeTime } from '../utils/formatters';
import { getWalletColor } from '../utils/walletConfig';

// Mock data - added mock daily changes and icons
const mockWallets: Wallet[] = [
  { id: '1', name: 'Personal Account', type: 'BANK_CASH', currency: 'PLN', balance: 8500.5, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-01-01', description: 'My main checking account', dailyChange: 125.30, icon: 'bank', favoriteOrder: 0 },
  { id: '2', name: 'Family Budget', type: 'BANK_CASH', currency: 'PLN', balance: 4200.0, isOwner: true, isShared: true, isFavorite: true, memberCount: 3, createdAt: '2024-01-15', description: 'Shared family expenses', dailyChange: -45.00, icon: 'wallet', favoriteOrder: 1 },
  { id: '3', name: 'Emergency Savings', type: 'BANK_CASH', currency: 'PLN', balance: 15000.0, isOwner: true, isShared: false, createdAt: '2024-02-01', dailyChange: 0, icon: 'safe' },
  { id: '4', name: 'Vacation Fund', type: 'BANK_CASH', currency: 'PLN', balance: 2720.0, isOwner: true, isShared: false, createdAt: '2024-03-01', dailyChange: 50.00, icon: 'piggy' },
  { id: '5', name: 'Business Account', type: 'BANK_CASH', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, createdAt: '2024-04-01', dailyChange: 320.00, icon: 'briefcase' },
  { id: '6', name: 'Shared Apartment', type: 'BANK_CASH', currency: 'PLN', balance: 800.0, isOwner: false, isShared: true, memberCount: 2, createdAt: '2024-05-01', dailyChange: -20.00, icon: 'house' },
  { id: '7', name: 'Stock Portfolio', type: 'INVESTMENTS', currency: 'PLN', balance: 45000.0, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-01-10', dailyChange: 890.50, icon: 'chart', favoriteOrder: 0 },
  { id: '8', name: 'Retirement Fund', type: 'INVESTMENTS', currency: 'PLN', balance: 82000.0, isOwner: true, isShared: false, createdAt: '2024-02-15', dailyChange: 450.00, icon: 'coins' },
  { id: '9', name: 'Bitcoin Wallet', type: 'CRYPTO', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-03-01', dailyChange: -320.00, icon: 'bitcoin', favoriteOrder: 0 },
  { id: '10', name: 'Ethereum Wallet', type: 'CRYPTO', currency: 'PLN', balance: 5600.0, isOwner: true, isShared: false, createdAt: '2024-03-15', dailyChange: 180.00, icon: 'coins' },
];

const walletTypes: { value: WalletCategory; label: string }[] = [
  { value: 'BANK_CASH', label: 'Bank & Cash' },
  { value: 'INVESTMENTS', label: 'Investments' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'OTHER', label: 'Other' },
];

// Currency options
const currencies = [
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

// Wallet icon options
const walletIcons = [
  { id: 'wallet', label: 'Wallet', icon: '💰' },
  { id: 'bank', label: 'Bank', icon: '🏦' },
  { id: 'piggy', label: 'Piggy Bank', icon: '🐷' },
  { id: 'safe', label: 'Safe', icon: '🔐' },
  { id: 'credit', label: 'Credit Card', icon: '💳' },
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'coins', label: 'Coins', icon: '🪙' },
  { id: 'chart', label: 'Chart', icon: '📈' },
  { id: 'bitcoin', label: 'Bitcoin', icon: '₿' },
  { id: 'house', label: 'House', icon: '🏠' },
  { id: 'building', label: 'Building', icon: '🏢' },
  { id: 'briefcase', label: 'Briefcase', icon: '💼' },
];

// Mock net worth history data - more detailed
const mockNetWorthHistory = {
  '7D': [
    { date: '2026-01-09', value: 180500, label: 'Thu' },
    { date: '2026-01-10', value: 181200, label: 'Fri' },
    { date: '2026-01-11', value: 179800, label: 'Sat' },
    { date: '2026-01-12', value: 182400, label: 'Sun' },
    { date: '2026-01-13', value: 184100, label: 'Mon' },
    { date: '2026-01-14', value: 185800, label: 'Tue' },
    { date: '2026-01-15', value: 188820.5, label: 'Today' },
  ],
  '30D': [
    { date: '2025-12-16', value: 172000, label: 'Dec 16' },
    { date: '2025-12-20', value: 173500, label: 'Dec 20' },
    { date: '2025-12-24', value: 175500, label: 'Dec 24' },
    { date: '2025-12-28', value: 176800, label: 'Dec 28' },
    { date: '2026-01-01', value: 178200, label: 'Jan 1' },
    { date: '2026-01-05', value: 180000, label: 'Jan 5' },
    { date: '2026-01-09', value: 182500, label: 'Jan 9' },
    { date: '2026-01-13', value: 185000, label: 'Jan 13' },
    { date: '2026-01-15', value: 188820.5, label: 'Today' },
  ],
  'YTD': [
    { date: '2026-01-01', value: 175000, label: 'Jan 1' },
    { date: '2026-01-05', value: 177500, label: 'Jan 5' },
    { date: '2026-01-08', value: 180000, label: 'Jan 8' },
    { date: '2026-01-12', value: 184500, label: 'Jan 12' },
    { date: '2026-01-15', value: 188820.5, label: 'Today' },
  ],
};

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
  const theme = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<'7D' | '30D' | 'YTD'>('7D');
  const [favoritesAnchor, setFavoritesAnchor] = useState<{ el: HTMLElement; category: WalletCategory } | null>(null);
  const [draggedFavoriteId, setDraggedFavoriteId] = useState<string | null>(null);
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'BANK_CASH' as WalletCategory,
    description: '',
    currency: 'PLN',
    icon: 'wallet',
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
      currency: newWallet.currency,
      balance: 0,
      isOwner: true,
      isShared: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      description: newWallet.description,
      icon: newWallet.icon,
    };
    const updated = [...wallets, wallet];
    setWallets(updated);
    dispatch(fetchWalletsSuccess(updated)); // Update Redux store
    setLastUpdated(new Date());
    setCreateDialogOpen(false);
    setNewWallet({ name: '', type: 'BANK_CASH', description: '', currency: 'PLN', icon: 'wallet' });
  };

  const handleToggleFavorite = (walletId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = wallets.map(w => 
      w.id === walletId ? { ...w, isFavorite: !w.isFavorite } : w
    );
    setWallets(updated);
    dispatch(fetchWalletsSuccess(updated));
  };

  // Drag and drop for favorites reordering in popover
  const handleFavoriteDragStart = (walletId: string) => {
    setDraggedFavoriteId(walletId);
  };

  const handleFavoriteDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFavoriteDrop = (targetId: string, category: WalletCategory) => {
    if (!draggedFavoriteId || draggedFavoriteId === targetId) {
      setDraggedFavoriteId(null);
      return;
    }

    const categoryFavorites = wallets
      .filter(w => w.type === category && w.isFavorite)
      .sort((a, b) => (a.favoriteOrder ?? 0) - (b.favoriteOrder ?? 0));

    const draggedIndex = categoryFavorites.findIndex(w => w.id === draggedFavoriteId);
    const targetIndex = categoryFavorites.findIndex(w => w.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Reorder: assign new favoriteOrder values
      const reordered = [...categoryFavorites];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, removed);

      const updatedWallets = wallets.map(w => {
        const newOrder = reordered.findIndex(r => r.id === w.id);
        if (newOrder !== -1) {
          return { ...w, favoriteOrder: newOrder };
        }
        return w;
      });

      setWallets(updatedWallets);
      dispatch(fetchWalletsSuccess(updatedWallets));
    }
    setDraggedFavoriteId(null);
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
  const dailyCashDelta = wallets
    .filter(w => w.type === 'BANK_CASH')
    .reduce((sum, w) => sum + (w.dailyChange || 0), 0);
  const dailyInvestDelta = wallets
    .filter(w => ['INVESTMENTS', 'REAL_ESTATE', 'CRYPTO', 'OTHER'].includes(w.type))
    .reduce((sum, w) => sum + (w.dailyChange || 0), 0);
  const totalDailyChange = dailyCashDelta + dailyInvestDelta;
  const formatSigned = (value: number) => `${value >= 0 ? '+' : ''}${formatCurrency(value)}`;

  // Group wallets by category with favorites
  const walletGroups = useMemo(() => {
    const groups: Record<WalletCategory, { items: Wallet[]; favorites: Wallet[]; balance: number; dailyChange: number }> = {
      BANK_CASH: { items: [], favorites: [], balance: 0, dailyChange: 0 },
      INVESTMENTS: { items: [], favorites: [], balance: 0, dailyChange: 0 },
      CRYPTO: { items: [], favorites: [], balance: 0, dailyChange: 0 },
      REAL_ESTATE: { items: [], favorites: [], balance: 0, dailyChange: 0 },
      OTHER: { items: [], favorites: [], balance: 0, dailyChange: 0 },
    };

    wallets.forEach((wallet) => {
      groups[wallet.type].items.push(wallet);
      groups[wallet.type].balance += wallet.balance;
      groups[wallet.type].dailyChange += wallet.dailyChange || 0;
      if (wallet.isFavorite) {
        groups[wallet.type].favorites.push(wallet);
      }
    });

    return groups;
  }, [wallets]);

  // Asset allocation data for donut chart
  const assetAllocation = useMemo(() => {
    return walletTypes
      .filter(t => walletGroups[t.value].balance > 0)
      .map(t => ({
        category: t.value,
        label: t.label,
        value: walletGroups[t.value].balance,
        color: getWalletColor(t.value),
        percentage: totalBalance > 0 ? (walletGroups[t.value].balance / totalBalance) * 100 : 0,
      }));
  }, [walletGroups, totalBalance]);

  // Net worth trend data
  const trendData = mockNetWorthHistory[trendPeriod];
  const trendChange = trendData.length >= 2 
    ? trendData[trendData.length - 1].value - trendData[0].value 
    : 0;
  const trendChangePercent = trendData.length >= 2 && trendData[0].value > 0
    ? ((trendData[trendData.length - 1].value - trendData[0].value) / trendData[0].value) * 100
    : 0;

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
        <Stack spacing={3}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={140} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header - Original Style */}
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
          {/* Daily change with vertical bar indicator */}
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5 }}>
            <Box
              sx={{
                width: 4,
                borderRadius: 2,
                bgcolor: totalDailyChange === 0
                  ? 'text.disabled'
                  : totalDailyChange > 0
                    ? 'success.main'
                    : 'error.main',
              }}
            />
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

      {/* Portfolio Overview - Dashboard Cards */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Asset Allocation - Clean Donut */}
        <Card 
          variant="outlined" 
          sx={{ 
            p: 2.5, 
            flex: { xs: 1, md: '0 0 280px' },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff',
            borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e5e7eb',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Asset Allocation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Donut Chart */}
            <Box sx={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.15) : '#f3f4f6'}
                  strokeWidth="20"
                />
                {/* Segments */}
                {assetAllocation.reduce((acc, item) => {
                  const prevOffset = acc.offset;
                  const circumference = 2 * Math.PI * 40;
                  const strokeLength = (item.percentage / 100) * circumference;
                  const gap = assetAllocation.length > 1 ? 2 : 0;
                  acc.elements.push(
                    <circle
                      key={item.category}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={`${Math.max(0, strokeLength - gap)} ${circumference}`}
                      strokeDashoffset={-prevOffset}
                      style={{ transition: 'all 0.5s ease' }}
                    />
                  );
                  acc.offset += strokeLength;
                  return acc;
                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                {/* Center hole */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="30" 
                  fill={theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff'}
                />
              </svg>
              {/* Center text */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1, fontSize: 18 }}>
                  {assetAllocation.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  categories
                </Typography>
              </Box>
            </Box>
            
            {/* Legend - icons with percentages */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
              {assetAllocation.map((item) => (
                <Tooltip key={item.category} title={`${item.label}: ${formatCurrency(item.value)}`} arrow placement="right">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: alpha(item.color, 0.15),
                        color: item.color,
                        fontSize: 16,
                      }}
                    >
                      {categoryIcons[item.category]}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: 14 }}>
                      {item.percentage.toFixed(0)}%
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Box>
        </Card>

        {/* Net Worth Trend - Dashboard Card */}
        <Card 
          variant="outlined" 
          sx={{ 
            p: 2.5, 
            flex: 1,
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff',
            borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e5e7eb',
          }}
        >
          {/* Header with title, headline number, and toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Net Worth
                </Typography>
                <Chip
                  size="small"
                  icon={trendChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${trendChange >= 0 ? '+' : ''}${trendChangePercent.toFixed(1)}%`}
                  sx={{
                    height: 20,
                    bgcolor: alpha(trendChange >= 0 ? '#16a34a' : '#dc2626', 0.1),
                    color: trendChange >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                    fontSize: 11,
                    '& .MuiChip-icon': { fontSize: 12, color: 'inherit' },
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {formatCurrency(trendData[trendData.length - 1].value)}
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={trendPeriod}
              exclusive
              onChange={(_, val) => val && setTrendPeriod(val)}
              size="small"
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.08) : '#f9fafb',
                borderRadius: 2,
                p: 0.25,
                '& .MuiToggleButtonGroup-grouped': {
                  border: 'none',
                  borderRadius: '6px !important',
                  mx: 0.25,
                },
                '& .MuiToggleButton-root': { 
                  px: 1.5, 
                  py: 0.5, 
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : '#fff',
                    color: theme.palette.mode === 'dark' ? 'primary.contrastText' : 'text.primary',
                    fontWeight: 600,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                  },
                } 
              }}
            >
              <ToggleButton value="7D">7D</ToggleButton>
              <ToggleButton value="30D">30D</ToggleButton>
              <ToggleButton value="YTD">YTD</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {/* Smooth Line Chart with gradient and gridlines */}
          <Box sx={{ height: 100, position: 'relative', mx: -1 }}>
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 400 100">
              <defs>
                <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={alpha(trendChange >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.15)} />
                  <stop offset="100%" stopColor={alpha(trendChange >= 0 ? theme.palette.success.main : theme.palette.error.main, 0)} />
                </linearGradient>
              </defs>
              {(() => {
                const min = Math.min(...trendData.map(d => d.value)) * 0.995;
                const max = Math.max(...trendData.map(d => d.value)) * 1.005;
                const range = max - min || 1;
                const padding = { top: 5, bottom: 5 };
                const chartHeight = 100 - padding.top - padding.bottom;
                const points = trendData.map((d, i) => {
                  const x = 10 + (i / (trendData.length - 1)) * 380;
                  const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight;
                  return { x, y, ...d };
                });
                
                // Create smooth curve path using bezier curves
                const createSmoothPath = (pts: typeof points) => {
                  if (pts.length < 2) return '';
                  let path = `M ${pts[0].x} ${pts[0].y}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const current = pts[i];
                    const next = pts[i + 1];
                    const cpx = (current.x + next.x) / 2;
                    path += ` C ${cpx} ${current.y}, ${cpx} ${next.y}, ${next.x} ${next.y}`;
                  }
                  return path;
                };
                
                const linePath = createSmoothPath(points);
                const areaPath = `${linePath} L ${points[points.length-1].x} ${100 - padding.bottom} L ${points[0].x} ${100 - padding.bottom} Z`;
                const lineColor = trendChange >= 0 ? theme.palette.success.main : theme.palette.error.main;
                const gridColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                
                return (
                  <>
                    {/* Vertical gridlines */}
                    {points.map((p, i) => (
                      <line
                        key={i}
                        x1={p.x}
                        y1={padding.top}
                        x2={p.x}
                        y2={100 - padding.bottom}
                        stroke={gridColor}
                        strokeWidth="1"
                        strokeDasharray={i === 0 || i === points.length - 1 ? "0" : "3,3"}
                      />
                    ))}
                    {/* Gradient area */}
                    <path d={areaPath} fill="url(#trendAreaGrad)" />
                    {/* Smooth line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke={lineColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* End point indicator */}
                    <circle 
                      cx={points[points.length-1].x} 
                      cy={points[points.length-1].y} 
                      r="4" 
                      fill={lineColor}
                    />
                    <circle 
                      cx={points[points.length-1].x} 
                      cy={points[points.length-1].y} 
                      r="6" 
                      fill="none"
                      stroke={lineColor}
                      strokeWidth="1.5"
                      opacity="0.4"
                    />
                  </>
                );
              })()}
            </svg>
          </Box>
          
          {/* X-axis labels - show all data points */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
            {trendData.map((d, i) => (
              <Typography 
                key={i} 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: 10,
                  fontWeight: i === trendData.length - 1 ? 600 : 400,
                  color: i === trendData.length - 1 ? 'text.primary' : 'text.secondary',
                }}
              >
                {d.label}
              </Typography>
            ))}
          </Box>
        </Card>
      </Box>

      {/* Categories Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
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

      {/* Category Cards */}
      <Stack spacing={1.5}>
        {walletTypes.map((type) => {
          const group = walletGroups[type.value];
          const hasWallets = group.items.length > 0;
          const color = getWalletColor(type.value);
          const dailyChange = group.dailyChange;

          return (
            <Card
              key={type.value}
              variant="outlined"
              sx={{
                overflow: 'visible',
                transition: 'all 0.25s ease',
                opacity: hasWallets ? 1 : 0.5,
                borderColor: hasWallets ? 'divider' : alpha(theme.palette.divider, 0.3),
                background: hasWallets 
                  ? `linear-gradient(135deg, ${alpha(color, 0.04)} 0%, transparent 50%)`
                  : undefined,
                '&:hover': hasWallets ? {
                  borderColor: color,
                  boxShadow: `0 0 20px ${alpha(color, 0.25)}, 0 4px 12px ${alpha(color, 0.15)}`,
                  transform: 'translateY(-1px)',
                } : undefined,
              }}
            >
              <CardActionArea
                onClick={() => hasWallets && navigate(`/wallets/${categorySlug[type.value]}`)}
                disabled={!hasWallets}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(color, hasWallets ? 0.15 : 0.08),
                          color: hasWallets ? color : 'text.disabled',
                          width: 40,
                          height: 40,
                          boxShadow: hasWallets ? `0 0 12px ${alpha(color, 0.3)}` : 'none',
                        }}
                      >
                        {categoryIcons[type.value]}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="body1" 
                          fontWeight={600}
                          color={hasWallets ? 'text.primary' : 'text.disabled'}
                        >
                          {type.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {hasWallets ? `${group.items.length} wallet${group.items.length !== 1 ? 's' : ''}` : 'No wallets yet'}
                        </Typography>
                      </Box>
                    </Box>

                    {hasWallets ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textAlign: 'right' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                              {formatCurrency(group.balance)}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={500}
                              sx={{
                                color: dailyChange === 0
                                  ? 'text.secondary'
                                  : dailyChange > 0
                                    ? 'success.main'
                                    : 'error.main',
                              }}
                            >
                              {formatSigned(dailyChange)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              width: 3,
                              height: 32,
                              borderRadius: 2,
                              bgcolor: dailyChange === 0
                                ? 'text.disabled'
                                : dailyChange > 0
                                  ? 'success.main'
                                  : 'error.main',
                            }}
                          />
                        </Box>
                        <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewWallet(prev => ({ ...prev, type: type.value }));
                          setCreateDialogOpen(true);
                        }}
                        sx={{ opacity: 0.7 }}
                      >
                        Add
                      </Button>
                    )}
                  </Box>

                  {/* Favorites row with + menu button on right */}
                  {hasWallets && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: 1,
                        borderColor: alpha(theme.palette.divider, 0.5),
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Favorites displayed with wallet icons */}
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', flex: 1 }}>
                        {group.favorites
                          .sort((a, b) => (a.favoriteOrder ?? 0) - (b.favoriteOrder ?? 0))
                          .map((wallet) => {
                            const walletIconEmoji = walletIcons.find(i => i.id === wallet.icon)?.icon || '💰';
                            return (
                              <Chip
                                key={wallet.id}
                                icon={<Box component="span" sx={{ fontSize: 14, ml: 0.5 }}>{walletIconEmoji}</Box>}
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: 13 }}>
                                      {wallet.name}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ fontSize: 13 }}>
                                      {formatCurrency(wallet.balance, wallet.currency)}
                                    </Typography>
                                  </Box>
                                }
                                onClick={() => navigate(`/wallets/${wallet.id}`)}
                                sx={{
                                  bgcolor: alpha(color, 0.06),
                                  borderColor: alpha(color, 0.2),
                                  '&:hover': { 
                                    bgcolor: alpha(color, 0.12),
                                    borderColor: color,
                                  },
                                  transition: 'all 0.15s',
                                  cursor: 'pointer',
                                }}
                                variant="outlined"
                                size="small"
                              />
                            );
                          })}
                        {group.favorites.length === 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ py: 0.5 }}>
                            No favorites yet
                          </Typography>
                        )}
                      </Box>
                      
                      {/* Add/Manage favorites button - on right */}
                      <Tooltip title="Manage favorites" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => setFavoritesAnchor({ el: e.currentTarget, category: type.value })}
                          sx={{
                            ml: 1,
                            width: 28,
                            height: 28,
                            border: 1,
                            borderColor: alpha(color, 0.3),
                            borderStyle: 'dashed',
                            color: 'text.secondary',
                            flexShrink: 0,
                            '&:hover': {
                              borderColor: color,
                              borderStyle: 'solid',
                              bgcolor: alpha(color, 0.08),
                              color: color,
                            },
                          }}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>

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
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newWallet.type}
                label="Type"
                onChange={(e) => setNewWallet({ ...newWallet, type: e.target.value as WalletCategory })}
              >
                {walletTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          bgcolor: alpha(getWalletColor(type.value), 0.12),
                          color: getWalletColor(type.value),
                        }}
                      >
                        {categoryIcons[type.value]}
                      </Avatar>
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={newWallet.currency}
                label="Currency"
                onChange={(e) => setNewWallet({ ...newWallet, currency: e.target.value })}
              >
                {currencies.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight={600}>{curr.symbol}</Typography>
                      <Typography>{curr.code}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {curr.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Icon Selection */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Icon
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {walletIcons.map((iconOption) => (
              <Box
                key={iconOption.id}
                onClick={() => setNewWallet({ ...newWallet, icon: iconOption.id })}
                sx={{
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  border: 2,
                  borderColor: newWallet.icon === iconOption.id ? 'primary.main' : 'divider',
                  bgcolor: newWallet.icon === iconOption.id ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
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

          <Autocomplete
            freeSolo
            options={['https://example.com/icon1.png', 'https://example.com/icon2.png']}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Custom Image URL (optional)"
                placeholder="https://..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

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

      {/* Favorites Management Popover */}
      <Popover
        open={Boolean(favoritesAnchor)}
        anchorEl={favoritesAnchor?.el}
        onClose={() => setFavoritesAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxHeight: 400,
              mt: 1,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: 1,
              borderColor: 'divider',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            },
          },
        }}
      >
        {favoritesAnchor && (() => {
          const category = favoritesAnchor.category;
          const categoryWallets = wallets.filter(w => w.type === category);
          const favorites = categoryWallets
            .filter(w => w.isFavorite)
            .sort((a, b) => (a.favoriteOrder ?? 0) - (b.favoriteOrder ?? 0));
          const nonFavorites = categoryWallets.filter(w => !w.isFavorite);
          const color = getWalletColor(category);

          return (
            <Box>
              {/* Header */}
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Manage Favorites
                </Typography>
                <IconButton size="small" onClick={() => setFavoritesAnchor(null)}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* Current favorites with drag-to-reorder */}
              {favorites.length > 0 && (
                <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, mb: 1, display: 'block' }}>
                    Favorites (drag to reorder)
                  </Typography>
                  <List dense disablePadding>
                    {favorites.map((wallet) => {
                      const walletIconEmoji = walletIcons.find(i => i.id === wallet.icon)?.icon || '💰';
                      const isDragging = draggedFavoriteId === wallet.id;
                      return (
                        <ListItem
                          key={wallet.id}
                          disablePadding
                          sx={{ mb: 0.5 }}
                          draggable
                          onDragStart={() => handleFavoriteDragStart(wallet.id)}
                          onDragOver={handleFavoriteDragOver}
                          onDrop={() => handleFavoriteDrop(wallet.id, category)}
                          onDragEnd={() => setDraggedFavoriteId(null)}
                          secondaryAction={
                            <IconButton 
                              size="small" 
                              onClick={(e) => { handleToggleFavorite(wallet.id, e); }}
                            >
                              <CloseIcon sx={{ fontSize: 14, color: 'error.main' }} />
                            </IconButton>
                          }
                        >
                          <Box 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              flex: 1,
                              borderRadius: 1, 
                              bgcolor: isDragging ? alpha(color, 0.15) : alpha(color, 0.06),
                              py: 0.75,
                              px: 1,
                              pr: 5,
                              cursor: 'grab',
                              border: isDragging ? `2px dashed ${color}` : '2px solid transparent',
                              transition: 'all 0.15s',
                              '&:hover': {
                                bgcolor: alpha(color, 0.1),
                              },
                              '&:active': {
                                cursor: 'grabbing',
                              },
                            }}
                          >
                            <DragIcon sx={{ fontSize: 16, color: 'text.disabled', mr: 0.5 }} />
                            <Box component="span" sx={{ fontSize: 16, mr: 1 }}>{walletIconEmoji}</Box>
                            <Typography variant="body2" fontWeight={500}>
                              {wallet.name}
                            </Typography>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              )}

              {/* Available wallets to add */}
              {nonFavorites.length > 0 && (
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, mb: 1, display: 'block' }}>
                    Add to favorites
                  </Typography>
                  <List dense disablePadding>
                    {nonFavorites.map((wallet) => {
                      const walletIconEmoji = walletIcons.find(i => i.id === wallet.icon)?.icon || '💰';
                      return (
                        <ListItem key={wallet.id} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton 
                            onClick={(e) => handleToggleFavorite(wallet.id, e as unknown as React.MouseEvent)}
                            sx={{ borderRadius: 1, py: 0.75 }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Checkbox
                                edge="start"
                                checked={false}
                                icon={<StarBorderIcon sx={{ fontSize: 18 }} />}
                                checkedIcon={<StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />}
                                sx={{ p: 0 }}
                              />
                            </ListItemIcon>
                            <Box component="span" sx={{ fontSize: 16, mr: 1 }}>{walletIconEmoji}</Box>
                            <ListItemText 
                              primary={wallet.name}
                              secondary={formatCurrency(wallet.balance)}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              )}

              {categoryWallets.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No wallets in this category
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })()}
      </Popover>
    </Box>
  );
};

export default WalletsPage;

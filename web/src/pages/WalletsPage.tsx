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
  IconButton,
  Tooltip,
  Autocomplete,
  InputAdornment,
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
  DragIndicator as DragIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../hooks/useAppStore';
import { fetchWalletsSuccess } from '../features/wallet/walletSlice';
import type { Wallet, WalletCategory } from '../types';
import { formatCurrency, getRelativeTime } from '../utils/formatters';
import { getWalletColor } from '../utils/walletConfig';

// Mock data - added mock daily changes
const mockWallets: Wallet[] = [
  { id: '1', name: 'Personal Account', type: 'BANK_CASH', currency: 'PLN', balance: 8500.5, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-01-01', description: 'My main checking account', dailyChange: 125.30 },
  { id: '2', name: 'Family Budget', type: 'BANK_CASH', currency: 'PLN', balance: 4200.0, isOwner: true, isShared: true, isFavorite: true, memberCount: 3, createdAt: '2024-01-15', description: 'Shared family expenses', dailyChange: -45.00 },
  { id: '3', name: 'Emergency Savings', type: 'BANK_CASH', currency: 'PLN', balance: 15000.0, isOwner: true, isShared: false, createdAt: '2024-02-01', dailyChange: 0 },
  { id: '4', name: 'Vacation Fund', type: 'BANK_CASH', currency: 'PLN', balance: 2720.0, isOwner: true, isShared: false, createdAt: '2024-03-01', dailyChange: 50.00 },
  { id: '5', name: 'Business Account', type: 'BANK_CASH', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, createdAt: '2024-04-01', dailyChange: 320.00 },
  { id: '6', name: 'Shared Apartment', type: 'BANK_CASH', currency: 'PLN', balance: 800.0, isOwner: false, isShared: true, memberCount: 2, createdAt: '2024-05-01', dailyChange: -20.00 },
  { id: '7', name: 'Stock Portfolio', type: 'INVESTMENTS', currency: 'PLN', balance: 45000.0, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-01-10', dailyChange: 890.50 },
  { id: '8', name: 'Retirement Fund', type: 'INVESTMENTS', currency: 'PLN', balance: 82000.0, isOwner: true, isShared: false, createdAt: '2024-02-15', dailyChange: 450.00 },
  { id: '9', name: 'Bitcoin Wallet', type: 'CRYPTO', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-03-01', dailyChange: -320.00 },
  { id: '10', name: 'Ethereum Wallet', type: 'CRYPTO', currency: 'PLN', balance: 5600.0, isOwner: true, isShared: false, createdAt: '2024-03-15', dailyChange: 180.00 },
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
  const [draggedFavorite, setDraggedFavorite] = useState<string | null>(null);
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

  // Drag and drop for favorites reordering
  const handleDragStart = (walletId: string) => {
    setDraggedFavorite(walletId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedFavorite || draggedFavorite === targetId) return;
  };

  const handleDrop = (e: React.DragEvent, targetId: string, category: WalletCategory) => {
    e.preventDefault();
    if (!draggedFavorite || draggedFavorite === targetId) {
      setDraggedFavorite(null);
      return;
    }

    // Reorder favorites within the category
    const categoryWallets = wallets.filter(w => w.type === category && w.isFavorite);
    const draggedIndex = categoryWallets.findIndex(w => w.id === draggedFavorite);
    const targetIndex = categoryWallets.findIndex(w => w.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const reordered = [...categoryWallets];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, removed);

      // Update wallet order (for now, just update state - in real app would save order)
      const updatedWallets = wallets.map(w => {
        const newIndex = reordered.findIndex(r => r.id === w.id);
        if (newIndex !== -1) {
          return { ...w, favoriteOrder: newIndex };
        }
        return w;
      });
      setWallets(updatedWallets);
      dispatch(fetchWalletsSuccess(updatedWallets));
    }
    setDraggedFavorite(null);
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

      {/* Portfolio Overview - Minimalist Charts */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Asset Allocation - Compact Donut */}
        <Card 
          variant="outlined" 
          sx={{ 
            p: 2, 
            flex: { xs: 1, md: '0 0 200px' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Allocation
          </Typography>
          <Box sx={{ position: 'relative', width: 100, height: 100 }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={alpha(theme.palette.divider, 0.3)}
                strokeWidth="16"
              />
              {/* Segments */}
              {assetAllocation.reduce((acc, item) => {
                const prevOffset = acc.offset;
                const circumference = 2 * Math.PI * 40;
                const strokeLength = (item.percentage / 100) * circumference;
                const gap = 2;
                acc.elements.push(
                  <circle
                    key={item.category}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="16"
                    strokeDasharray={`${Math.max(0, strokeLength - gap)} ${circumference}`}
                    strokeDashoffset={-prevOffset}
                    strokeLinecap="round"
                    style={{ transition: 'all 0.4s ease' }}
                  />
                );
                acc.offset += strokeLength;
                return acc;
              }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
              {/* Center hole */}
              <circle cx="50" cy="50" r="32" fill={theme.palette.background.paper} />
            </svg>
          </Box>
          {/* Icon Legend - horizontal */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            {assetAllocation.map((item) => (
              <Tooltip 
                key={item.category} 
                title={`${item.label}: ${item.percentage.toFixed(0)}%`}
                arrow
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.25,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: alpha(item.color, 0.15),
                      color: item.color,
                    }}
                  >
                    {categoryIcons[item.category]}
                  </Avatar>
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: 10 }}>
                    {item.percentage.toFixed(0)}%
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Card>

        {/* Net Worth Trend - Enhanced */}
        <Card variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Net Worth
              </Typography>
              <Chip
                size="small"
                icon={trendChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${trendChange >= 0 ? '+' : ''}${formatCurrency(trendChange)} (${trendChangePercent.toFixed(1)}%)`}
                sx={{
                  height: 22,
                  bgcolor: alpha(trendChange >= 0 ? '#16a34a' : '#dc2626', 0.12),
                  color: trendChange >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  '& .MuiChip-icon': { fontSize: 14 },
                }}
              />
            </Box>
            <ToggleButtonGroup
              value={trendPeriod}
              exclusive
              onChange={(_, val) => val && setTrendPeriod(val)}
              size="small"
              sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.25, fontSize: 12 } }}
            >
              <ToggleButton value="7D">7D</ToggleButton>
              <ToggleButton value="30D">30D</ToggleButton>
              <ToggleButton value="YTD">YTD</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {/* Chart with data points */}
          <Box sx={{ height: 80, position: 'relative' }}>
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={alpha(trendChange >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.25)} />
                  <stop offset="100%" stopColor={alpha(trendChange >= 0 ? theme.palette.success.main : theme.palette.error.main, 0)} />
                </linearGradient>
              </defs>
              {(() => {
                const min = Math.min(...trendData.map(d => d.value)) * 0.995;
                const max = Math.max(...trendData.map(d => d.value)) * 1.005;
                const range = max - min || 1;
                const points = trendData.map((d, i) => {
                  const x = (i / (trendData.length - 1)) * 100;
                  const y = 100 - ((d.value - min) / range) * 85 - 7.5;
                  return { x, y, ...d };
                });
                const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
                const areaPoints = `0,100 ${linePoints} 100,100`;
                const lineColor = trendChange >= 0 ? theme.palette.success.main : theme.palette.error.main;
                return (
                  <>
                    <polygon points={areaPoints} fill="url(#trendGradient)" />
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke={lineColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Data points */}
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="3" fill={theme.palette.background.paper} stroke={lineColor} strokeWidth="1.5" />
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </Box>
          {/* Labels with values */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            {trendData.filter((_, i) => i === 0 || i === trendData.length - 1 || i === Math.floor(trendData.length / 2)).map((d, i) => (
              <Box key={i} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  {d.label}
                </Typography>
                <Typography variant="caption" display="block" fontWeight={500} sx={{ fontSize: 10 }}>
                  {formatCurrency(d.value)}
                </Typography>
              </Box>
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
          const nonFavorites = group.items.filter(w => !w.isFavorite);

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

                  {/* Favorites row - draggable + add button */}
                  {hasWallets && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: 1,
                        borderColor: alpha(theme.palette.divider, 0.5),
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Existing favorites - draggable */}
                      {group.favorites.map((wallet) => (
                        <Chip
                          key={wallet.id}
                          draggable
                          onDragStart={() => handleDragStart(wallet.id)}
                          onDragOver={(e) => handleDragOver(e, wallet.id)}
                          onDrop={(e) => handleDrop(e, wallet.id, type.value)}
                          icon={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DragIcon sx={{ fontSize: 14, color: 'text.disabled', mr: 0.25, cursor: 'grab' }} />
                              <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                            </Box>
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {wallet.name}
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {formatCurrency(wallet.balance, wallet.currency)}
                              </Typography>
                            </Box>
                          }
                          onDelete={(e) => handleToggleFavorite(wallet.id, e as React.MouseEvent)}
                          deleteIcon={<StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />}
                          onClick={() => navigate(`/wallets/${wallet.id}`)}
                          sx={{
                            bgcolor: alpha(color, 0.08),
                            borderColor: alpha(color, 0.2),
                            opacity: draggedFavorite === wallet.id ? 0.5 : 1,
                            '&:hover': { 
                              bgcolor: alpha(color, 0.15),
                            },
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            '& .MuiChip-deleteIcon': {
                              '&:hover': { color: 'text.secondary' },
                            },
                          }}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                      
                      {/* Add favorite button - shows non-favorites */}
                      {nonFavorites.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          {nonFavorites.slice(0, 3).map((wallet) => (
                            <Tooltip key={wallet.id} title={`Add ${wallet.name} to favorites`} arrow>
                              <IconButton
                                size="small"
                                onClick={(e) => handleToggleFavorite(wallet.id, e)}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  border: 1,
                                  borderColor: 'divider',
                                  borderStyle: 'dashed',
                                  '&:hover': {
                                    borderColor: 'warning.main',
                                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                                  },
                                }}
                              >
                                <StarBorderIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                              </IconButton>
                            </Tooltip>
                          ))}
                          {nonFavorites.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{nonFavorites.length - 3}
                            </Typography>
                          )}
                        </Box>
                      )}
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
    </Box>
  );
};

export default WalletsPage;

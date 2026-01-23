import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  Avatar,
  Chip,
  Grid,
  Skeleton,
  Divider,
  useTheme,
  LinearProgress,
} from '@mui/material';
import { alpha, darken, lighten } from '@mui/material/styles';
import {
  ArrowBack as BackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BankIcon,
  CurrencyBitcoin as CryptoIcon,
  Home as RealEstateIcon,
  MoreHoriz as OtherIcon,
  ShowChart as InvestmentsIcon,
  ChevronRight as ChevronRightIcon,
  AccountBalanceWallet as WalletIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import type { Wallet, WalletCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getWalletLabel, getWalletColor } from '../utils/walletConfig';
import { getWalletIconEmoji } from '../utils/walletIcons';
import { walletsService } from '../api/wallets';

// Category config with icons and descriptions
const categoryConfig: Record<WalletCategory, { 
  icon: React.ReactNode; 
  description: string;
  features: string[];
}> = {
  BANK_CASH: {
    icon: <BankIcon sx={{ fontSize: 32 }} />,
    description: 'Track your bank accounts, cash, and everyday spending money.',
    features: ['Checking accounts', 'Savings accounts', 'Cash on hand', 'Debit cards'],
  },
  INVESTMENTS: {
    icon: <InvestmentsIcon sx={{ fontSize: 32 }} />,
    description: 'Monitor your investment portfolio and track market performance.',
    features: ['Stocks & ETFs', 'Bonds', 'Mutual funds', 'Retirement accounts'],
  },
  CRYPTO: {
    icon: <CryptoIcon sx={{ fontSize: 32 }} />,
    description: 'Manage your cryptocurrency holdings across different blockchains.',
    features: ['Bitcoin', 'Ethereum', 'Altcoins', 'DeFi positions'],
  },
  REAL_ESTATE: {
    icon: <RealEstateIcon sx={{ fontSize: 32 }} />,
    description: 'Track property values and real estate investments.',
    features: ['Primary residence', 'Rental properties', 'REITs', 'Land investments'],
  },
  OTHER: {
    icon: <OtherIcon sx={{ fontSize: 32 }} />,
    description: 'Manage other assets that don\'t fit into standard categories.',
    features: ['Collectibles', 'Vehicles', 'Business equity', 'Other valuables'],
  },
};

// Valid categories for URL validation
const validCategories = ['bank-cash', 'investments', 'crypto', 'real-estate', 'other'];

// URL slug to WalletCategory mapping
const slugToCategory: Record<string, WalletCategory> = {
  'bank-cash': 'BANK_CASH',
  'investments': 'INVESTMENTS',
  'crypto': 'CRYPTO',
  'real-estate': 'REAL_ESTATE',
  'other': 'OTHER',
};

const WalletCategoryPage = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Convert slug to category type
  const category = categorySlug ? slugToCategory[categorySlug] : undefined;

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        const allWallets = await walletsService.getWallets();
        setWallets(allWallets);
      } catch {
        setWallets([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallets();
  }, []);

  // Filter wallets by category
  const categoryWallets = useMemo(() => {
    if (!category) return [];
    return wallets.filter((w) => w.type === category);
  }, [wallets, category]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = categoryWallets.reduce((sum, w) => sum + w.balance, 0);
    const dailyChange = categoryWallets.reduce((sum, w) => sum + (w.dailyChange || 0), 0);
    const walletsCount = categoryWallets.length;
    const maxBalance = Math.max(...categoryWallets.map((w) => w.balance), 1);
    return { total, dailyChange, walletsCount, maxBalance };
  }, [categoryWallets]);

  // Invalid category
  if (!categorySlug || !validCategories.includes(categorySlug) || !category) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Category not found
        </Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/wallets')}>
          Back to Wallets
        </Button>
      </Box>
    );
  }

  const config = categoryConfig[category];
  const headerBaseColor = getWalletColor(category);
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

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={100} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
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

      {/* Category Header Card */}
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
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Avatar
              sx={{
                bgcolor: alpha('#ffffff', theme.palette.mode === 'dark' ? 0.18 : 0.35),
                border: `1px solid ${alpha('#ffffff', theme.palette.mode === 'dark' ? 0.25 : 0.4)}`,
                width: 72,
                height: 72,
                color: headerTextColor,
              }}
            >
              {config.icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                {getWalletLabel(category)}
              </Typography>
              <Typography sx={{ opacity: 0.85, mb: 2, maxWidth: 500 }}>
                {config.description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {config.features.map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    size="small"
                    sx={{ 
                      bgcolor: headerAccentBg, 
                      color: headerTextColor,
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: alpha(headerTextColor, 0.2) }} />

          {/* Stats Row */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                  Total Balance
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {formatCurrency(stats.total, 'PLN')}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                  Daily Change
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {stats.dailyChange >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 20 }} />
                  )}
                  <Typography variant="h5" fontWeight={600}>
                    {stats.dailyChange >= 0 ? '+' : ''}{formatCurrency(stats.dailyChange, 'PLN')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                  Wallets
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {stats.walletsCount}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Wallets Section */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={600}>
          <WalletIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 22 }} />
          Your {getWalletLabel(category)} Wallets
        </Typography>
        <Chip 
          label={`${stats.walletsCount} wallet${stats.walletsCount !== 1 ? 's' : ''}`}
          size="small"
          sx={{ bgcolor: alpha(headerBaseColor, 0.15), color: headerBaseColor }}
        />
      </Box>

      {categoryWallets.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(headerBaseColor, 0.15),
              color: headerBaseColor,
              mx: 'auto',
              mb: 2,
            }}
          >
            {config.icon}
          </Avatar>
          <Typography variant="h6" gutterBottom>
            No {getWalletLabel(category)} wallets yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create your first wallet in this category to start tracking.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/wallets')}
            sx={{ bgcolor: headerBaseColor }}
          >
            Go to Wallets
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {categoryWallets.map((wallet) => {
            const balancePercent = (wallet.balance / stats.maxBalance) * 100;
            const sharePercent = stats.total > 0 ? (wallet.balance / stats.total) * 100 : 0;
            
            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={wallet.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/wallets/${wallet.id}`, {
                      state: {
                        from: 'category',
                        categoryPath: location.pathname,
                        categoryLabel: category ? getWalletLabel(category) : 'Category',
                      },
                    })}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(headerBaseColor, 0.15),
                            color: headerBaseColor,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <Box component="span" sx={{ fontSize: 24 }}>
                            {getWalletIconEmoji(wallet.icon)}
                          </Box>
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={600} noWrap>
                            {wallet.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {wallet.currency} • {sharePercent.toFixed(1)}% of category
                          </Typography>
                        </Box>
                        <ChevronRightIcon color="action" />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="h6" fontWeight={700}>
                            {formatCurrency(wallet.balance, wallet.currency)}
                          </Typography>
                          {wallet.dailyChange !== undefined && wallet.dailyChange !== 0 && (
                            <Chip
                              size="small"
                              icon={wallet.dailyChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              label={`${wallet.dailyChange >= 0 ? '+' : ''}${formatCurrency(wallet.dailyChange, wallet.currency)}`}
                              sx={{
                                bgcolor: wallet.dailyChange >= 0 
                                  ? alpha(theme.palette.success.main, 0.15)
                                  : alpha(theme.palette.error.main, 0.15),
                                color: wallet.dailyChange >= 0 
                                  ? 'success.main' 
                                  : 'error.main',
                                '& .MuiChip-icon': {
                                  color: 'inherit',
                                  fontSize: 16,
                                },
                              }}
                            />
                          )}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={balancePercent}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(headerBaseColor, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: headerBaseColor,
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>

                      {wallet.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {wallet.description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Distribution Chart Card */}
      {categoryWallets.length > 1 && (
        <Card sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 22 }} />
            Balance Distribution
          </Typography>
          <Grid container spacing={2}>
            {categoryWallets
              .sort((a, b) => b.balance - a.balance)
              .map((wallet) => {
                const percent = stats.total > 0 ? (wallet.balance / stats.total) * 100 : 0;
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={wallet.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(headerBaseColor, 0.15),
                          color: headerBaseColor,
                          width: 36,
                          height: 36,
                        }}
                      >
                        <Box component="span" sx={{ fontSize: 18 }}>
                          {getWalletIconEmoji(wallet.icon)}
                        </Box>
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {wallet.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {percent.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(headerBaseColor, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: headerBaseColor,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 80, textAlign: 'right' }}>
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
          </Grid>
        </Card>
      )}
    </Box>
  );
};

export default WalletCategoryPage;

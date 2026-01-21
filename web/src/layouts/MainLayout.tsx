import { useState, useMemo, type ReactNode } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as TransactionIcon,
  CreditCard as LiabilityIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalance as BankIcon,
  TrendingUp as InvestmentsIcon,
  CurrencyBitcoin as CryptoIcon,
  Home as RealEstateIcon,
  MoreHoriz as OtherIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { logout } from '../features/auth/authSlice';
import { useColorMode } from '../contexts/ColorModeContext';
import type { WalletCategory } from '../types';
import { getWalletLabel } from '../utils/walletConfig';
import mtDark from '../assets/mt_dark.png';
import mtLight from '../assets/mt_light.png';
import { authService } from '../api/authService';

const DRAWER_WIDTH = 260;

// Icon mapping for wallet categories
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

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  hasChildren?: boolean;
}

const baseMenuItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Wallets', icon: <WalletIcon />, path: '/wallets', hasChildren: true },
  { text: 'Liabilities', icon: <LiabilityIcon />, path: '/liabilities' },
  { text: 'Transactions', icon: <TransactionIcon />, path: '/transactions' },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
];

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { wallets } = useAppSelector((state) => state.wallets);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [walletsOpen, setWalletsOpen] = useState(true);

  // Predefined category order (same as WalletsPage)
  const categoryOrder: WalletCategory[] = useMemo(
    () => ['BANK_CASH', 'INVESTMENTS', 'CRYPTO', 'REAL_ESTATE', 'OTHER'],
    []
  );

  // Dynamically compute which categories have wallets, sorted by predefined order
  const walletCategories = useMemo(() => {
    const categoriesWithWallets = new Set<WalletCategory>();
    wallets.forEach((wallet) => categoriesWithWallets.add(wallet.type));
    
    return categoryOrder
      .filter((category) => categoriesWithWallets.has(category))
      .map((category) => ({
        text: getWalletLabel(category),
        icon: categoryIcons[category],
        path: `/wallets/${categorySlug[category]}`,
        category,
      }));
  }, [wallets, categoryOrder]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // If the backend logout fails, still clear local auth state.
    } finally {
      dispatch(logout());
      handleMenuClose();
      navigate('/login');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      caretColor: 'transparent',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          height: 72,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <Box
          component="img"
          src={mode === 'dark' ? mtDark : mtLight}
          alt="MoneyTracker"
          draggable={false}
          sx={{
            height: 144,
            width: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </Box>

      <Divider />

      <List sx={{ 
        flex: 1, 
        px: 2, 
        py: 2,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }}>
        {baseMenuItems.map((item) => (
          <Box key={item.text}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  handleNavigation(item.path);
                  // Auto-expand wallets submenu when clicking on Wallets
                  if (item.hasChildren && !walletsOpen) {
                    setWalletsOpen(true);
                  }
                }}
                selected={location.pathname === item.path || (item.hasChildren && location.pathname.startsWith(item.path))}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.hasChildren && walletCategories.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWalletsOpen(!walletsOpen);
                    }}
                    sx={{ 
                      color: 'inherit',
                      p: 0.5,
                      ml: 1,
                    }}
                  >
                    {walletsOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                )}
              </ListItemButton>
            </ListItem>
            {item.hasChildren && walletCategories.length > 0 && (
              <Collapse in={walletsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {walletCategories.map((child) => (
                    <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavigation(child.path)}
                        selected={location.pathname === child.path}
                        sx={{
                          pl: 4,
                          borderRadius: 2,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'white',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.text} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      <Divider />

      {/* User panel - Discord style */}
      <Box sx={{ p: 2 }}>
        <Box
          onClick={handleMenuOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1,
            borderRadius: 2,
            bgcolor: 'action.hover',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 36, 
              height: 36,
            }}
          >
            {user?.firstName?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.firstName || 'User'} {user?.lastName || ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
          <SettingsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        </Box>
      </Box>

      {/* User menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { minWidth: 200 },
          },
        }}
      >
        <MenuItem onClick={() => { handleNavigation('/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleNavigation('/settings'); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={toggleColorMode}>
          <ListItemIcon>
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile menu button - floating */}
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{
            display: { md: 'none' },
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
          height: '100vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;

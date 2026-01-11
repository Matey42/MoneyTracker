import { useEffect, useState } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LeaveIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import type { Wallet, WalletCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getWalletLabel, getWalletColor } from '../utils/walletConfig';

// Mock data
const mockWallets: Wallet[] = [
  { id: '1', name: 'Personal Account', type: 'BANK', currency: 'PLN', balance: 8500.5, isOwner: true, isShared: false, createdAt: '2024-01-01', description: 'My main checking account' },
  { id: '2', name: 'Family Budget', type: 'BANK', currency: 'PLN', balance: 4200.0, isOwner: true, isShared: true, memberCount: 3, createdAt: '2024-01-15', description: 'Shared family expenses' },
  { id: '3', name: 'Emergency Savings', type: 'BANK', currency: 'PLN', balance: 15000.0, isOwner: true, isShared: false, createdAt: '2024-02-01' },
  { id: '4', name: 'Vacation Fund', type: 'BANK', currency: 'PLN', balance: 2720.0, isOwner: true, isShared: false, createdAt: '2024-03-01' },
  { id: '5', name: 'Business Account', type: 'BANK', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, createdAt: '2024-04-01' },
  { id: '6', name: 'Shared Apartment', type: 'BANK', currency: 'PLN', balance: 800.0, isOwner: false, isShared: true, memberCount: 2, createdAt: '2024-05-01' },
];

const walletTypes: { value: WalletCategory; label: string }[] = [
  { value: 'BANK', label: 'Bank Account' },
  { value: 'CASH', label: 'Cash' },
  { value: 'INVESTMENTS', label: 'Investments' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'OTHER', label: 'Other' },
];

const WalletsPage = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; wallet: Wallet } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'BANK' as WalletCategory,
    description: '',
  });

  useEffect(() => {
    const fetchWallets = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setWallets(mockWallets);
      setIsLoading(false);
    };
    fetchWallets();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, wallet: Wallet) => {
    event.stopPropagation();
    setMenuAnchor({ element: event.currentTarget, wallet });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleCreateWallet = () => {
    const wallet: Wallet = {
      id: String(Date.now()),
      name: newWallet.name,
      type: newWallet.type,
      currency: 'PLN',
      balance: 0,
      isOwner: true,
      isShared: false,
      createdAt: new Date().toISOString(),
      description: newWallet.description,
    };
    setWallets([...wallets, wallet]);
    setCreateDialogOpen(false);
    setNewWallet({ name: '', type: 'BANK', description: '' });
  };

  const handleDeleteWallet = () => {
    if (menuAnchor) {
      setWallets(wallets.filter((w) => w.id !== menuAnchor.wallet.id));
      handleMenuClose();
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Wallets
          </Typography>
          <Typography color="text.secondary">
            Total balance: <strong>{formatCurrency(totalBalance)}</strong>
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Wallet
        </Button>
      </Box>

      {/* Wallets Grid */}
      <Grid container spacing={3}>
        {wallets.map((wallet) => (
          <Grid key={wallet.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/wallets/${wallet.id}`)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getWalletColor(wallet.type),
                        width: 48,
                        height: 48,
                      }}
                    >
                      <WalletIcon />
                    </Avatar>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, wallet)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                    {wallet.name}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={getWalletLabel(wallet.type)}
                      size="small"
                      sx={{
                        bgcolor: `${getWalletColor(wallet.type)}20`,
                        color: getWalletColor(wallet.type),
                        fontWeight: 600,
                      }}
                    />
                    {!wallet.isOwner && (
                      <Chip
                        icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                        label="Shared"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {formatCurrency(wallet.balance, wallet.currency)}
                  </Typography>

                  {wallet.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                      noWrap
                    >
                      {wallet.description}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}

        {/* Add New Wallet Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              minHeight: 200,
              border: '2px dashed',
              borderColor: 'divider',
              bgcolor: 'transparent',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
            onClick={() => setCreateDialogOpen(true)}
          >
            <CardContent
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar sx={{ bgcolor: 'action.hover', mb: 2 }}>
                <AddIcon color="action" />
              </Avatar>
              <Typography color="text.secondary">Create New Wallet</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { navigate(`/wallets/${menuAnchor?.wallet.id}/edit`); handleMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/wallets/${menuAnchor?.wallet.id}/members`); handleMenuClose(); }}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          Members
        </MenuItem>
        {menuAnchor?.wallet.isOwner ? (
          <MenuItem onClick={handleDeleteWallet} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete
          </MenuItem>
        ) : (
          <MenuItem onClick={handleDeleteWallet} sx={{ color: 'warning.main' }}>
            <ListItemIcon>
              <LeaveIcon fontSize="small" color="warning" />
            </ListItemIcon>
            Leave
          </MenuItem>
        )}
      </Menu>

      {/* Create Dialog */}
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

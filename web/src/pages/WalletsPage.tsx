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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as LeaveIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
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
  const walletGroups = useMemo(() => (
    walletTypes.map((type) => {
      const items = wallets.filter((wallet) => wallet.type === type.value);
      const balance = items.reduce((sum, wallet) => sum + wallet.balance, 0);
      return {
        ...type,
        color: getWalletColor(type.value),
        items,
        balance,
      };
    })
  ), [wallets]);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={320} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        overflowX: 'hidden',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }}
    >
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

      {/* Wallets by Type */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {walletGroups.map((group) => {
          const personalItems = group.items.filter((wallet) => !wallet.isShared);
          const sharedItems = group.items.filter((wallet) => wallet.isShared);
          const previewPersonal = personalItems.slice(0, 2);
          const previewShared = sharedItems.slice(0, 2);
          const extraPersonal = Math.max(personalItems.length - previewPersonal.length, 0);
          const extraShared = Math.max(sharedItems.length - previewShared.length, 0);
          const isExpanded = expandedGroups[group.value] ?? false;

          return (
            <Accordion
              key={group.value}
              expanded={isExpanded}
              onChange={(_, nextExpanded) => {
                setExpandedGroups((current) => ({
                  ...current,
                  [group.value]: nextExpanded,
                }));
              }}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                background: `linear-gradient(180deg, ${alpha(group.color, 0.06)}, transparent 45%)`,
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    my: 0,
                  },
                  minHeight: 170,
                  py: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    width: '100%',
                    pr: 1,
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: group.color,
                          }}
                        />
                        <Typography variant="h6" fontWeight={700}>
                          {group.label}
                        </Typography>
                        <Chip
                          label={getWalletLabel(group.value)}
                          size="small"
                          sx={{
                            bgcolor: alpha(group.color, 0.16),
                            color: group.color,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {group.items.length} wallets · {formatCurrency(group.balance)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={(event) => {
                        event.stopPropagation();
                        setCreateDialogOpen(true);
                        setNewWallet((current) => ({ ...current, type: group.value }));
                      }}
                    >
                      Add wallet
                    </Button>
                  </Box>

                  {!isExpanded && (
                    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2, flexWrap: 'wrap', pl: 0.5 }}>
                      <Box sx={{ flex: '1 1 240px', minWidth: 220 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          Personal
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {personalItems.length === 0 ? (
                            <Chip label="No personal wallets" size="small" variant="outlined" />
                          ) : (
                            <>
                              {previewPersonal.map((wallet) => (
                                <Card
                                  key={wallet.id}
                                  variant="outlined"
                                  sx={{
                                    px: 1.5,
                                    py: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    borderRadius: 2,
                                    borderColor: alpha(group.color, 0.22),
                                    bgcolor: 'background.paper',
                                    minWidth: 180,
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: getWalletColor(wallet.type),
                                      width: 26,
                                      height: 26,
                                    }}
                                  >
                                    <WalletIcon sx={{ fontSize: 16 }} />
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="caption" fontWeight={600} noWrap>
                                      {wallet.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                      {formatCurrency(wallet.balance, wallet.currency)}
                                    </Typography>
                                  </Box>
                                </Card>
                              ))}
                              {extraPersonal > 0 && (
                                <Chip label={`+${extraPersonal} more`} size="small" variant="outlined" />
                              )}
                            </>
                          )}
                        </Box>
                      </Box>

                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ display: { xs: 'none', md: 'block' }, borderColor: alpha(group.color, 0.2) }}
                      />

                      <Box sx={{ flex: '1 1 240px', minWidth: 220 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          Shared
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {sharedItems.length === 0 ? (
                            <Chip label="No shared wallets" size="small" variant="outlined" />
                          ) : (
                            <>
                              {previewShared.map((wallet) => (
                                <Card
                                  key={wallet.id}
                                  variant="outlined"
                                  sx={{
                                    px: 1.5,
                                    py: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    borderRadius: 2,
                                    borderColor: alpha(group.color, 0.22),
                                    bgcolor: 'background.paper',
                                    minWidth: 180,
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: getWalletColor(wallet.type),
                                      width: 26,
                                      height: 26,
                                    }}
                                  >
                                    <WalletIcon sx={{ fontSize: 16 }} />
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="caption" fontWeight={600} noWrap>
                                      {wallet.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                      {formatCurrency(wallet.balance, wallet.currency)}
                                    </Typography>
                                  </Box>
                                </Card>
                              ))}
                              {extraShared > 0 && (
                                <Chip label={`+${extraShared} more`} size="small" variant="outlined" />
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {group.items.length === 0 ? (
                  <Card
                    variant="outlined"
                    sx={{
                      borderStyle: 'dashed',
                      bgcolor: 'transparent',
                      textAlign: 'center',
                    }}
                  >
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No wallets in this category yet.
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        Add wallet
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Personal
                        </Typography>
                        <Chip label={personalItems.length} size="small" variant="outlined" />
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      {personalItems.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No personal wallets in this category.
                        </Typography>
                      ) : (
                        <Grid container spacing={2}>
                          {personalItems.map((wallet) => (
                            <Grid key={wallet.id} size={{ xs: 12, sm: 6, md: 4 }}>
                              <Card
                                variant="outlined"
                                sx={{
                                  position: 'relative',
                                  borderColor: 'divider',
                                  height: '100%',
                                  minHeight: 168,
                                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
                                    borderColor: 'primary.main',
                                  },
                                }}
                              >
                                <CardActionArea
                                  onClick={() => navigate(`/wallets/${wallet.id}`)}
                                  sx={{ height: '100%' }}
                                >
                                  <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                                        <Avatar
                                          sx={{
                                            bgcolor: alpha(getWalletColor(wallet.type), 0.12),
                                            color: getWalletColor(wallet.type),
                                            width: 26,
                                            height: 26,
                                          }}
                                        >
                                          <WalletIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                        <Typography variant="subtitle1" fontWeight={700} noWrap>
                                          {wallet.name}
                                        </Typography>
                                      </Box>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, wallet)}
                                        sx={{ ml: 1 }}
                                      >
                                        <MoreIcon fontSize="small" />
                                      </IconButton>
                                    </Box>

                                    <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 1 }}>
                                      {formatCurrency(wallet.balance, wallet.currency)}
                                    </Typography>

                                    {wallet.description && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
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
                        </Grid>
                      )}
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Shared
                        </Typography>
                        <Chip label={sharedItems.length} size="small" variant="outlined" />
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      {sharedItems.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No shared wallets in this category.
                        </Typography>
                      ) : (
                        <Grid container spacing={2}>
                          {sharedItems.map((wallet) => (
                            <Grid key={wallet.id} size={{ xs: 12, sm: 6, md: 4 }}>
                              <Card
                                variant="outlined"
                                sx={{
                                  position: 'relative',
                                  borderColor: 'divider',
                                  height: '100%',
                                  minHeight: 168,
                                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
                                    borderColor: 'primary.main',
                                  },
                                }}
                              >
                                <CardActionArea
                                  onClick={() => navigate(`/wallets/${wallet.id}`)}
                                  sx={{ height: '100%' }}
                                >
                                  <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                                        <Avatar
                                          sx={{
                                            bgcolor: alpha(getWalletColor(wallet.type), 0.12),
                                            color: getWalletColor(wallet.type),
                                            width: 26,
                                            height: 26,
                                          }}
                                        >
                                          <WalletIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                        <Typography variant="subtitle1" fontWeight={700} noWrap>
                                          {wallet.name}
                                        </Typography>
                                      </Box>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, wallet)}
                                        sx={{ ml: 1 }}
                                      >
                                        <MoreIcon fontSize="small" />
                                      </IconButton>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
                                      <Chip
                                        icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                                        label={wallet.memberCount ? `${wallet.memberCount} members` : 'Members'}
                                        size="small"
                                        variant="outlined"
                                      />
                                      <Chip
                                        label={wallet.isOwner ? 'Owner' : 'Member'}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </Box>

                                    <Typography variant="h6" fontWeight={700} color="primary.main">
                                      {formatCurrency(wallet.balance, wallet.currency)}
                                    </Typography>

                                    {wallet.description && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
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
                        </Grid>
                      )}
                    </Box>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

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

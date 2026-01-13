import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Wallet, WalletCategory } from '../types';
import { formatCurrency, getRelativeTime } from '../utils/formatters';
import { getWalletLabel, getWalletColor } from '../utils/walletConfig';

// Mock data
const mockWallets: Wallet[] = [
  { id: '1', name: 'Personal Account', type: 'BANK', currency: 'PLN', balance: 8500.5, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-01-01', description: 'My main checking account' },
  { id: '2', name: 'Family Budget', type: 'BANK', currency: 'PLN', balance: 4200.0, isOwner: true, isShared: true, isFavorite: true, memberCount: 3, createdAt: '2024-01-15', description: 'Shared family expenses' },
  { id: '3', name: 'Emergency Savings', type: 'BANK', currency: 'PLN', balance: 15000.0, isOwner: true, isShared: false, createdAt: '2024-02-01' },
  { id: '4', name: 'Vacation Fund', type: 'BANK', currency: 'PLN', balance: 2720.0, isOwner: true, isShared: false, createdAt: '2024-03-01' },
  { id: '5', name: 'Business Account', type: 'BANK', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, createdAt: '2024-04-01' },
  { id: '6', name: 'Shared Apartment', type: 'BANK', currency: 'PLN', balance: 800.0, isOwner: false, isShared: true, memberCount: 2, createdAt: '2024-05-01' },
];

const walletTypes: { value: WalletCategory; label: string }[] = [
  { value: 'BANK', label: 'Bank Account' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'INVESTMENTS', label: 'Investments' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'OTHER', label: 'Other' },
];

const ORDER_STORAGE_KEY = 'wallets-order';

const SortableWalletItem = ({ id, children }: { id: string; children: ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </Box>
  );
};

const WalletsPage = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; wallet: Wallet } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [walletOrder, setWalletOrder] = useState<Record<string, string[]>>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) ?? '{}') as Record<string, string[]>;
    } catch {
      return {};
    }
  });
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'BANK' as WalletCategory,
    description: '',
  });

  useEffect(() => {
    const fetchWallets = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setWallets(mockWallets);
      setLastUpdated(new Date());
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
      isFavorite: false,
      createdAt: new Date().toISOString(),
      description: newWallet.description,
    };
    setWallets([...wallets, wallet]);
    setLastUpdated(new Date());
    setCreateDialogOpen(false);
    setNewWallet({ name: '', type: 'BANK', description: '' });
  };

  const handleDeleteWallet = () => {
    if (menuAnchor) {
      setWallets(wallets.filter((w) => w.id !== menuAnchor.wallet.id));
      setLastUpdated(new Date());
      handleMenuClose();
    }
  };

  const handleToggleFavorite = (event: React.MouseEvent<HTMLElement>, walletId: string) => {
    event.stopPropagation();
    setWallets((current) => current.map((wallet) => (
      wallet.id === walletId ? { ...wallet, isFavorite: !wallet.isFavorite } : wallet
    )));
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(walletOrder));
  }, [walletOrder]);

  const reorderWithFavorites = (ids: string[], lookup: Record<string, Wallet>) => {
    const favorites: string[] = [];
    const others: string[] = [];

    ids.forEach((id) => {
      if (lookup[id]?.isFavorite) {
        favorites.push(id);
      } else {
        others.push(id);
      }
    });

    return [...favorites, ...others];
  };

  const handleSectionDragEnd = (key: string, ids: string[], lookup: Record<string, Wallet>) => (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const moved = arrayMove(ids, oldIndex, newIndex);
    const adjusted = reorderWithFavorites(moved, lookup);

    setWalletOrder((current) => ({
      ...current,
      [key]: adjusted,
    }));
  };

  const disposableBalance = wallets
    .filter((wallet) => wallet.type === 'BANK' || wallet.type === 'CASH')
    .reduce((sum, wallet) => sum + wallet.balance, 0);
  const estimatedWorth = wallets
    .filter((wallet) => ['INVESTMENTS', 'REAL_ESTATE', 'CRYPTO', 'OTHER'].includes(wallet.type))
    .reduce((sum, wallet) => sum + wallet.balance, 0);
  const dailyCashDelta = disposableBalance * 0.0012;
  const dailyInvestDelta = estimatedWorth * 0.0021;
  const totalDailyChange = dailyCashDelta + dailyInvestDelta;
  const formatSigned = (value: number) => `${value >= 0 ? '+' : ''}${formatCurrency(value)}`;
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    setWalletOrder((current) => {
      let changed = false;
      const next = { ...current };

      walletGroups.forEach((group) => {
        const personalItems = group.items.filter((wallet) => !wallet.isShared);
        const sharedItems = group.items.filter((wallet) => wallet.isShared);
        const personalKey = `${group.value}-personal`;
        const sharedKey = `${group.value}-shared`;

        const updateOrder = (key: string, items: Wallet[]) => {
          const existing = next[key] ?? [];
          const existingSet = new Set(existing);
          const filtered = existing.filter((id) => items.some((wallet) => wallet.id === id));
          const missing = items.filter((wallet) => !existingSet.has(wallet.id)).map((wallet) => wallet.id);
          const updated = [...filtered, ...missing];

          if (existing.length !== updated.length || existing.some((id, index) => id !== updated[index])) {
            next[key] = updated;
            changed = true;
          } else if (!next[key]) {
            next[key] = updated;
            changed = true;
          }
        };

        updateOrder(personalKey, personalItems);
        updateOrder(sharedKey, sharedItems);
      });

      return changed ? next : current;
    });
  }, [walletGroups]);

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
                Disposable balance
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(disposableBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cash + bank accounts
              </Typography>
            </Box>
            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Estimated worth
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(estimatedWorth)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Investments + property + crypto + other
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            width: { xs: '100%', lg: 360 },
            alignItems: { xs: 'stretch', lg: 'flex-end' },
            mr: { lg: 1 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Daily change
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Box
                  sx={{
                    width: 3,
                    height: 26,
                    borderRadius: 999,
                    bgcolor: totalDailyChange === 0
                      ? 'info.main'
                      : totalDailyChange > 0
                        ? 'success.main'
                        : 'error.main',
                    boxShadow: `0 0 0 6px ${alpha(
                      totalDailyChange === 0
                        ? '#0ea5e9'
                        : totalDailyChange > 0
                          ? '#16a34a'
                          : '#dc2626',
                      0.12,
                    )}`,
                  }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                      color: totalDailyChange === 0
                        ? 'text.primary'
                        : totalDailyChange > 0
                          ? 'success.main'
                          : 'error.main',
                      lineHeight: 1.1,
                    }}
                  >
                    {formatSigned(totalDailyChange)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today · updated {lastUpdated ? getRelativeTime(lastUpdated) : '—'}
                  </Typography>
                </Box>
              </Box>
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
              label={`Investments & assets ${formatSigned(dailyInvestDelta)}`}
              size="small"
              sx={{
                bgcolor: alpha(dailyInvestDelta >= 0 ? '#16a34a' : '#dc2626', 0.12),
                color: dailyInvestDelta >= 0 ? 'success.main' : 'error.main',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Wallets by Type */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {walletGroups.map((group) => {
          const personalItems = group.items.filter((wallet) => !wallet.isShared);
          const sharedItems = group.items.filter((wallet) => wallet.isShared);
          const personalKey = `${group.value}-personal`;
          const sharedKey = `${group.value}-shared`;
          const personalOrderIds = walletOrder[personalKey] ?? personalItems.map((wallet) => wallet.id);
          const sharedOrderIds = walletOrder[sharedKey] ?? sharedItems.map((wallet) => wallet.id);
          const personalById = Object.fromEntries(personalItems.map((wallet) => [wallet.id, wallet])) as Record<string, Wallet>;
          const sharedById = Object.fromEntries(sharedItems.map((wallet) => [wallet.id, wallet])) as Record<string, Wallet>;
          const orderedPersonal = personalOrderIds.map((id) => personalById[id]).filter(Boolean);
          const orderedShared = sharedOrderIds.map((id) => sharedById[id]).filter(Boolean);
          const personalFavorites = orderedPersonal.filter((wallet) => wallet.isFavorite);
          const personalNonFavorites = orderedPersonal.filter((wallet) => !wallet.isFavorite);
          const sharedFavorites = orderedShared.filter((wallet) => wallet.isFavorite);
          const sharedNonFavorites = orderedShared.filter((wallet) => !wallet.isFavorite);
          const displayPersonal = [...personalFavorites, ...personalNonFavorites];
          const displayShared = [...sharedFavorites, ...sharedNonFavorites];
          const personalPreviewSource = personalFavorites.length > 0 ? personalFavorites : displayPersonal;
          const sharedPreviewSource = sharedFavorites.length > 0 ? sharedFavorites : displayShared;
          const personalPreviewItems = personalPreviewSource;
          const sharedPreviewItems = sharedPreviewSource;
          const onlyPersonal = personalItems.length > 0 && sharedItems.length === 0;
          const onlyShared = sharedItems.length > 0 && personalItems.length === 0;
          const isExpanded = expandedGroups[group.value] ?? false;
          const inlinePersonal = !isExpanded && onlyPersonal && personalPreviewItems.length > 0;
          const inlineShared = !isExpanded && onlyShared && sharedPreviewItems.length > 0;
          const showSplitMiniatures = !isExpanded && !onlyPersonal && !onlyShared;

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
                      {!isExpanded && inlinePersonal && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', overflowX: 'auto' }}>
                          {personalPreviewItems.map((wallet) => (
                            <Card
                              key={wallet.id}
                              variant="outlined"
                              sx={{
                                borderRadius: 2,
                                borderColor: alpha(group.color, 0.22),
                                bgcolor: 'background.paper',
                                minWidth: 180,
                              }}
                            >
                              <CardActionArea
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigate(`/wallets/${wallet.id}`);
                                }}
                                sx={{
                                  px: 1.5,
                                  py: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
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
                              </CardActionArea>
                            </Card>
                          ))}
                        </Box>
                      )}
                      {!isExpanded && inlineShared && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', overflowX: 'auto' }}>
                          {sharedPreviewItems.map((wallet) => (
                            <Card
                              key={wallet.id}
                              variant="outlined"
                              sx={{
                                position: 'relative',
                                borderRadius: 2,
                                borderColor: alpha(group.color, 0.22),
                                bgcolor: 'background.paper',
                                minWidth: 180,
                              }}
                            >
                              <CardActionArea
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigate(`/wallets/${wallet.id}`);
                                }}
                                sx={{
                                  px: 1.5,
                                  py: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
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
                              </CardActionArea>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  right: 6,
                                  bottom: 6,
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  bgcolor: 'background.paper',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <PeopleIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                              </Box>
                            </Card>
                          ))}
                        </Box>
                      )}
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

                  {showSplitMiniatures && (
                    <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2, flexWrap: 'wrap', pl: 0.5 }}>
                      {!inlinePersonal && (
                        <Box sx={{ flex: '1 1 240px', minWidth: 220 }}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary">
                            Personal
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            {personalItems.length === 0 ? (
                              <Chip label="No personal wallets" size="small" variant="outlined" />
                            ) : (
                              <>
                                {personalPreviewItems.map((wallet) => (
                                  <Card
                                    key={wallet.id}
                                    variant="outlined"
                                    sx={{
                                      borderRadius: 2,
                                      borderColor: alpha(group.color, 0.22),
                                      bgcolor: 'background.paper',
                                      minWidth: 180,
                                    }}
                                  >
                                    <CardActionArea
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        navigate(`/wallets/${wallet.id}`);
                                      }}
                                      sx={{
                                        px: 1.5,
                                        py: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
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
                                    </CardActionArea>
                                  </Card>
                                ))}
                              </>
                            )}
                          </Box>
                        </Box>
                      )}

                      {!inlineShared && sharedItems.length > 0 && (
                        <>
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
                              {sharedPreviewItems.length === 0 ? (
                                <Chip label="No shared wallets" size="small" variant="outlined" />
                              ) : (
                                <>
                                  {sharedPreviewItems.map((wallet) => (
                                    <Card
                                      key={wallet.id}
                                      variant="outlined"
                                      sx={{
                                        position: 'relative',
                                        borderRadius: 2,
                                        borderColor: alpha(group.color, 0.22),
                                        bgcolor: 'background.paper',
                                        minWidth: 180,
                                      }}
                                    >
                                      <CardActionArea
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          navigate(`/wallets/${wallet.id}`);
                                        }}
                                        sx={{
                                          px: 1.5,
                                          py: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
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
                                      </CardActionArea>
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          right: 6,
                                          bottom: 6,
                                          width: 18,
                                          height: 18,
                                          borderRadius: '50%',
                                          bgcolor: 'background.paper',
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <PeopleIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                      </Box>
                                    </Card>
                                  ))}
                                </>
                              )}
                            </Box>
                          </Box>
                        </>
                      )}
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
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleSectionDragEnd(`${group.value}-personal`, displayPersonal.map((wallet) => wallet.id), personalById)}
                        >
                          <SortableContext items={displayPersonal.map((wallet) => wallet.id)} strategy={rectSortingStrategy}>
                            <Grid container spacing={2}>
                              {displayPersonal.map((wallet) => (
                                <Grid key={wallet.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                  <SortableWalletItem id={wallet.id}>
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <IconButton
                                                size="small"
                                                onClick={(event) => handleToggleFavorite(event, wallet.id)}
                                                sx={{ color: wallet.isFavorite ? 'warning.main' : 'text.secondary' }}
                                                aria-label={wallet.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                              >
                                                {wallet.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                              </IconButton>
                                              <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, wallet)}
                                                sx={{ ml: 0.5 }}
                                              >
                                                <MoreIcon fontSize="small" />
                                              </IconButton>
                                            </Box>
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
                                  </SortableWalletItem>
                                </Grid>
                              ))}
                            </Grid>
                          </SortableContext>
                        </DndContext>
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
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleSectionDragEnd(`${group.value}-shared`, displayShared.map((wallet) => wallet.id), sharedById)}
                        >
                          <SortableContext items={displayShared.map((wallet) => wallet.id)} strategy={rectSortingStrategy}>
                            <Grid container spacing={2}>
                              {displayShared.map((wallet) => (
                                <Grid key={wallet.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                  <SortableWalletItem id={wallet.id}>
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <IconButton
                                                size="small"
                                                onClick={(event) => handleToggleFavorite(event, wallet.id)}
                                                sx={{ color: wallet.isFavorite ? 'warning.main' : 'text.secondary' }}
                                                aria-label={wallet.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                              >
                                                {wallet.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                              </IconButton>
                                              <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, wallet)}
                                                sx={{ ml: 0.5 }}
                                              >
                                                <MoreIcon fontSize="small" />
                                              </IconButton>
                                            </Box>
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
                                  </SortableWalletItem>
                                </Grid>
                              ))}
                            </Grid>
                          </SortableContext>
                        </DndContext>
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

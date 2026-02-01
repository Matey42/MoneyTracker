export const walletIconOptions = [
  { id: 'wallet', label: 'Wallet', icon: '\u{1F4B0}' },
  { id: 'bank', label: 'Bank', icon: '\u{1F3E6}' },
  { id: 'piggy', label: 'Piggy Bank', icon: '\u{1F437}' },
  { id: 'safe', label: 'Safe', icon: '\u{1F510}' },
  { id: 'credit', label: 'Credit Card', icon: '\u{1F4B3}' },
  { id: 'cash', label: 'Cash', icon: '\u{1F4B5}' },
  { id: 'coins', label: 'Coins', icon: '\u{1FA99}' },
  { id: 'chart', label: 'Chart', icon: '\u{1F4C8}' },
  { id: 'bitcoin', label: 'Bitcoin', icon: '\u{20BF}' },
  { id: 'house', label: 'House', icon: '\u{1F3E0}' },
  { id: 'building', label: 'Building', icon: '\u{1F3E2}' },
  { id: 'briefcase', label: 'Briefcase', icon: '\u{1F4BC}' },
];

export const getWalletIconEmoji = (id?: string): string => {
  if (!id) return walletIconOptions[0].icon;
  return walletIconOptions.find((option) => option.id === id)?.icon ?? walletIconOptions[0].icon;
};

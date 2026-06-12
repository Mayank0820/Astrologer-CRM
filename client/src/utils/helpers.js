// Zodiac sign data with symbols and colors
export const ZODIAC_DATA = {
  Aries: { symbol: '♈', emoji: '🐏', color: '#ff5252', element: 'Fire' },
  Taurus: { symbol: '♉', emoji: '🐂', color: '#4caf50', element: 'Earth' },
  Gemini: { symbol: '♊', emoji: '👯', color: '#ffeb3b', element: 'Air' },
  Cancer: { symbol: '♋', emoji: '🦀', color: '#90caf9', element: 'Water' },
  Leo: { symbol: '♌', emoji: '🦁', color: '#ff9800', element: 'Fire' },
  Virgo: { symbol: '♍', emoji: '👸', color: '#8bc34a', element: 'Earth' },
  Libra: { symbol: '♎', emoji: '⚖️', color: '#e91e63', element: 'Air' },
  Scorpio: { symbol: '♏', emoji: '🦂', color: '#9c27b0', element: 'Water' },
  Sagittarius: { symbol: '♐', emoji: '🏹', color: '#673ab7', element: 'Fire' },
  Capricorn: { symbol: '♑', emoji: '🐐', color: '#795548', element: 'Earth' },
  Aquarius: { symbol: '♒', emoji: '🏺', color: '#00bcd4', element: 'Air' },
  Pisces: { symbol: '♓', emoji: '🐟', color: '#3f51b5', element: 'Water' },
};

// Service icons mapping
export const SERVICE_ICONS = {
  scroll: '📜',
  heart: '💕',
  briefcase: '💼',
  gem: '💎',
  home: '🏠',
  hash: '🔢',
  calendar: '📅',
  shield: '🛡️',
  star: '⭐',
};

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format time
export function formatTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Format date and time
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Get zodiac badge color class
export function getZodiacColor(zodiac) {
  const colorMap = {
    Aries: 'pink', Taurus: 'green', Gemini: 'gold',
    Cancer: 'cyan', Leo: 'orange', Virgo: 'green',
    Libra: 'pink', Scorpio: 'purple', Sagittarius: 'purple',
    Capricorn: 'orange', Aquarius: 'cyan', Pisces: 'purple',
  };
  return colorMap[zodiac] || 'purple';
}

// Get status badge color
export function getStatusColor(status) {
  const map = {
    scheduled: 'cyan',
    completed: 'green',
    cancelled: 'red',
    pending: 'gold',
    paid: 'green',
  };
  return map[status] || 'gray';
}

// Get avatar gradient based on name
export function getAvatarGradient(name) {
  const gradients = [
    'linear-gradient(135deg, #7C6CFF, #9387FF)',
    'linear-gradient(135deg, #EF4444, #F97316)',
    'linear-gradient(135deg, #06B6D4, #7C6CFF)',
    'linear-gradient(135deg, #D4AF37, #F97316)',
    'linear-gradient(135deg, #22C55E, #16A34A)',
    'linear-gradient(135deg, #EF4444, #7C6CFF)',
    'linear-gradient(135deg, #F97316, #EF4444)',
    'linear-gradient(135deg, #06B6D4, #22C55E)',
  ];
  if (!name) return gradients[0];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

// Relative time (e.g., "2 hours ago")
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
}

// Month name from YYYY-MM
export function getMonthName(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString('en-IN', { month: 'short' });
}

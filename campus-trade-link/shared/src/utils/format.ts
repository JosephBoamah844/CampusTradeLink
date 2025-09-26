export const formatCurrency = (amount: number, currency = 'GHS'): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const extractHashtags = (text: string): string[] => {
  const hashtags = text.match(/#[a-zA-Z0-9_]+/g);
  return hashtags ? hashtags.map(tag => tag.toLowerCase()) : [];
};

export const extractMentions = (text: string): string[] => {
  const mentions = text.match(/@[a-zA-Z0-9_]+/g);
  return mentions ? mentions.map(mention => mention.slice(1).toLowerCase()) : [];
};

export const generateUsername = (email: string): string => {
  const baseUsername = email.split('@')[0];
  return baseUsername.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
};

export const isValidImageType = (mimetype: string): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimetype.toLowerCase());
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
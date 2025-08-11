export const getDaysLeft = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const isOverdue = (dueDate: string): boolean => {
  return getDaysLeft(dueDate) < 0;
};

export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return today.toDateString() === date.toDateString();
};

export const isTomorrow = (dateString: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = new Date(dateString);
  return tomorrow.toDateString() === date.toDateString();
};

export const getNextUpcoming = (items: { dueDate?: string; date?: string }[]) => {
  const now = new Date();
  return items
    .filter(item => {
      const date = new Date(item.dueDate || item.date || '');
      return date >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate || a.date || '');
      const dateB = new Date(b.dueDate || b.date || '');
      return dateA.getTime() - dateB.getTime();
    })[0];
};
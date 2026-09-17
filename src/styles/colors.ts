// Central Color Library for School ERP Admin
export const colors = {
  primary: {
    main: '#4e74f9',
    hover: '#3d5fd8',
    light: '#eef2ff',
    dark: '#2c43a0',
  },
  secondary: {
    main: '#6366f1',
    hover: '#4f46e5',
  },
  status: {
    success: {
      bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
      bgDark: 'dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
    },
    danger: {
      bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
      bgDark: 'dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
      text: 'text-rose-600 dark:text-rose-400',
    },
    info: {
      bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
      bgDark: 'dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
      bgDark: 'dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
    }
  },
  dark: {
    bgPage: 'dark:bg-slate-950',
    bgCard: 'dark:bg-slate-900',
    bgSurface: 'dark:bg-slate-800/80',
    bgHover: 'dark:hover:bg-slate-800',
    border: 'dark:border-slate-800',
    borderSubtle: 'dark:border-slate-700/60',
    textPrimary: 'dark:text-slate-100',
    textSecondary: 'dark:text-slate-400',
    textMuted: 'dark:text-slate-500',
    inputBg: 'dark:bg-slate-800/90 dark:text-slate-100 dark:border-slate-700',
  }
};

export const formatRupee = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return `₹${num.toLocaleString('en-IN')}`;
};

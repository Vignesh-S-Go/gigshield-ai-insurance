export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getRiskColor(score) {
  if (score >= 0.7) return { bg: 'bg-danger-50 text-danger-700', text: 'text-danger-700', dark: 'dark:bg-danger-500/20 dark:text-danger-400 dark:border-danger-500/20' };
  if (score >= 0.4) return { bg: 'bg-warning-50 text-warning-700', text: 'text-warning-700', dark: 'dark:bg-warning-500/20 dark:text-warning-400 dark:border-warning-500/20' };
  return { bg: 'bg-success-50 text-success-700', text: 'text-success-700', dark: 'dark:bg-success-500/20 dark:text-success-400 dark:border-success-500/20' };
}

export function getStatusColor(status) {
  const colors = {
    Approved: 'bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 border-primary-200/50',
    Paid: 'bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-300 border-success-200/50',
    Flagged: 'bg-danger-50 text-danger-700 dark:bg-danger-500/20 dark:text-danger-300 border-danger-200/50',
    Pending: 'bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-300 border-warning-200/50',
    Active: 'bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-300 border-success-200/50',
    Expired: 'bg-dark-100 text-dark-500 dark:bg-dark-800 dark:text-dark-400 border-dark-200/50',
    active: 'bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-300 border-success-200/50',
    inactive: 'bg-dark-100 text-dark-500 dark:bg-dark-800 dark:text-dark-400 border-dark-200/50',
  };
  return colors[status] || 'bg-dark-100 text-dark-600';
}

export function getPlanColor(plan) {
  const colors = {
    Basic: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    Standard: 'bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300',
    Pro: 'bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-300',
  };
  return colors[plan] || 'bg-dark-100 text-dark-600';
}

export function getTriggerIcon(type) {
  const icons = {
    Rain: '🌧️',
    Heat: '🌡️',
    Flood: '🌊',
    AQI: '💨',
    Curfew: '🚫',
  };
  return icons[type] || '⚡';
}

export function exportToCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (typeof val === 'object') return JSON.stringify(val);
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

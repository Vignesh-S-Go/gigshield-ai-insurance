import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', message = 'There are no items to display at the moment.', action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-dark-300 dark:text-dark-600" />
      </div>
      <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-300 mb-1">{title}</h3>
      <p className="text-sm text-dark-400 dark:text-dark-500 text-center max-w-sm">{message}</p>
      {action && (
        <button onClick={action} className="btn-primary mt-4">
          {actionLabel || 'Take Action'}
        </button>
      )}
    </div>
  );
}

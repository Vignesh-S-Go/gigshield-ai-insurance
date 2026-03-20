import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[85vh] overflow-hidden animate-scale-in`}>
        <div className="flex items-center justify-between p-5 border-b border-dark-100 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-5 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom'; // <-- 1. Import createPortal

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
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  // 2. Wrap the return in createPortal and target document.body
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Card - Added flex-col to keep header sticky while content scrolls */}
      <div className={`relative bg-white dark:bg-dark-800 rounded-3xl shadow-2xl w-full ${sizeClasses[size]} max-h-[85vh] flex flex-col animate-scale-in border border-white/20 dark:border-dark-700`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900/50 shrink-0 rounded-t-3xl">
          <h2 className="text-xl font-bold text-dark-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-all text-dark-400 hover:text-dark-600 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 scrollbar-thin flex-1">
          {children}
        </div>

      </div>
    </div>,
    document.body // <-- 3. The destination for the portal
  );
}
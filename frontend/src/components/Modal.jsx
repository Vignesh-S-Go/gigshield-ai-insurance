import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {

  // 🔥 UPGRADE: Escape Key Listener & Scrollbar Jump Fix
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      // Calculate scrollbar width to prevent page jump
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';

      // Listen for ESC key
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.paddingRight = '0px';
      document.body.style.overflow = '';
    }

    // Cleanup
    return () => {
      document.body.style.paddingRight = '0px';
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dimmed Backdrop - Clicking this closes the modal */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card Container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white dark:bg-dark-800 rounded-3xl shadow-2xl w-full ${sizeClasses[size]} max-h-[85vh] flex flex-col animate-scale-in border border-white/20 dark:border-dark-700`}
      >

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-100 dark:border-dark-700 bg-slate-50/50 dark:bg-dark-900/50 shrink-0 rounded-t-3xl">
          <h2 className="text-xl font-bold text-dark-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-all text-dark-400 hover:text-dark-600 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto p-6 scrollbar-thin flex-1">
          {children}
        </div>

      </div>
    </div>,
    document.body
  );
}
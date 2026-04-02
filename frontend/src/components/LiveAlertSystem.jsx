import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import useStore from '../store/useStore';

export default function LiveAlertSystem() {
    const liveAlerts = useStore((state) => state.liveAlerts);

    const getIcon = (type) => {
        switch (type) {
            case 'danger': return <AlertTriangle className="w-5 h-5 text-danger-500" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-success-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-warning-500" />;
            default: return <Info className="w-5 h-5 text-primary-500" />;
        }
    };

    const getBorder = (type) => {
        switch (type) {
            case 'danger': return 'border-danger-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
            case 'success': return 'border-success-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
            case 'warning': return 'border-warning-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
            default: return 'border-primary-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]';
        }
    };

    return (
        <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
            <AnimatePresence>
                {liveAlerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }}
                        className={`flex items-start gap-3 p-4 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border rounded-2xl ${getBorder(alert.type)}`}
                    >
                        <div className="shrink-0 mt-0.5">{getIcon(alert.type)}</div>
                        <div>
                            <p className="font-bold text-sm text-dark-800 dark:text-dark-100">{alert.title}</p>
                            <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5 leading-relaxed">{alert.message}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

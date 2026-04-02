import { motion } from 'framer-motion';
import { CheckCircle, Cpu, FileText, FileWarning, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DecisionFlow({ triggerType, isApproved }) {
    const steps = [
        { id: 'claim', label: 'Claim', icon: FileText },
        { id: 'risk', label: 'Risk Engine', icon: Cpu },
        { id: 'policy', label: 'Policy Check', icon: ShieldCheck },
        { id: 'exclusion', label: 'Exclusion', icon: FileWarning },
        { id: 'decision', label: 'Decision', icon: isApproved ? CheckCircle : XCircle },
    ];

    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 800);
        return () => clearInterval(timer);
    }, [steps.length]);

    return (
        <div className="w-full py-6 isolate">
            <div className="flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 bg-dark-100 dark:bg-dark-700 -z-10 rounded-full" />

                {/* Animated Active Line */}
                <motion.div
                    className="absolute left-[10%] top-1/2 -translate-y-1/2 h-1 bg-primary-500 -z-10 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(Math.min(activeStep, steps.length - 1) / (steps.length - 1)) * 80}%` }}
                    transition={{ duration: 0.5 }}
                />

                {steps.map((step, index) => {
                    const isActive = index <= activeStep;
                    const isLast = index === steps.length - 1;
                    const Icon = step.icon;

                    let colorClass = isActive ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" : "bg-white dark:bg-dark-800 text-dark-400 border border-dark-200 dark:border-dark-700";
                    if (isLast && isActive) {
                        colorClass = isApproved
                            ? "bg-success-500 text-white shadow-lg shadow-success-500/30"
                            : "bg-danger-500 text-white shadow-lg shadow-danger-500/30";
                    }

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-1/5">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: isActive ? 1.1 : 1, opacity: 1 }}
                                whileHover={isActive ? { scale: 1.2 } : {}}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${colorClass}`}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.div>
                            <div className="text-center">
                                <p className={`text-[10px] sm:text-xs font-bold ${isActive ? 'text-dark-800 dark:text-gray-100' : 'text-dark-400'}`}>
                                    {step.label}
                                </p>
                                {isActive && index === 1 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-primary-500 font-bold uppercase mt-0.5">Scoring...</motion.p>}
                                {isActive && index === 3 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-danger-500 font-bold uppercase mt-0.5">Checking...</motion.p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

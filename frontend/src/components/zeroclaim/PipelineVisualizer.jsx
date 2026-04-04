import { useState, useEffect } from 'react';
import { Cloud, FileCheck, Shield, DollarSign, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const STAGES = [
    { label: 'Trigger', icon: Cloud, description: 'Environmental Event' },
    { label: 'Policy Match', icon: FileCheck, description: 'Policy Lookup' },
    { label: 'Prevention', icon: Shield, description: 'Safety Alert' },
    { label: 'Fraud Check', icon: Shield, description: 'Risk Analysis' },
    { label: 'Payout', icon: DollarSign, description: 'Payment' },
];

export default function PipelineVisualizer({ activeStep }) {
    const [completed, setCompleted] = useState([]);
    const [current, setCurrent] = useState(-1);

    useEffect(() => {
        if (activeStep === 0) {
            setCompleted([]);
            setCurrent(0);
            STAGES.forEach((_, i) => {
                setTimeout(() => {
                    setCurrent(i);
                    setCompleted(prev => [...prev, i - 1].filter(x => x >= 0));
                }, i * 800);
            });
            setTimeout(() => {
                setCurrent(-1);
                setCompleted([]);
            }, STAGES.length * 800 + 1500);
        }
        if (activeStep === -1) { setCurrent(-1); setCompleted([]); }
    }, [activeStep]);

    return (
        <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between gap-1 overflow-x-auto">
                {STAGES.map((stage, i) => {
                    const Icon = stage.icon;
                    const isActive = current === i;
                    const isDone = completed.includes(i);
                    
                    return (
                        <div key={i} className="flex items-center flex-1 min-w-fit">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    opacity: isActive || isDone ? 1 : 0.5,
                                }}
                                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                                    isDone ? 'bg-success-500/10 border-success-500 text-success-500' :
                                    isActive ? 'bg-primary-500/10 border-primary-500 text-primary-500' :
                                    'bg-dark-100 dark:bg-dark-700 border-dark-300 dark:border-dark-600 text-dark-400'
                                }`}
                            >
                                {isDone ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : isActive ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                                <span className={`text-xs font-medium mt-1 ${isActive ? 'text-primary-500' : isDone ? 'text-success-500' : 'text-dark-400'}`}>
                                    {stage.label}
                                </span>
                            </motion.div>
                            {i < STAGES.length - 1 && (
                                <ArrowRight className={`w-4 h-4 mx-1 flex-shrink-0 ${isDone ? 'text-success-500' : 'text-dark-300 dark:text-dark-600'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-3 h-1.5 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-success-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                        width: activeStep === -1 ? '0%' : activeStep === 0 && current === -1 ? '100%' : `${(completed.length / STAGES.length) * 100}%`
                    }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
}

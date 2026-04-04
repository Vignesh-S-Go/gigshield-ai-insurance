import { Droplets, Wind, AlertTriangle, Shield } from 'lucide-react';

const protections = [
    { 
        icon: Droplets, 
        trigger: 'Rain > 75mm', 
        outcome: 'Payout triggered',
        color: 'text-primary-400'
    },
    { 
        icon: Wind, 
        trigger: 'AQI > 150', 
        outcome: 'Payout triggered',
        color: 'text-warning-500'
    },
    { 
        icon: AlertTriangle, 
        trigger: 'Flood Alert', 
        outcome: 'High payout triggered',
        color: 'text-danger-500'
    },
    { 
        icon: Shield, 
        trigger: 'Heat > 42°C', 
        outcome: 'Payout triggered',
        color: 'text-orange-500'
    },
];

export default function WhyProtectedSection() {
    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-success-500" />
                Why Am I Protected?
            </h3>
            
            <div className="space-y-2">
                {protections.map((prot, idx) => (
                    <div 
                        key={idx} 
                        className="flex items-center justify-between p-2 bg-dark-700/30 rounded-xl"
                    >
                        <div className="flex items-center gap-2">
                            <prot.icon className={`w-4 h-4 ${prot.color}`} />
                            <span className="text-xs text-dark-300">{prot.trigger}</span>
                        </div>
                        <span className="text-xs text-success-500 font-medium">{prot.outcome}</span>
                    </div>
                ))}
            </div>
            
            <p className="text-xs text-dark-500 mt-3 text-center">
                ZeroClaim automatically monitors these conditions for you
            </p>
        </div>
    );
}
import { Check, Shield, Zap, Crown } from 'lucide-react';

const plans = [
    { 
        id: 'Basic', 
        name: 'Basic', 
        price: 45, 
        coverage: '₹3,000',
        features: ['Basic parametric coverage', 'Weather triggers', 'Email support'],
        icon: Shield,
        color: 'border-dark-600'
    },
    { 
        id: 'Standard', 
        name: 'Standard', 
        price: 49, 
        coverage: '₹5,000',
        features: ['Enhanced coverage', 'Weather + AQI triggers', 'Priority support', 'Accident protection'],
        icon: Zap,
        color: 'border-primary-500'
    },
    { 
        id: 'Pro', 
        name: 'Pro', 
        price: 71, 
        coverage: '₹7,500',
        features: ['Full coverage', 'All triggers included', '24/7 priority support', 'Instant payouts', 'Theft protection'],
        icon: Crown,
        color: 'border-warning-500'
    }
];

export default function PlanSelectionModal({ isOpen, onSelect, currentPlan }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-white mb-2">Choose Your Plan</h2>
                    <p className="text-sm text-dark-400">Select the coverage that fits your needs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrent = currentPlan === plan.id;
                        const isSelected = isCurrent;

                        return (
                            <button
                                key={plan.id}
                                onClick={() => onSelect(plan.id)}
                                className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] text-left ${
                                    isSelected 
                                        ? `${plan.color} bg-dark-800` 
                                        : 'border-dark-700 hover:border-dark-600'
                                }`}
                            >
                                {isCurrent && (
                                    <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        Current
                                    </div>
                                )}
                                <div className={`p-2 rounded-xl ${plan.color} bg-dark-800 w-fit mb-3`}>
                                    <Icon className={`w-6 h-6 ${plan.id === 'Pro' ? 'text-warning-500' : plan.id === 'Standard' ? 'text-primary-400' : 'text-dark-400'}`} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-2xl font-black text-white mb-1">₹{plan.price}<span className="text-xs text-dark-400 font-normal">/week</span></p>
                                <p className="text-xs text-dark-500 mb-3">Coverage: {plan.coverage}</p>
                                <ul className="space-y-1">
                                    {plan.features.slice(0, 3).map((f, i) => (
                                        <li key={i} className="text-[10px] text-dark-400 flex items-center gap-1">
                                            <Check className="w-3 h-3 text-success-500" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        );
                    })}
                </div>

                <div className="text-center">
                    <p className="text-xs text-dark-500">
                        You can change your plan anytime from the dashboard settings.
                    </p>
                </div>
            </div>
        </div>
    );
}
import { ShieldCheck, BadgeCheck, Zap, Clock } from 'lucide-react';

const badges = [
    { icon: ShieldCheck, label: 'Fraud Checked', color: 'text-success-500', bg: 'bg-success-500/10' },
    { icon: BadgeCheck, label: 'Policy Verified', color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { icon: Zap, label: 'Instant Settlement', color: 'text-warning-500', bg: 'bg-warning-500/10' },
    { icon: Clock, label: '24/7 Active', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export default function TrustBadges() {
    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
                <div 
                    key={idx}
                    className={`flex items-center gap-1.5 px-3 py-1.5 ${badge.bg} rounded-full`}
                >
                    <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
                    <span className={`text-xs font-medium ${badge.color}`}>{badge.label}</span>
                </div>
            ))}
        </div>
    );
}
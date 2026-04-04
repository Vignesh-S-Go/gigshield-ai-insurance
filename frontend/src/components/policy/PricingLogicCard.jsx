import { Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';

export default function PricingLogicCard() {
    return (
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase text-dark-500 tracking-[0.2em]">Dynamic Pricing Logic</h2>
                <Calculator className="w-5 h-5 text-primary-400" />
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-xl border border-dark-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-success-500/10 rounded-lg">
                            <span className="text-xs font-bold text-success-500">₹50</span>
                        </div>
                        <span className="text-sm text-dark-400">Base Premium</span>
                    </div>
                    <span className="text-sm font-bold text-white">Weekly</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-xl border border-dark-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-danger-500/10 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-danger-500" />
                        </div>
                        <span className="text-sm text-dark-400">Risk Adjustment</span>
                    </div>
                    <span className="text-sm font-bold text-danger-400">+₹21.00</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-dark-800/30 rounded-xl border border-dark-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/10 rounded-lg">
                            <TrendingDown className="w-4 h-4 text-primary-400" />
                        </div>
                        <span className="text-sm text-dark-400">Impact Score Discount</span>
                    </div>
                    <span className="text-sm font-bold text-success-400">-₹0.00</span>
                </div>
            </div>

            <div className="p-4 bg-dark-800/50 rounded-2xl border border-dark-700 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-500 uppercase">Final Premium</span>
                    <span className="text-2xl font-black text-white">₹71.00</span>
                </div>
                <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-success-500 to-primary-500 w-[70%]"></div>
                </div>
            </div>

            <div className="p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl">
                <p className="text-xs text-dark-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary-400" />
                    Final Premium is dynamically calculated based on risk and worker dependency.
                </p>
            </div>
        </div>
    );
}
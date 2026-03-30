import { AlertCircle, CloudRain, Cpu, ShieldAlert, ShieldCheck, Skull } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../utils/helpers';
import { evaluateClaim } from '../utils/rulesEngine';

export default function TestEngine() {
    const [simResult, setSimResult] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const runSimulation = (eventType) => {
        setIsRunning(true);
        setSimResult(null);

        setTimeout(() => {
            let approved = 0;
            let rejected = 0;
            let lossSaved = 0;
            let message = '';
            let trigger = '';

            const simulateScenario = (type, ruleTrigger, claimsCount) => {
                const evalData = evaluateClaim({ trigger: ruleTrigger, location: 'Global' });
                if (!evalData.passed) {
                    rejected = claimsCount;
                    approved = 0;
                    lossSaved = claimsCount * 1250; // Avg $1250 payout
                    message = `100% Claims Rejected: ${evalData.message}`;
                    trigger = ruleTrigger;
                } else {
                    approved = Math.floor(claimsCount * 0.85); // 85% approved
                    rejected = Math.floor(claimsCount * 0.15); // 15% missing data
                    lossSaved = rejected * 1250;
                    message = "Simulated Parametric Natural Disaster. Standard claims approved based on threshold validation.";
                    trigger = ruleTrigger;
                }
            };

            if (eventType === 'Pandemic') {
                simulateScenario('Pandemic', 'Pandemic', 250);
            } else if (eventType === 'Terrorism') {
                simulateScenario('Terrorism', 'Terrorism', 100);
            } else if (eventType === 'Natural Disaster') {
                simulateScenario('Natural Disaster', 'Flood', 300);
            }

            setSimResult({
                type: eventType,
                approved,
                rejected,
                lossSaved,
                message,
                trigger
            });
            setIsRunning(false);
        }, 800);
    };

    return (
        <div className="glass-card rounded-2xl p-6 border border-primary-500/20 bg-primary-500/5 mt-6 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Cpu className="w-32 h-32" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-primary-500" /> Actuarial Test Engine
                    </h3>
                    <p className="text-sm text-dark-500 mt-1">Interactive Stress Testing: Simulate catastrophic events applying live Exclusion Rules.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => runSimulation('Pandemic')} disabled={isRunning} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs">
                        {isRunning ? '...' : <AlertCircle className="w-4 h-4 text-warning-500" />} Pandemic
                    </button>
                    <button onClick={() => runSimulation('Terrorism')} disabled={isRunning} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs">
                        {isRunning ? '...' : <Skull className="w-4 h-4 text-danger-500" />} Terrorism
                    </button>
                    <button onClick={() => runSimulation('Natural Disaster')} disabled={isRunning} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs">
                        {isRunning ? '...' : <CloudRain className="w-4 h-4 text-primary-500" />} Natural Disaster
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1">
                {simResult ? (
                    <div className="p-5 rounded-xl bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 shadow-sm animate-scale-in">
                        <div className="flex items-center justify-between space-x-4 mb-4">
                            <h4 className="font-bold text-dark-800 dark:text-gray-100">
                                Scenario Results: {simResult.type} Event
                            </h4>
                            {simResult.rejected > simResult.approved ? (
                                <span className="px-3 py-1 rounded bg-danger-500/10 text-danger-500 text-xs font-bold uppercase tracking-wider flexItemsCenter gap-1 border border-danger-500/20">
                                    <ShieldAlert className="w-4 h-4 inline-block -mt-0.5 mr-1" /> EXCLUSION TRIGGERED
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded bg-success-500/10 text-success-500 text-xs font-bold uppercase tracking-wider flexItemsCenter gap-1 border border-success-500/20">
                                    <ShieldCheck className="w-4 h-4 inline-block -mt-0.5 mr-1" /> STANDARD PROCESSING
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-lg">
                                <p className="text-xs text-dark-400 font-bold uppercase">Claims Approved</p>
                                <p className="text-xl font-bold text-success-500 mt-1">{simResult.approved}</p>
                            </div>
                            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-lg">
                                <p className="text-xs text-dark-400 font-bold uppercase">Claims Rejected</p>
                                <p className="text-xl font-bold text-danger-500 mt-1">{simResult.rejected}</p>
                            </div>
                            <div className="p-3 bg-dark-50 dark:bg-dark-700/50 rounded-lg">
                                <p className="text-xs text-dark-400 font-bold uppercase">Total Loss Saved</p>
                                <p className="text-xl font-bold text-primary-500 mt-1">{formatCurrency(simResult.lossSaved)}</p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg text-sm font-semibold border ${simResult.rejected > simResult.approved ? 'bg-danger-50/50 text-danger-700 border-danger-100 dark:bg-danger-500/10 dark:border-danger-500/30' : 'bg-success-50/50 text-success-700 border-success-100 dark:bg-success-500/10 dark:border-success-500/30'}`}>
                            <strong>Actuarial Logic Explainability: </strong>
                            {simResult.message}
                        </div>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-dark-100 dark:border-dark-700 py-10 rounded-2xl text-center text-dark-400 text-sm">
                        Select an event type above to run the Actuarial Exclusion stress test.
                    </div>
                )}
            </div>
        </div>
    );
}

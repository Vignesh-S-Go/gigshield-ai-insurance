import { AlertCircle, CloudLightning, CloudRain, Cpu, Search, ShieldAlert, ShieldCheck, Skull } from 'lucide-react';
import { useState } from 'react';
import { weatherService } from '../services/weatherService';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import { evaluateClaim } from '../utils/rulesEngine';

export default function TestEngine() {
    const { workers, addClaim } = useStore();
    const [activeTab, setActiveTab] = useState('exclusions');
    const [simResult, setSimResult] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    // Parametric State
    const [cityInput, setCityInput] = useState('Mumbai');
    const [weatherResult, setWeatherResult] = useState(null);
    const [parametricLoading, setParametricLoading] = useState(false);

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

    const runParametricTrigger = async () => {
        setParametricLoading(true);
        setWeatherResult(null);

        // Fetch Real Weather Data
        const weather = await weatherService.getWeatherByCity(cityInput);

        // Auto-Trigger logic
        let simulatedPayouts = 0;
        let claimsFired = 0;

        if (weather.isParametricTriggered) {
            // Find workers in this city and auto-claim
            const affectedWorkers = workers.filter(w => w.city.toLowerCase() === cityInput.toLowerCase());
            claimsFired = affectedWorkers.length;
            simulatedPayouts = claimsFired * 2500;
        }

        setWeatherResult({
            ...weather,
            claimsFired,
            simulatedPayouts
        });

        setParametricLoading(false);
    };

    return (
        <div className="glass-card rounded-2xl border border-primary-500/20 bg-primary-500/5 mt-6 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Cpu className="w-32 h-32" />
            </div>

            <div className="flex border-b border-dark-100 dark:border-dark-700">
                <button
                    onClick={() => setActiveTab('exclusions')}
                    className={`px-6 py-4 font-bold text-sm tracking-wide transition-colors border-b-2 ${activeTab === 'exclusions' ? 'border-primary-500 text-primary-500 bg-primary-500/5' : 'border-transparent text-dark-500 hover:text-dark-300'}`}
                >
                    Actuarial Stress Test
                </button>
                <button
                    onClick={() => setActiveTab('parametric')}
                    className={`px-6 py-4 font-bold text-sm tracking-wide transition-colors border-b-2 ${activeTab === 'parametric' ? 'border-primary-500 text-primary-500 bg-primary-500/5' : 'border-transparent text-dark-500 hover:text-dark-300'}`}
                >
                    Parametric API Trigger
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'exclusions' ? (
                    <>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                    <Cpu className="w-6 h-6 text-primary-500" /> Catastrophe Exclusions
                                </h3>
                                <p className="text-sm text-dark-500 mt-1">Simulate catastrophic events applying live Exclusion Rules.</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => runSimulation('Pandemic')} disabled={isRunning} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs">
                                    {isRunning ? '...' : <AlertCircle className="w-4 h-4 text-warning-500" />} Pandemic
                                </button>
                                <button onClick={() => runSimulation('Terrorism')} disabled={isRunning} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs">
                                    {isRunning ? '...' : <Skull className="w-4 h-4 text-danger-500" />} Terrorism
                                </button>
                                <button onClick={() => runSimulation('Natural Disaster')} disabled={isRunning} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs">
                                    {isRunning ? '...' : <CloudLightning className="w-4 h-4 text-primary-500" />} Severe Weather
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
                                            <span className="px-3 py-1 rounded bg-danger-500/10 text-danger-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-danger-500/20">
                                                <ShieldAlert className="w-4 h-4 inline-block -mt-0.5 mr-1" /> EXCLUSION TRIGGERED
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded bg-success-500/10 text-success-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-success-500/20">
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
                    </>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
                                    <CloudRain className="w-6 h-6 text-primary-500" /> Parametric Weather API
                                </h3>
                                <p className="text-sm text-dark-500 mt-1">IF (rainfall AND threshold) THEN auto-payout via Smart Contract.</p>
                            </div>
                            <div className="flex gap-2 flex-wrap items-center bg-dark-50 dark:bg-dark-800 p-2 rounded-xl border border-dark-100 dark:border-dark-700">
                                <Search className="w-4 h-4 text-dark-400 ml-2" />
                                <input
                                    type="text"
                                    value={cityInput}
                                    onChange={e => setCityInput(e.target.value)}
                                    className="bg-transparent border-none text-sm font-semibold focus:ring-0 text-dark-800 dark:text-white outline-none w-32"
                                    placeholder="Enter City"
                                />
                                <button onClick={runParametricTrigger} disabled={parametricLoading} className="btn-primary py-1.5 px-3 text-xs">
                                    {parametricLoading ? 'Fetching API...' : 'Fetch & Trigger'}
                                </button>
                            </div>
                        </div>

                        {weatherResult ? (
                            <div className={`p-5 rounded-xl border-2 transition-colors ${weatherResult.isParametricTriggered ? 'border-success-500 bg-success-50 dark:bg-success-500/10' : 'border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-dark-800 dark:text-gray-100">Live Weather: {cityInput}</h4>
                                    <span className="text-xs text-primary-500 font-black uppercase tracking-widest bg-primary-100 dark:bg-primary-500/20 px-2 py-1 rounded">OpenWeather API Data</span>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div className="p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                                        <span className="text-xs text-dark-500 uppercase font-bold block mb-1">Temperature</span>
                                        <span className="text-lg font-black text-dark-800 dark:text-white">{weatherResult.temp}°C</span>
                                    </div>
                                    <div className="p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                                        <span className="text-xs text-dark-500 uppercase font-bold block mb-1">Conditions</span>
                                        <span className="text-lg font-black text-dark-800 dark:text-white capitalize">{weatherResult.description}</span>
                                    </div>
                                    <div className="p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                                        <span className="text-xs text-dark-500 uppercase font-bold block mb-1">Threshold Met?</span>
                                        <span className={`text-lg font-black ${weatherResult.isParametricTriggered ? 'text-success-500' : 'text-dark-500'}`}>{weatherResult.isParametricTriggered ? 'YES' : 'NO'}</span>
                                    </div>
                                    <div className="p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                                        <span className="text-xs text-dark-500 uppercase font-bold block mb-1">Auto-Claims Fired</span>
                                        <span className={`text-lg font-black ${weatherResult.isParametricTriggered ? 'text-primary-500' : 'text-dark-500'}`}>{weatherResult.claimsFired}</span>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg border font-semibold text-sm ${weatherResult.isParametricTriggered ? 'bg-success-100/50 border-success-200 text-success-700 dark:bg-success-500/20 dark:border-success-500/30 dark:text-success-300' : 'bg-dark-50 border-dark-200 text-dark-500 dark:bg-dark-800 dark:border-dark-700'}`}>
                                    {weatherResult.isParametricTriggered
                                        ? `Threshold breached. Instant parametric triggers initiated resolving ${formatCurrency(weatherResult.simulatedPayouts)} automatically across smart contracts.`
                                        : `Conditions standard. No parametric triggers breached.`}
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-dark-100 dark:border-dark-700 py-10 rounded-2xl text-center text-dark-400 text-sm">
                                Enter a city to hit the Weather API. If rain/storm is detected, smart contracts will auto-disburse payouts to workers in that zone instantly without filing manual claims.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

import { MessageSquare, Sparkles, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

const contextualInsights = [
    { risk: 'HIGH', message: 'Heavy rainfall expected in 45 mins. Continue working to stay covered or pause to avoid risk.' },
    { risk: 'MEDIUM', message: 'AQI is rising. Consider wearing a mask and reducing outdoor exposure.' },
    { risk: 'LOW', message: 'Conditions are favorable. Good day for deliveries!' },
];

export default function RiskAssistant({ riskLevel = 'LOW', onSendMessage }) {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const getInsight = () => {
        const insight = contextualInsights.find(i => i.risk === riskLevel.toUpperCase());
        return insight?.message || contextualInsights[2].message;
    };

    const handleSend = () => {
        if (!input.trim()) return;
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setInput('');
            if (onSendMessage) onSendMessage(input);
        }, 1500);
    };

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-bold text-white">AI Risk Assistant</h3>
            </div>

            <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl mb-4">
                <p className="text-xs text-dark-300">
                    <span className="text-primary-400 font-medium">Insight: </span>
                    {getInsight()}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your coverage..."
                    className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white placeholder:text-dark-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className="p-2 bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                    {isTyping ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                        <Send className="w-4 h-4 text-white" />
                    )}
                </button>
            </div>
        </div>
    );
}
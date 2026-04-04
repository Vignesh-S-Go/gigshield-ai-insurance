import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

export default function AIChatPanel({ context, initialQuestion }) {
    const [messages, setMessages] = useState([
        { role: 'ai', text: `Hi! I'm the ZeroClaim AI. I analyzed this claim. Ask me anything.` }
    ]);
    const [input, setInput] = useState(initialQuestion || '');
    const [isTyping, setIsTyping] = useState(false);

    // Mock Gemini style stream effect
    const handleSend = () => {
        if (!input.trim()) return;

        setMessages([...messages, { role: 'user', text: input }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            let response = "I'm analyzing the policy...";
            if (input.toLowerCase().includes('why')) {
                response = `The claim was ${context.isApproved ? 'approved' : 'rejected'} based on a risk analysis. The trigger was "${context.trigger}". However, the risk score was ${context.score}. 
${context.isApproved ? 'All clauses were satisfied.' : 'An exclusion clause (Section 4.2) kicked in.'}`;
            } else if (input.toLowerCase().includes('exclusion')) {
                response = "The system found a specific exclusionary parameter triggered by extreme categorical risk. Please check the Exclusion Engine log for more details.";
            } else {
                response = "As an AI underwriter, my decision is final but transparent. I used the worker's digital twin data combined with real-time API triggers to reach this conclusion.";
            }

            setMessages(prev => [...prev, { role: 'ai', text: response }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[350px] w-full border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 rounded-xl overflow-hidden shadow-lg relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-3 flex items-center gap-2 relative overflow-hidden">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                <h3 className="text-white font-bold text-sm tracking-wide">Gemini Claim Explainer</h3>
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-white opacity-10 rounded-full blur-xl animate-pulse"></div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((m, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-gradient-to-br from-primary-500 to-purple-600 text-white'}`}>
                            {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-dark-50 dark:bg-dark-800 text-dark-800 dark:text-gray-200 border border-dark-100 dark:border-dark-700 rounded-tl-none'}`}>
                            {m.text}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="p-3 bg-dark-50 dark:bg-dark-800 text-dark-400 rounded-2xl rounded-tl-none text-xs flex gap-1">
                            <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask why it was rejected..."
                    className="flex-1 input-field bg-dark-50 py-2 border-transparent focus:bg-white"
                />
                <button onClick={handleSend} disabled={isTyping} className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

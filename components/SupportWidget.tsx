"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessageToSupport, getActiveSupportChat } from "@/app/support/actions";
import { MessageCircle, X, Send, Bot, User, ShieldAlert } from "lucide-react";

export default function SupportWidget({ role = "CUSTOMER" }: { role?: "CUSTOMER" | "DRIVER" | "MERCHANT" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const [botStatus, setBotStatus] = useState<string>("BOT_ACTIVE");
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadChat();
        }
    }, [isOpen]);

    // Scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    const loadChat = async () => {
        setIsTyping(true);
        const res = await getActiveSupportChat();
        if (res.success && res.chat) {
            setChatId(res.chat.id);
            setBotStatus(res.chat.status);
            setMessages(res.messages || []);
        } else {
            // No active chat, let's just greet them
            setMessages([{
                id: 'welcome',
                sender: 'BOT',
                content: `Hi there! I'm the TrueServe Support AI. How can I help you today?`
            }]);
        }
        setIsTyping(false);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput("");
        
        // Optimistic UI update
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, sender: 'USER', content: userMsg }]);
        setIsTyping(true);

        const res = await sendMessageToSupport(chatId, userMsg, role);
        
        if (res.success) {
            if (!chatId && res.chatId) setChatId(res.chatId);
            setBotStatus(res.status || 'BOT_ACTIVE');

            if (res.reply) {
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'BOT', content: res.reply }]);
            } else if (res.status === 'HUMAN_REQUIRED') {
                // If it transitioned but no explicit reply returned, show generic escalation
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'BOT', content: "An agent will be with you shortly." }]);
            }
        } else {
            setMessages(prev => [...prev, { id: 'error', sender: 'BOT', content: "Failed to send message. Please try again." }]);
        }
        setIsTyping(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 sm:w-96 h-[500px] max-h-[80vh] bg-slate-900 border border-emerald-500/20 rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-fade-in-up">
                    
                    {/* Header */}
                    <div className="p-4 bg-black border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">TrueServe Support</h3>
                                <p className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase flex items-center gap-1">
                                    {botStatus === 'BOT_ACTIVE' ? "● Claude AI Active" : <><span className="text-orange-400">● </span> <span className="text-orange-400">Waiting for Agent</span></>}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => {
                            const isBot = msg.sender === 'BOT';
                            const isHumanAgent = msg.sender === 'HUMAN_AGENT';
                            const isUser = msg.sender === 'USER';

                            return (
                                <div key={msg.id || idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                                        isUser ? "bg-emerald-500 text-black rounded-tr-sm" : 
                                        isHumanAgent ? "bg-orange-500/20 text-orange-50 border border-orange-500/30 rounded-tl-sm" :
                                        "bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm"
                                    }`}>
                                        {!isUser && (
                                            <div className="flex items-center gap-1.5 mb-1 opacity-70">
                                                {isHumanAgent ? <ShieldAlert size={10} /> : <Bot size={10} />}
                                                <span className="text-[9px] uppercase font-bold tracking-wider">
                                                    {isHumanAgent ? "Human Agent" : "AI Copilot"}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-black border-t border-white/5 relative">
                        {botStatus === 'RESOLVED' ? (
                            <div className="text-center py-2 text-slate-500 text-xs">This chat has been resolved.</div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={botStatus === 'BOT_ACTIVE' ? "Explain your issue..." : "Type to the human agent..."}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
                                    disabled={isTyping}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black disabled:opacity-50 hover:bg-emerald-400 transition-colors shrink-0"
                                >
                                    <Send size={16} className="-ml-0.5" />
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all group"
                >
                    <MessageCircle size={24} className="group-hover:animate-pulse" />
                </button>
            )}
        </div>
    );
}

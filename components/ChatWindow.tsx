
"use client";

import { useState, useEffect } from "react";
import { translateText } from "@/app/actions/translate";

interface Message {
    id: string;
    content: string;
    originalContent?: string;
    sender: "USER" | "DRIVER";
    timestamp: Date;
    isTranslated?: boolean;
}

export default function ChatWindow({ orderId }: { orderId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", content: "Hola, estoy en camino con tu comida.", sender: "DRIVER", timestamp: new Date() }
    ]);
    const [input, setInput] = useState("");
    const [translating, setTranslating] = useState<string | null>(null);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, {
            id: Date.now().toString(),
            content: input,
            sender: "USER",
            timestamp: new Date()
        }]);
        setInput("");
    };

    const handleTranslate = async (id: string, text: string) => {
        setTranslating(id);
        try {
            // Call Server Action
            const result = await translateText(text, 'en'); // Target English by default

            if (result.translatedText) {
                setMessages(prev => prev.map(m =>
                    m.id === id
                        ? { ...m, content: result.translatedText, originalContent: text, isTranslated: true }
                        : m
                ));
            } else {
                console.error("Translation returned error:", result.error);
                // Fallback or alert user silently
                // In a real app, maybe show a toast. Here we just log.
            }
        } catch (e) {
            console.error("Translation Failed", e);
        } finally {
            setTranslating(null);
        }
    };

    return (
        <div className="card bg-white/5 border-white/10 p-0 flex flex-col h-96 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="font-bold text-sm">Chat with Driver</h3>
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded border border-primary/20">AI Translation Enabled</span>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4 flex flex-col">
                {messages.map(m => (
                    <div key={m.id} className={`max-w-[85%] flex flex-col ${m.sender === "USER" ? "self-end items-end" : "self-start items-start"}`}>
                        <div className={`p-3 rounded-2xl text-sm relative group ${m.sender === "USER"
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-white/10 text-slate-200 rounded-tl-none"
                            }`}>
                            {m.content}
                            {m.isTranslated && (
                                <p className="text-[10px] opacity-60 italic mt-1 border-t border-white/10 pt-1">
                                    Translated from: "{m.originalContent}"
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 px-1">
                            <p className="text-[8px] opacity-50">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            {m.sender === "DRIVER" && !m.isTranslated && (
                                <button
                                    onClick={() => handleTranslate(m.id, m.content)}
                                    disabled={translating === m.id}
                                    className="text-[9px] text-primary hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                    {translating === m.id ? "Translating..." : "Translate"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-white/10 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary placeholder:text-slate-600"
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="btn btn-primary text-xs py-2">Send</button>
            </div>
        </div>
    );
}

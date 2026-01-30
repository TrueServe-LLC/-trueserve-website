
"use client";

import { useState, useEffect } from "react";

interface Message {
    id: string;
    content: string;
    sender: "USER" | "DRIVER";
    timestamp: Date;
}

export default function ChatWindow({ orderId }: { orderId: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", content: "I've picked up your order! I'll be there in 10 mins.", sender: "DRIVER", timestamp: new Date() }
    ]);
    const [input, setInput] = useState("");

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

    return (
        <div className="card bg-white/5 border-white/10 p-0 flex flex-col h-96 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-sm">Chat with Driver</h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4 flex flex-col">
                {messages.map(m => (
                    <div key={m.id} className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === "USER"
                            ? "bg-primary text-white self-end rounded-tr-none"
                            : "bg-white/10 text-slate-200 self-start rounded-tl-none"
                        }`}>
                        {m.content}
                        <p className="text-[8px] opacity-50 mt-1">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-white/10 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="btn btn-primary text-xs py-2">Send</button>
            </div>
        </div>
    );
}

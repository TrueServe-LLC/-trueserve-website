"use client";

import { useState } from "react";
import { getChatTranscript, replyToUser, resolveChat } from "@/app/admin/live-chats/actions";
import { formatDistanceToNow } from "date-fns";

export default function LiveChatDashboard({ initialChats }: { initialChats: any[] }) {
    const [activeChat, setActiveChat] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);

    const onSelectChat = async (chat: any) => {
        setActiveChat(chat);
        setMessages([]);
        const transcripts = await getChatTranscript(chat.id);
        setMessages(transcripts);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !activeChat) return;

        const sent = reply;
        setReply("");
        
        // Optimistic UI updates
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, sender: 'HUMAN_AGENT', content: sent }]);
        
        setLoading(true);
        await replyToUser(activeChat.id, sent);
        // Refresh transcript just to be sure
        const nextMsgs = await getChatTranscript(activeChat.id);
        setMessages(nextMsgs);
        setLoading(false);
    };

    const handleResolve = async () => {
        if (!activeChat) return;
        if (confirm("Mark this chat as resolved? Claude assumes normal duties once closed.")) {
            await resolveChat(activeChat.id);
            setActiveChat(null);
            // In reality, we'd refetch initialChats from server or rely on Next.js revalidatePath
            window.location.reload();
        }
    };

    return (
        <div className="flex gap-6 h-[700px] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden mt-6 shadow-2xl">
            
            {/* Sidebar Inbox */}
            <div className="w-[350px] bg-black border-r border-white/5 flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-10">
                    <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400">Active Live Chats</h3>
                </div>
                
                {initialChats.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No active chats in the system.</div>
                ) : (
                    initialChats.map(chat => {
                        const isUrgent = chat.status === 'HUMAN_REQUIRED';
                        return (
                            <button 
                                key={chat.id} 
                                onClick={() => onSelectChat(chat)}
                                className={`text-left w-full p-4 border-b border-white/5 hover:bg-white/5 transition-colors focus:outline-none ${activeChat?.id === chat.id ? 'bg-white/10' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <p className="font-bold text-sm text-white">{chat.User?.name || "Anonymous User"}</p>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {isUrgent ? "Escalated" : "AI"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-mono text-[10px] uppercase">{chat.userRole}</span>
                                    <span className="text-slate-500">{formatDistanceToNow(new Date(chat.updatedAt))} ago</span>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Chat View */}
            <div className="flex-1 flex flex-col h-full bg-slate-900">
                {!activeChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <span className="text-4xl text-slate-700">💬</span>
                        <p className="font-mono text-[10px] uppercase tracking-widest">Select a chat to join live</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-black border-b border-white/5 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-white text-lg">{activeChat.User?.name || "User"}</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                    {activeChat.userRole} • Chat ID: {activeChat.id.split('-')[0]} 
                                    {activeChat.jiraTicketId && ` • Jira: ${activeChat.jiraTicketId}`}
                                </p>
                            </div>
                            <button 
                                onClick={handleResolve}
                                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-emerald-500/10"
                            >
                                Mark Resolved
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map(msg => {
                                const isUser = msg.sender === 'USER';
                                const isHumanAgent = msg.sender === 'HUMAN_AGENT';
                                const isBot = msg.sender === 'BOT';

                                return (
                                    <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                                            isUser ? 'bg-white/5 border border-white/10 rounded-tl-sm text-slate-200' : 
                                            isHumanAgent ? 'bg-primary text-black rounded-tr-sm shadow-xl' :
                                            'bg-slate-800 border border-emerald-500/30 text-emerald-50 rounded-tr-sm'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                                <span className="text-[9px] font-black uppercase tracking-widest">
                                                    {isUser ? activeChat.User?.name : isHumanAgent ? "Admin (You)" : "Claude AI"}
                                                </span>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <form onSubmit={handleSend} className="p-4 bg-black border-t border-white/5 flex gap-3">
                            <input
                                type="text"
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                placeholder="Take over chat: Respond as human agent..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-slate-600 transition-colors"
                            />
                            <button 
                                type="submit" 
                                disabled={!reply.trim() || loading}
                                className="px-6 py-3 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary/80 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
                            >
                                Send Reply
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

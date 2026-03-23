"use client";

import React, { useState, useTransition } from "react";
import { inviteTeamMember, sendPasswordReset, revokeAccess } from "@/app/admin/team/actions";

export default function TeamManagerUI({ initialMembers }: { initialMembers: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleAction = async (actionFn: () => Promise<any>) => {
        setMessage(null);
        startTransition(async () => {
            try {
                const res = await actionFn();
                if (res?.error) {
                    setMessage({ text: res.error, type: 'error' });
                } else if (res?.success) {
                    setMessage({ text: res.success, type: 'success' });
                }
            } catch (e: any) {
                setMessage({ text: e.message || "An error occurred", type: 'error' });
            }
        });
    };

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await handleAction(() => inviteTeamMember(formData));
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Identity & Access</h1>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">Manage admin roles, API permissions, and internal team members.</p>
                </div>
                <div className="bg-slate-800/50 p-4 border border-white/5 rounded-2xl w-full lg:max-w-md relative">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Invite New Team Member</h3>
                    <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2 relative z-10">
                        <input required name="email" type="email" placeholder="Employee Email..." className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50" disabled={isPending} />
                        <div className="flex gap-2">
                            <select required name="role" className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer flex-1 sm:w-[110px] disabled:opacity-50" disabled={isPending}>
                                <option value="OPS">Ops</option>
                                <option value="SUPPORT">Support</option>
                                <option value="FINANCE">Finance</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <button type="submit" disabled={isPending} className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:grayscale disabled:opacity-50 min-w-[80px]">
                                {isPending ? "..." : "Invite"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold border animate-in fade-in slide-in-from-top-2 ${
                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        Active Staff ({initialMembers.length})
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/50 text-slate-300">
                            <tr>
                                <th className="px-6 py-4 font-semibold rounded-tl-lg">Member</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {initialMembers.map((member: any) => (
                                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white">{member.name || 'Unknown'}</div>
                                        <div className="text-slate-400 text-xs">{member.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                                            member.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                            member.role === 'SUPPORT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => handleAction(() => sendPasswordReset(member.id, member.email))}
                                                disabled={isPending}
                                                className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded text-xs transition-colors border border-slate-700 disabled:opacity-50"
                                            >
                                                Reset Password
                                            </button>
                                            
                                            {member.role !== 'ADMIN' && (
                                                <button 
                                                    onClick={() => handleAction(() => revokeAccess(member.id, member.email))}
                                                    disabled={isPending}
                                                    className="text-red-400 hover:text-white px-3 py-1 bg-red-950/30 rounded text-xs transition-colors border border-red-900/50 disabled:opacity-50"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {initialMembers.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        No explicit team members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

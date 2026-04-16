"use client";

import React, { useState, useTransition } from "react";
import { inviteTeamMember, sendPasswordReset, revokeAccess } from "@/app/admin/team/actions";

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    ADMIN:   { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
    PM:      { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
    OPS:     { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    SUPPORT: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
    FINANCE: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    QA_TESTER: { bg: 'rgba(156,163,175,0.12)', color: '#9ca3af' },
};

export default function TeamManagerUI({ initialMembers }: { initialMembers: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleAction = async (actionFn: () => Promise<any>) => {
        setMessage(null);
        startTransition(async () => {
            try {
                const res = await actionFn();
                if (res?.error) setMessage({ text: res.error, type: 'error' });
                else if (res?.success) setMessage({ text: res.success, type: 'success' });
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
        <>
            <style>{`
                .iam-invite { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
                .iam-invite-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 12px; }
                .iam-invite-row { display: flex; gap: 10px; flex-wrap: wrap; }
                .iam-input { background: #0f1210; border: 1px solid #2e3830; color: #fff; font-size: 13px; padding: 8px 12px; border-radius: 6px; outline: none; flex: 1; min-width: 200px; }
                .iam-input:focus { border-color: #f97316; }
                .iam-select { background: #0f1210; border: 1px solid #2e3830; color: #fff; font-size: 13px; padding: 8px 12px; border-radius: 6px; outline: none; cursor: pointer; }
                .iam-select:focus { border-color: #f97316; }
                .iam-btn { background: #f97316; color: #000; font-size: 12px; font-weight: 700; padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap; }
                .iam-btn:hover { background: #fb923c; }
                .iam-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .iam-msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; margin-bottom: 16px; }
                .iam-msg.success { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
                .iam-msg.error { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
                .iam-table-wrap { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; overflow-x: auto; }
                .iam-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .iam-table th { padding: 10px 16px; text-align: left; color: #555; font-weight: 500; border-bottom: 1px solid #1e2420; }
                .iam-table td { padding: 12px 16px; color: #aaa; border-bottom: 1px solid #1e2420; }
                .iam-table tr:last-child td { border-bottom: none; }
                .iam-table tr:hover td { background: rgba(255,255,255,0.01); }
                .iam-name { color: #fff; font-weight: 500; }
                .iam-email { font-size: 12px; color: #555; margin-top: 2px; }
                .iam-role { font-size: 11px; padding: 3px 10px; border-radius: 4px; font-weight: 600; }
                .iam-actions { display: flex; gap: 8px; justify-content: flex-end; }
                .iam-action-btn { font-size: 12px; padding: 5px 12px; border-radius: 4px; border: 1px solid #2e3830; background: #1e2420; color: #aaa; cursor: pointer; white-space: nowrap; }
                .iam-action-btn:hover { border-color: #f97316; color: #f97316; }
                .iam-action-btn.danger { border-color: rgba(248,113,113,0.3); color: #f87171; background: rgba(248,113,113,0.08); }
                .iam-action-btn.danger:hover { background: rgba(248,113,113,0.15); }
                .iam-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .iam-empty { color: #555; padding: 32px 16px; text-align: center; }
                .iam-count { font-size: 12px; color: #555; padding: 10px 16px; border-top: 1px solid #1e2420; }
            `}</style>

            {/* Invite Form */}
            <div className="iam-invite">
                <div className="iam-invite-title">Invite Team Member</div>
                <form onSubmit={handleInvite}>
                    <div className="iam-invite-row">
                        <input
                            required
                            name="email"
                            type="email"
                            placeholder="employee@trueserve.delivery"
                            className="iam-input"
                            disabled={isPending}
                        />
                        <select required name="role" className="iam-select" disabled={isPending}>
                            <option value="OPS">Ops</option>
                            <option value="SUPPORT">Support</option>
                            <option value="FINANCE">Finance</option>
                            <option value="PM">PM</option>
                            <option value="QA_TESTER">QA Tester</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <button type="submit" className="iam-btn" disabled={isPending}>
                            {isPending ? "Sending..." : "Send Invite"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Message */}
            {message && (
                <div className={`iam-msg ${message.type}`}>{message.text}</div>
            )}

            {/* Team Table */}
            <div className="iam-table-wrap">
                <table className="iam-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Role</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialMembers.map((member: any) => {
                            const roleStyle = ROLE_COLORS[member.role] || { bg: 'rgba(85,85,85,0.2)', color: '#888' };
                            return (
                                <tr key={member.id}>
                                    <td>
                                        <div className="iam-name">{member.name || 'Unknown'}</div>
                                        <div className="iam-email">{member.email}</div>
                                    </td>
                                    <td>
                                        <span className="iam-role" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="iam-actions">
                                            <button
                                                className="iam-action-btn"
                                                disabled={isPending}
                                                onClick={() => handleAction(() => sendPasswordReset(member.id, member.email))}
                                            >
                                                Reset Password
                                            </button>
                                            {member.role !== 'ADMIN' && (
                                                <button
                                                    className="iam-action-btn danger"
                                                    disabled={isPending}
                                                    onClick={() => handleAction(() => revokeAccess(member.id, member.email))}
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {initialMembers.length === 0 && (
                            <tr>
                                <td colSpan={3} className="iam-empty">No team members yet. Use the invite form above.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {initialMembers.length > 0 && (
                    <div className="iam-count">{initialMembers.length} member{initialMembers.length !== 1 ? 's' : ''}</div>
                )}
            </div>
        </>
    );
}

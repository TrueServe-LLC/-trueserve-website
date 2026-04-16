"use client";

import React, { useState, useTransition } from "react";
import { inviteTeamMember, sendPasswordReset, revokeAccess } from "@/app/admin/team/actions";

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    ADMIN:     { bg: '#2a1a00', color: '#f5a623' },
    PM:        { bg: '#2a1a00', color: '#f5a623' },
    OPS:       { bg: '#2a1a00', color: '#f5a623' },
    SUPPORT:   { bg: '#2a1a00', color: '#f5a623' },
    FINANCE:   { bg: '#2a1a00', color: '#f5a623' },
    QA_TESTER: { bg: '#2a1a00', color: '#f5a623' },
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
                .iam-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 24px;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                }
                .iam-title-block {}
                .iam-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0 0 4px 0;
                    letter-spacing: -0.5px;
                }
                .iam-subtitle {
                    font-size: 13px;
                    color: #666;
                    margin: 0;
                }
                .iam-invite-block {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                    flex-shrink: 0;
                }
                .iam-invite-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: #555;
                    text-transform: uppercase;
                }
                .iam-invite-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .iam-input {
                    background: #0f1210;
                    border: 1px solid #2e3830;
                    color: #fff;
                    font-size: 13px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    outline: none;
                    width: 220px;
                }
                .iam-input::placeholder { color: #444; }
                .iam-input:focus { border-color: #f97316; }
                .iam-select {
                    background: #0f1210;
                    border: 1px solid #2e3830;
                    color: #fff;
                    font-size: 13px;
                    padding: 8px 10px;
                    border-radius: 6px;
                    outline: none;
                    cursor: pointer;
                }
                .iam-select:focus { border-color: #f97316; }
                .iam-invite-btn {
                    background: #f97316;
                    color: #000;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 8px 18px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    white-space: nowrap;
                    letter-spacing: 0.04em;
                }
                .iam-invite-btn:hover { background: #fb923c; }
                .iam-invite-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .iam-msg {
                    padding: 10px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 16px;
                }
                .iam-msg.success { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
                .iam-msg.error   { background: rgba(248,113,113,0.1); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }

                .iam-staff-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                }
                .iam-staff-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #3b82f6;
                    flex-shrink: 0;
                }
                .iam-staff-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #ccc;
                }

                .iam-table-wrap {
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    overflow-x: auto;
                }
                .iam-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .iam-table th {
                    padding: 10px 16px;
                    text-align: left;
                    color: #555;
                    font-weight: 500;
                    border-bottom: 1px solid #1e2420;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .iam-table th.right { text-align: right; }
                .iam-table td {
                    padding: 12px 16px;
                    color: #aaa;
                    border-bottom: 1px solid #1e2420;
                }
                .iam-table tr:last-child td { border-bottom: none; }
                .iam-table tr:hover td { background: rgba(255,255,255,0.01); }

                .iam-name  { color: #fff; font-weight: 500; font-size: 13px; }
                .iam-email { font-size: 12px; color: #555; margin-top: 2px; }

                .iam-role {
                    font-size: 11px;
                    padding: 3px 10px;
                    border-radius: 4px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                }

                .iam-action-btn {
                    font-size: 12px;
                    padding: 5px 14px;
                    border-radius: 5px;
                    border: 1px solid #2e3830;
                    background: #1e2420;
                    color: #aaa;
                    cursor: pointer;
                    white-space: nowrap;
                    float: right;
                }
                .iam-action-btn:hover { border-color: #f97316; color: #f97316; }
                .iam-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                .iam-empty {
                    color: #555;
                    padding: 32px 16px;
                    text-align: center;
                    font-size: 13px;
                }
                .iam-footer {
                    font-size: 12px;
                    color: #555;
                    padding: 10px 16px;
                    border-top: 1px solid #1e2420;
                }

                @media (max-width: 768px) {
                    .iam-header { flex-direction: column; align-items: flex-start; }
                    .iam-invite-block { align-items: flex-start; }
                    .iam-input { width: 100%; }
                }
            `}</style>

            {/* Header + Invite Form */}
            <div className="iam-header">
                <div className="iam-title-block">
                    <h2 className="iam-title">Identity &amp; Access</h2>
                    <p className="iam-subtitle">Manage internal team members and their portal permissions</p>
                </div>

                <div className="iam-invite-block">
                    <div className="iam-invite-label">Invite New Team Member</div>
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
                            <button type="submit" className="iam-invite-btn" disabled={isPending}>
                                {isPending ? "Sending…" : "Invite"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`iam-msg ${message.type}`}>{message.text}</div>
            )}

            {/* Active Staff count */}
            <div className="iam-staff-header">
                <span className="iam-staff-dot" />
                <span className="iam-staff-label">
                    Active Staff ({initialMembers.length})
                </span>
            </div>

            {/* Team Table */}
            <div className="iam-table-wrap">
                <table className="iam-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Role</th>
                            <th className="right">Actions</th>
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
                                        <span
                                            className="iam-role"
                                            style={{ background: roleStyle.bg, color: roleStyle.color }}
                                        >
                                            {member.role}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="iam-action-btn"
                                            disabled={isPending}
                                            onClick={() => handleAction(() => sendPasswordReset(member.id, member.email))}
                                        >
                                            Reset Password
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {initialMembers.length === 0 && (
                            <tr>
                                <td colSpan={3} className="iam-empty">
                                    No team members yet. Use the invite form above to add staff.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {initialMembers.length > 0 && (
                    <div className="iam-footer">
                        {initialMembers.length} member{initialMembers.length !== 1 ? 's' : ''} · TrueServe internal staff only
                    </div>
                )}
            </div>
        </>
    );
}

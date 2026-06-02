'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock3, Edit3, FileText, Save, X } from 'lucide-react';

interface Policy {
    id: string;
    key: string;
    title: string;
    content: string;
    version: number;
    updatedAt: string;
}

interface PolicyCMSProps {
    policies: Policy[];
    onSave: (key: string, title: string, content: string) => Promise<any>;
}

export default function PolicyCMS({ policies, onSave }: PolicyCMSProps) {
    const router = useRouter();
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [isSaving, setIsSaving] = useState(false);

    const startEdit = (p: Policy) => {
        setEditingKey(p.key);
        setFormData({ title: p.title, content: p.content });
    };

    const handleSave = async () => {
        if (!editingKey) return;
        setIsSaving(true);
        const res = await onSave(editingKey, formData.title, formData.content);
        if (res.success) {
            setEditingKey(null);
            router.refresh();
        }
        setIsSaving(false);
    };

    return (
        <section className="policy-shell">
            <style>{`
                .policy-shell { display: grid; gap: 18px; }
                .policy-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 18px;
                    background:
                        radial-gradient(circle at 12% 0%, rgba(249,115,22,0.11), transparent 34%),
                        rgba(20,26,24,0.88);
                }
                .policy-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #f97316;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .policy-title { color: #fff; font-size: 20px; font-weight: 800; margin: 0; }
                .policy-copy { color: rgba(255,255,255,0.58); font-size: 13px; line-height: 1.6; max-width: 720px; margin: 6px 0 0; }
                .policy-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid rgba(52,211,153,0.24);
                    background: rgba(52,211,153,0.08);
                    color: #86efac;
                    border-radius: 999px;
                    padding: 8px 11px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .policy-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
                .policy-card {
                    display: flex;
                    flex-direction: column;
                    min-height: 300px;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 18px;
                    background: rgba(20,26,24,0.9);
                    overflow: hidden;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.18);
                }
                .policy-card-head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 14px;
                    padding: 18px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .policy-doc-title { color: #fff; font-size: 15px; font-weight: 800; margin: 0; }
                .policy-meta {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255,255,255,0.4);
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-top: 7px;
                }
                .policy-date {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: rgba(255,255,255,0.42);
                    font-size: 11px;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .policy-body { flex: 1; display: flex; flex-direction: column; gap: 14px; padding: 18px; }
                .policy-preview {
                    flex: 1;
                    min-height: 150px;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 14px;
                    background: rgba(255,255,255,0.035);
                    padding: 14px;
                    overflow: hidden;
                }
                .policy-preview p { color: rgba(255,255,255,0.62); font-size: 13px; line-height: 1.7; margin: 0; display: -webkit-box; -webkit-line-clamp: 7; -webkit-box-orient: vertical; overflow: hidden; }
                .policy-input,
                .policy-textarea {
                    width: 100%;
                    border: 1px solid rgba(255,255,255,0.09);
                    border-radius: 12px;
                    background: rgba(255,255,255,0.045);
                    color: #fff;
                    outline: none;
                    padding: 12px 13px;
                    font: inherit;
                    transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
                }
                .policy-input:focus,
                .policy-textarea:focus {
                    border-color: rgba(249,115,22,0.7);
                    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
                    background: rgba(255,255,255,0.06);
                }
                .policy-textarea { min-height: 210px; resize: vertical; line-height: 1.6; }
                .policy-actions { display: flex; gap: 9px; flex-wrap: wrap; }
                .policy-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-height: 40px;
                    border-radius: 11px;
                    padding: 0 14px;
                    border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.04);
                    color: #fff;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 0.11em;
                    text-transform: uppercase;
                    transition: transform 140ms ease, border-color 140ms ease, background-color 140ms ease;
                }
                .policy-btn:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.16); }
                .policy-btn.primary { flex: 1; border-color: rgba(249,115,22,0.35); background: #f97316; color: #090b09; }
                .policy-btn.ghost { color: rgba(255,255,255,0.68); }
                .policy-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
                @media (max-width: 720px) {
                    .policy-top { flex-direction: column; }
                    .policy-status { width: 100%; justify-content: center; }
                    .policy-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="policy-top">
                <div>
                    <div className="policy-eyebrow"><BookOpen size={15} /> Admin content</div>
                    <h2 className="policy-title">Content Library</h2>
                    <p className="policy-copy">
                        Manage the public policies, help copy, FAQs, and legal content that customers, merchants,
                        and drivers see across TrueServe.
                    </p>
                </div>
                <span className="policy-status"><FileText size={14} /> Versioning Active</span>
            </div>

            <div className="policy-grid">
                {(policies.length > 0 ? policies : [
                    { id: '1', key: 'terms', title: 'Terms of Service', content: '...', version: 1, updatedAt: new Date().toISOString() },
                    { id: '2', key: 'privacy', title: 'Privacy Policy', content: '...', version: 1, updatedAt: new Date().toISOString() },
                    { id: '3', key: 'faq', title: 'Platform FAQ', content: '...', version: 1, updatedAt: new Date().toISOString() }
                ]).map((policy) => (
                    <div key={policy.key} className="policy-card">
                        <div className="policy-card-head">
                            <div>
                                <h3 className="policy-doc-title">{policy.title}</h3>
                                <p className="policy-meta">
                                    <span>Key: {policy.key}</span>
                                    <span>v{policy.version}</span>
                                </p>
                            </div>
                            <span className="policy-date">
                                <Clock3 size={13} /> {new Date(policy.updatedAt).toLocaleDateString()}
                            </span>
                        </div>

                        {editingKey === policy.key ? (
                            <div className="policy-body">
                                <input 
                                    className="policy-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    aria-label="Policy Title"
                                />
                                <textarea 
                                    className="policy-textarea"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    aria-label="Policy Content"
                                />
                                <div className="policy-actions">
                                    <button 
                                        disabled={isSaving}
                                        onClick={handleSave}
                                        className="policy-btn primary"
                                    >
                                        <Save size={14} />
                                        {isSaving ? 'PUBLISHING...' : 'Publish (v' + (policy.version + 1) + ')'}
                                    </button>
                                    <button 
                                        disabled={isSaving}
                                        onClick={() => setEditingKey(null)}
                                        className="policy-btn ghost"
                                    >
                                        <X size={14} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="policy-body">
                                <div className="policy-preview">
                                    <p>
                                        {policy.content}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => startEdit(policy)}
                                    className="policy-btn ghost"
                                >
                                    <Edit3 size={14} />
                                    Edit Document
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

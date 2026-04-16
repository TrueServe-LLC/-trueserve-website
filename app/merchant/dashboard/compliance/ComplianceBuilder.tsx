"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { buildComplianceTemplateDraft, getCompliancePresets } from "@/lib/complianceTemplates";
import type { PublicInspectionFeed } from "@/lib/publicInspectionFeed";
import type { ComplianceTemplateActionState } from "./actions";
import { saveComplianceTemplateAction } from "./actions";

type RestaurantSummary = {
    id: string;
    name: string;
    complianceScore?: number | null;
    healthGrade?: string | null;
    complianceStatus?: string | null;
    complianceTier?: string | null;
    lastInspectionAt?: string | null;
    lastInspectionSource?: string | null;
};

type TemplateRecord = {
    title?: string | null;
    description?: string | null;
    templateType?: string | null;
    aiNotes?: string | null;
    status?: string | null;
    sections?: Array<{ title: string; items: string[] }> | null;
    suggestions?: string[] | null;
};

type BuilderProps = {
    restaurant: RestaurantSummary;
    template: TemplateRecord | null;
    isPreview: boolean;
    complianceSnapshot?: {
        integrations: Array<{
            id: string;
            provider: string;
            status?: string | null;
            syncMode?: string | null;
            externalLocationId?: string | null;
            externalAccountId?: string | null;
            config?: Record<string, unknown> | null;
            lastSyncAt?: string | null;
            createdAt?: string | null;
        }>;
        inspections: Array<{
            id: string;
            provider: string;
            inspectionDate?: string | null;
            score?: number | null;
            grade?: string | null;
            status?: string | null;
            sourceUrl?: string | null;
            inspectorName?: string | null;
        }>;
        scoreHistory: Array<{
            id: string;
            score?: number | null;
            reason?: string | null;
            createdAt?: string | null;
        }>;
    };
    publicInspectionFeed?: PublicInspectionFeed;
};

const initialState: ComplianceTemplateActionState = {
    status: "idle",
    message: "",
};

export default function ComplianceBuilder({ restaurant, template, isPreview, complianceSnapshot, publicInspectionFeed }: BuilderProps) {
    const presets = getCompliancePresets();
    const defaultDraft = buildComplianceTemplateDraft(
        template?.description || template?.title || presets[0].description
    );

    const [title, setTitle] = useState(template?.title || defaultDraft.title);
    const [description, setDescription] = useState(template?.description || defaultDraft.description);
    const [templateType, setTemplateType] = useState(template?.templateType || defaultDraft.preset.key);
    const [descriptionTouched, setDescriptionTouched] = useState(Boolean(template?.description));
    const [actionState, saveAction, pending] = useActionState(saveComplianceTemplateAction, initialState);

    const preview = useMemo(() => buildComplianceTemplateDraft(description), [description]);
    const titleSuggestion = useMemo(() => buildComplianceTemplateDraft(title), [title]);
    const suggestedDescription = titleSuggestion.description;
    const estimatedMinutes = useMemo(() => {
        const base = preview.sections.length * 2;
        return Math.max(4, base + (description.trim().length > 100 ? 2 : 0));
    }, [description, preview.sections.length]);

    const latestIntegration = complianceSnapshot?.integrations?.[0] || null;
    const latestInspection = complianceSnapshot?.inspections?.[0] || null;
    const latestScoreHistory = complianceSnapshot?.scoreHistory?.[0] || null;
    const latestPublicInspection = publicInspectionFeed?.items?.[0] || null;

    function applyPreset(key: string) {
        const preset = presets.find((item) => item.key === key) || presets[0];
        setTitle(preset.label);
        setDescription(preset.description);
        setTemplateType(preset.key);
        setDescriptionTouched(false);
    }

    function applySuggestedDescription() {
        setDescription(suggestedDescription);
        setTemplateType(titleSuggestion.preset.key);
        setDescriptionTouched(false);
    }

    return (
        <div className="md-body min-h-screen animate-fade-in-up">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/merchant/dashboard" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f97316] transition hover:border-[#f97316]/40 hover:bg-white/10">
                        ←
                    </Link>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[#f97316]/20 bg-[#f9731614] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f97316]">
                                Merchant Compliance
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a93a7]">
                                {isPreview ? "Preview Mode" : "Pilot Ready"}
                            </span>
                        </div>
                        <div className="mt-2 h-2 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#6d6ff3] via-[#8b85ff] to-[#f97316]" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <section className="rounded-[28px] border border-white/10 bg-[#10131b] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-2xl">
                                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8a93a7]">What would you like to create?</div>
                                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
                                    Build a <span className="text-[#f97316]">merchant checklist</span> that looks ready for production.
                                </h1>
                                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#aab4c8]">
                                    Describe the inspection, form, or checklist you want, and TrueServe will turn it into a reusable template for your restaurant.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Restaurant</div>
                                <div className="mt-1 text-sm font-bold text-white">{restaurant.name}</div>
                                <div className="mt-1 text-[11px] text-[#aab4c8]">
                                    {restaurant.healthGrade ? `Health grade ${restaurant.healthGrade}` : "No inspection yet"} · {restaurant.complianceStatus || "Draft"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <form action={saveAction} className="space-y-5">
                                <input type="hidden" name="templateType" value={templateType} />
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-white" htmlFor="templateTitle">Title</label>
                                    <input
                                        id="templateTitle"
                                        name="title"
                                        value={title}
                                        onChange={(event) => {
                                            const nextTitle = event.target.value;
                                            setTitle(nextTitle);
                                            if (!descriptionTouched) {
                                                const nextSuggestion = buildComplianceTemplateDraft(nextTitle);
                                                setDescription(nextSuggestion.description);
                                                setTemplateType(nextSuggestion.preset.key);
                                            }
                                        }}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white outline-none transition placeholder:text-[#667085] focus:border-[#f97316]/50"
                                        placeholder="Daily restaurant hygiene checklist"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-white" htmlFor="templateDescription">Description</label>
                                    <textarea
                                        id="templateDescription"
                                        name="description"
                                        value={description}
                                        onChange={(event) => {
                                            setDescription(event.target.value);
                                            setDescriptionTouched(true);
                                        }}
                                        rows={6}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base leading-7 text-white outline-none transition placeholder:text-[#667085] focus:border-[#f97316]/50"
                                        placeholder="Daily restaurant hygiene checklist"
                                    />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs text-[#8a93a7]">Suggested:</span>
                                        <button
                                            type="button"
                                            onClick={applySuggestedDescription}
                                            className="rounded-full border border-[#f97316]/20 bg-[#f9731612] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#f97316] transition hover:border-[#f97316]/40 hover:bg-[#f9731618]"
                                        >
                                            Use suggested description
                                        </button>
                                        <span className="text-xs text-[#aab4c8]">{suggestedDescription}</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#f97316]/15 bg-[#f9731610] px-4 py-4">
                                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f97316]">Suggestions</div>
                                    <div className="mt-3 grid gap-3">
                                        {presets.map((preset) => (
                                            <button
                                                key={preset.key}
                                                type="button"
                                                onClick={() => applyPreset(preset.key)}
                                                className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                                                    templateType === preset.key
                                                        ? "border-[#f97316]/50 bg-[#f9731618]"
                                                        : "border-white/10 bg-white/5 hover:border-[#f97316]/30 hover:bg-white/10"
                                                }`}
                                            >
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/8 text-lg">{preset.icon}</span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-semibold text-white">{preset.label}</span>
                                                    <span className="block text-xs text-[#aab4c8]">{preset.note}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#4db8ff]/20 bg-[#4db8ff12] px-4 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#4db8ff]/30 bg-[#4db8ff15] text-[#4db8ff]">
                                            i
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-white">How this works</div>
                                            <p className="mt-1 text-sm leading-6 text-[#cfe7ff]">
                                                Keep descriptions short and structured. Avoid personal, customer, or commercial secrets in the prompt so the template stays safe to share with staff.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={pending}
                                        className="inline-flex h-12 items-center justify-center rounded-full border border-[#f97316]/40 bg-[#f97316] px-6 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {pending ? "Saving..." : "Save Draft"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPreset("daily_hygiene")}
                                        className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:border-white/20 hover:bg-white/10"
                                    >
                                        Reset
                                    </button>
                                    <div className="text-xs text-[#8a93a7]">
                                        {preview.sections.length} sections · about {estimatedMinutes} min to complete
                                    </div>
                                </div>

                                {actionState.message && (
                                    <div className={`rounded-2xl border px-4 py-4 text-sm leading-6 ${actionState.status === "success" ? "border-[#2ee5a0]/25 bg-[#2ee5a014] text-[#baf7dd]" : "border-[#ff6b6b]/25 bg-[#ff6b6b14] text-[#ffd0d0]"}`}>
                                        {actionState.message}
                                    </div>
                                )}
                            </form>

                            <aside className="space-y-5">
                                <div className="rounded-[24px] border border-[#2ee5a0]/16 bg-[#0c1812] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2ee5a0]">Compliance snapshot</div>
                                            <div className="mt-1 text-lg font-black text-white">Connected status</div>
                                        </div>
                                        <div className="rounded-full border border-[#2ee5a0]/20 bg-[#2ee5a018] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#2ee5a0]">
                                            {restaurant.complianceStatus || "Draft"}
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        {[
                                            { label: "Latest score", value: `${restaurant.complianceScore ?? 0}/100` },
                                            { label: "Latest grade", value: restaurant.healthGrade || "—" },
                                            { label: "Last inspection", value: latestInspection?.inspectionDate ? new Date(latestInspection.inspectionDate).toLocaleDateString() : "—" },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a93a7]">{item.label}</div>
                                                <div className="mt-2 text-sm font-bold text-white">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Public inspection view</div>
                                            <div className="mt-1 text-xl font-black text-white">Health data and history</div>
                                        </div>
                                        <div className="rounded-full border border-[#f97316]/20 bg-[#f9731614] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f97316]">
                                            Pilot
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-[#aab4c8]">
                                        Latest health grade, source link, and sync status shown in one streamlined view.
                                    </p>
                                    {publicInspectionFeed && (
                                        <div className="mt-4 rounded-2xl border border-[#f97316]/15 bg-[#f9731610] px-4 py-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f97316]">Public-health feed</div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f97316]/90">
                                                    {publicInspectionFeed.items[0]?.grade || "—"}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-white">{publicInspectionFeed.summary}</div>
                                            <div className="mt-1 text-xs text-[#aab4c8]">
                                                {publicInspectionFeed.locationLabel} · refreshed {new Date(publicInspectionFeed.lastUpdatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 grid gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-[#0b0f17] px-4 py-4">
                                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a93a7]">Latest source</div>
                                            <div className="mt-2 text-sm font-semibold text-white">{restaurant.lastInspectionSource || "Not connected"}</div>
                                            <div className="mt-1 text-xs text-[#aab4c8]">
                                                {restaurant.publicInspectionUrl || "No public inspection URL stored yet"}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-[#0b0f17] px-4 py-4">
                                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a93a7]">Integration status</div>
                                            <div className="mt-2 text-sm font-semibold text-white">
                                                {latestIntegration ? `${latestIntegration.provider} · ${latestIntegration.status || "ACTIVE"}` : "No compliance integration yet"}
                                            </div>
                                            <div className="mt-1 text-xs text-[#aab4c8]">
                                                {latestIntegration?.lastSyncAt ? `Last sync ${new Date(latestIntegration.lastSyncAt).toLocaleString()}` : "Integration ready for future state API connections."}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Recent records</div>
                                    <div className="mt-3 space-y-3">
                                        {latestPublicInspection && (
                                            <div className="rounded-2xl border border-[#4db8ff]/20 bg-[#4db8ff12] p-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="text-sm font-semibold text-white">Public health feed</div>
                                                    <div className="text-xs font-black uppercase tracking-[0.16em] text-[#4db8ff]">
                                                        {latestPublicInspection.grade}
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between gap-4 text-xs text-[#aab4c8]">
                                                    <span>{latestPublicInspection.source}</span>
                                                    <span>{latestPublicInspection.score}/100</span>
                                                </div>
                                                <div className="mt-2 text-xs leading-5 text-[#cfe7ff]">
                                                    {latestPublicInspection.notes.join(" · ")}
                                                </div>
                                            </div>
                                        )}
                                        {(complianceSnapshot?.inspections || []).slice(0, 3).map((inspection) => (
                                            <div key={inspection.id} className="rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="text-sm font-semibold text-white">
                                                        {inspection.provider}
                                                    </div>
                                                    <div className="text-xs font-black uppercase tracking-[0.16em] text-[#f97316]">
                                                        {inspection.status || "PASS"}
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between gap-4 text-xs text-[#aab4c8]">
                                                    <span>{inspection.inspectionDate ? new Date(inspection.inspectionDate).toLocaleDateString() : "No date"}</span>
                                                    <span>{typeof inspection.score === "number" ? `${inspection.score}/100` : "No score"}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(complianceSnapshot?.inspections || []).length === 0 && (
                                            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b0f17] p-4 text-sm text-[#8a93a7]">
                                                No inspection records yet.
                                            </div>
                                        )}
                                    </div>
                                    {latestScoreHistory && (
                                        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                                            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#8a93a7]">Latest score change</div>
                                            <div className="mt-2 text-sm font-semibold text-white">
                                                {typeof latestScoreHistory.score === "number" ? `${latestScoreHistory.score}/100` : "No score"}
                                            </div>
                                            <div className="mt-1 text-xs text-[#aab4c8]">
                                                {latestScoreHistory.reason || "Stored from compliance recalculate"}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Live Preview</div>
                                            <div className="mt-1 text-xl font-black text-white">{preview.title}</div>
                                        </div>
                                        <div className="rounded-full border border-[#f97316]/25 bg-[#f9731614] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f97316]">
                                            Draft
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-[#aab4c8]">{preview.summary}</p>

                                    <div className="mt-5 space-y-3">
                                        {preview.sections.map((section) => (
                                            <div key={section.title} className="rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                                                <div className="text-sm font-bold text-white">{section.title}</div>
                                                <ul className="mt-3 space-y-2">
                                                    {section.items.map((item) => (
                                                        <li key={item} className="flex gap-2 text-sm leading-6 text-[#aab4c8]">
                                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f97316]" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-white/10 bg-[#0b0f17] p-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Template Health</div>
                                    <div className="mt-4 grid grid-cols-3 gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                                            <div className="text-xl font-black text-[#f97316]">{preview.sections.length}</div>
                                            <div className="mt-1 text-[11px] text-[#8a93a7]">Sections</div>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                                            <div className="text-xl font-black text-[#2ee5a0]">{estimatedMinutes}</div>
                                            <div className="mt-1 text-[11px] text-[#8a93a7]">Minutes</div>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                                            <div className="text-xl font-black text-white">A</div>
                                            <div className="mt-1 text-[11px] text-[#8a93a7]">Pilot fit</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 rounded-2xl border border-[#f97316]/15 bg-[#f9731610] px-4 py-4 text-sm leading-6 text-[#f8e6bc]">
                                        {preview.note}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

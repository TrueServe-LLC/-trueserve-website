"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DriverComplianceSnapshot = {
    id: string;
    name: string;
    complianceScore: number;
    complianceStatus: string;
    lastComplianceAttestationAt?: string | null;
    trainingStatus: string;
    bagSanitationAcknowledged: boolean;
    temperatureControlAcknowledged: boolean;
    foodSafetyTrainingComplete: boolean;
    notes?: string;
};

type AttestationRecord = {
    id: string;
    checklistType: string;
    status: string;
    score?: number | null;
    completedAt?: string | null;
};

export default function DriverComplianceClient({
    driver,
    attestations,
}: {
    driver: DriverComplianceSnapshot;
    attestations: AttestationRecord[];
}) {
    const router = useRouter();
    const [trainingComplete, setTrainingComplete] = useState(driver.foodSafetyTrainingComplete);
    const [bagAck, setBagAck] = useState(driver.bagSanitationAcknowledged);
    const [tempAck, setTempAck] = useState(driver.temperatureControlAcknowledged);
    const [notes, setNotes] = useState(driver.notes || "");
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();

    const estimatedScore = useMemo(() => {
        let score = 0;
        if (trainingComplete) score += 40;
        if (bagAck) score += 30;
        if (tempAck) score += 30;
        return score;
    }, [bagAck, tempAck, trainingComplete]);

    function submitAttestation() {
        startTransition(async () => {
            setMessage("");
            const response = await fetch(`/api/compliance/drivers/${driver.id}/attestations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    checklistType: "driver_attestation",
                    trainingStatus: trainingComplete ? "ACTIVE" : "PENDING",
                    foodSafetyTrainingComplete: trainingComplete,
                    bagSanitationAcknowledged: bagAck,
                    temperatureControlAcknowledged: tempAck,
                    notes,
                    score: estimatedScore,
                }),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                setMessage(result?.error || "Unable to save attestation.");
                return;
            }

            setMessage("Compliance attestation saved.");
            router.refresh();
        });
    }

    return (
        <div className="md-body min-h-screen animate-fade-in-up">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 md:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-3">
                    <a href="/driver/dashboard" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f1b243] transition hover:border-[#f1b243]/40 hover:bg-white/10">
                        ←
                    </a>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[#f1b243]/20 bg-[#f1b24314] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f1b243]">
                                Driver Compliance
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a93a7]">
                                Pilot Ready
                            </span>
                        </div>
                        <div className="mt-2 h-2 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[66%] rounded-full bg-gradient-to-r from-[#6d6ff3] via-[#8b85ff] to-[#f1b243]" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.84fr)]">
                    <section className="rounded-[28px] border border-white/10 bg-[#10131b] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-2xl">
                                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8a93a7]">What should we keep current?</div>
                                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
                                    Keep your <span className="text-[#f1b243]">driver compliance</span> ready for pilot launch.
                                </h1>
                                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#aab4c8]">
                                    This is the driver-side checklist for food safety training, bag sanitation, and temperature handling. It keeps your profile ready for dispatch and gives TrueServe a clear compliance trail.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Driver</div>
                                <div className="mt-1 text-sm font-bold text-white">{driver.name}</div>
                                <div className="mt-1 text-[11px] text-[#aab4c8]">
                                    {driver.complianceStatus} · {driver.complianceScore}/100
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <div className="space-y-5">
                                <div className="rounded-[24px] border border-white/10 bg-[#0b0f17] p-5">
                                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f1b243]">Compliance checklist</div>
                                    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10 bg-[#0b0f17]">
                                        {[
                                            {
                                                key: "training",
                                                label: "Food safety training complete",
                                                helper: "Confirms you’ve reviewed the pilot safety standards.",
                                                checked: trainingComplete,
                                                onChange: setTrainingComplete,
                                            },
                                            {
                                                key: "bag",
                                                label: "Delivery bag sanitation acknowledged",
                                                helper: "Shows your bag or container is clean and ready.",
                                                checked: bagAck,
                                                onChange: setBagAck,
                                            },
                                            {
                                                key: "temp",
                                                label: "Temperature control acknowledged",
                                                helper: "Confirms you’ll keep food hot/cold as instructed.",
                                                checked: tempAck,
                                                onChange: setTempAck,
                                            },
                                        ].map((item, index) => (
                                            <label
                                                key={item.key}
                                                className={`flex cursor-pointer items-start gap-4 px-4 py-4 transition ${item.checked ? "bg-[#f1b24312]" : "bg-[#0b0f17] hover:bg-white/[0.03]"} ${index !== 2 ? "border-b border-white/10" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={(event) => item.onChange(event.target.checked)}
                                                    className="mt-1 h-5 w-5 rounded border-white/20 bg-black/40 text-[#f1b243] focus:ring-[#f1b243]"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-bold text-white">{item.label}</span>
                                                    <span className="mt-1 block text-xs leading-6 text-[#aab4c8]">{item.helper}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-white/10 bg-[#0b0f17] p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Notes</div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a93a7]">Optional</div>
                                    </div>
                                    <textarea
                                        value={notes}
                                        onChange={(event) => setNotes(event.target.value)}
                                        placeholder="Optional notes for the compliance record"
                                        rows={4}
                                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none transition placeholder:text-[#667085] focus:border-[#f1b243]/50"
                                    />
                                </div>

                                {message && (
                                    <div className="rounded-2xl border border-[#2ee5a0]/25 bg-[#2ee5a014] px-4 py-4 text-sm leading-6 text-[#baf7dd]">
                                        {message}
                                    </div>
                                )}
                            </div>

                            <aside className="space-y-5">
                                <div className="rounded-[24px] border border-[#2ee5a0]/16 bg-[#0c1812] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2ee5a0]">Compliance snapshot</div>
                                            <div className="mt-1 text-lg font-black text-white">Current score</div>
                                        </div>
                                        <div className="rounded-full border border-[#2ee5a0]/20 bg-[#2ee5a018] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#2ee5a0]">
                                            {driver.complianceStatus}
                                        </div>
                                    </div>
                                    <div className="mt-4 overflow-hidden rounded-[20px] border border-white/8 bg-white/5 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-white/10">
                                        {[
                                            { label: "Estimated score", value: `${estimatedScore}/100` },
                                            { label: "Last attestation", value: driver.lastComplianceAttestationAt ? new Date(driver.lastComplianceAttestationAt).toLocaleDateString() : "—" },
                                            { label: "Training", value: trainingComplete ? "Complete" : "Pending" },
                                        ].map((item) => (
                                            <div key={item.label} className="px-3 py-3 sm:px-4">
                                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a93a7]">{item.label}</div>
                                                <div className="mt-2 text-sm font-bold text-white">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Submission status</div>
                                    <p className="mt-3 text-sm leading-6 text-[#aab4c8]">
                                        When you submit this checklist, TrueServe updates your driver compliance record and recalculates your score so dispatch can see your readiness.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={submitAttestation}
                                        disabled={isPending}
                                        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full border border-[#f1b243]/40 bg-[#f1b243] px-6 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isPending ? "Saving..." : "Save Attestation"}
                                    </button>
                                </div>

                                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
                                    <div className="px-5 pt-5">
                                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8a93a7]">Recent attestations</div>
                                    </div>
                                    <div className="mt-4 divide-y divide-white/10">
                                        {attestations.slice(0, 4).map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-4">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-white">{entry.checklistType}</div>
                                                    <div className="mt-1 text-xs text-[#aab4c8]">
                                                        {entry.status} · {entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : "No date"}
                                                    </div>
                                                </div>
                                                <div className="shrink-0 rounded-full border border-[#f1b243]/20 bg-[#f1b24314] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#f1b243]">
                                                    {entry.score ?? 0}/100
                                                </div>
                                            </div>
                                        ))}
                                        {attestations.length === 0 && (
                                            <div className="px-5 py-5 text-sm text-[#8a93a7]">
                                                No attestation history yet.
                                            </div>
                                        )}
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

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type DriverActionResult = {
    success?: boolean;
    error?: string;
};

type DriverApplicationActionsProps = {
    driverId: string;
    approveAction: (driverId: string) => Promise<DriverActionResult>;
    rejectAction: (driverId: string) => Promise<DriverActionResult>;
    readyAction?: (driverId: string) => Promise<DriverActionResult>;
    readyDisabled?: boolean;
    readyDisabledReason?: string;
};

export default function DriverApplicationActions({
    driverId,
    approveAction,
    rejectAction,
    readyAction,
    readyDisabled = false,
    readyDisabledReason = "All three documents are required before this driver can move to review."
}: DriverApplicationActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const runAction = (actionType: "ready" | "approve" | "reject") => {
        setMessage(null);
        startTransition(async () => {
            let result: DriverActionResult | null = null;

            try {
                if (actionType === "ready") {
                    if (!readyAction) return;
                    result = await readyAction(driverId);
                } else {
                    result = actionType === "approve"
                        ? await approveAction(driverId)
                        : await rejectAction(driverId);
                }
            } catch (error) {
                console.error(`Driver ${actionType} action failed:`, error);
                setMessage({
                    type: "error",
                    text: `Could not ${actionType} this driver. Check the account details and try again.`
                });
                return;
            }

            if (!result) return;

            if (result?.success) {
                setMessage({
                    type: "success",
                    text: actionType === "ready"
                        ? "Moved to Ready for Review. The driver now appears in the review lane."
                        : actionType === "approve"
                            ? "Approved — login, compliance, email, and SMS are now active."
                            : "Rejected — applicant record was updated."
                });
                router.refresh();
                return;
            }

            setMessage({
                type: "error",
                text: result?.error || `Could not ${actionType} this driver.`
            });
        });
    };

    return (
        <div className="um-app-action-stack">
            <div className="um-app-action-row">
                {readyAction && (
                    <button
                        type="button"
                        className="um-app-btn ready"
                        disabled={isPending || readyDisabled}
                        title={readyDisabled ? readyDisabledReason : "Move this driver into the Ready for Review lane"}
                        onClick={() => runAction("ready")}
                    >
                        {isPending ? "Working..." : "Move to review"}
                    </button>
                )}
                <button
                    type="button"
                    className="um-app-btn approve"
                    disabled={isPending}
                    onClick={() => runAction("approve")}
                >
                    {isPending ? "Working..." : "Approve"}
                </button>
                <button
                    type="button"
                    className="um-app-btn reject"
                    disabled={isPending}
                    onClick={() => runAction("reject")}
                >
                    {isPending ? "Working..." : "Reject"}
                </button>
            </div>
            {message && (
                <div className={`um-app-action-message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

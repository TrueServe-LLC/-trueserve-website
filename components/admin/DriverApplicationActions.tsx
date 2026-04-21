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
};

export default function DriverApplicationActions({
    driverId,
    approveAction,
    rejectAction
}: DriverApplicationActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const runAction = (actionType: "approve" | "reject") => {
        setMessage(null);
        startTransition(async () => {
            let result: DriverActionResult;

            try {
                result = actionType === "approve"
                    ? await approveAction(driverId)
                    : await rejectAction(driverId);
            } catch (error) {
                console.error(`Driver ${actionType} action failed:`, error);
                setMessage({
                    type: "error",
                    text: `Could not ${actionType} this driver. Check the account details and try again.`
                });
                return;
            }

            if (result?.success) {
                setMessage({
                    type: "success",
                    text: actionType === "approve"
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

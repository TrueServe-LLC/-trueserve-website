"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type MerchantActionResult = {
    success?: boolean;
    error?: string;
};

type MerchantApplicationActionsProps = {
    restaurantId: string;
    approveAction: (restaurantId: string) => Promise<MerchantActionResult>;
    rejectAction: (restaurantId: string) => Promise<MerchantActionResult>;
};

export default function MerchantApplicationActions({
    restaurantId,
    approveAction,
    rejectAction
}: MerchantApplicationActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const runAction = (actionType: "approve" | "reject") => {
        setMessage(null);
        startTransition(async () => {
            let result: MerchantActionResult;

            try {
                result = actionType === "approve"
                    ? await approveAction(restaurantId)
                    : await rejectAction(restaurantId);
            } catch (error) {
                console.error(`Merchant ${actionType} action failed:`, error);
                setMessage({
                    type: "error",
                    text: `Could not ${actionType} this merchant. Check the restaurant details and try again.`
                });
                return;
            }

            if (result?.success) {
                setMessage({
                    type: "success",
                    text: actionType === "approve"
                        ? "Approved — storefront, portal access, email, and SMS are now active."
                        : "Rejected — merchant application was updated."
                });
                router.refresh();
                return;
            }

            setMessage({
                type: "error",
                text: result?.error || `Could not ${actionType} this merchant.`
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

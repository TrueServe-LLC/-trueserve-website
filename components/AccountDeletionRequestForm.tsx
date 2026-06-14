"use client";

import { useActionState } from "react";
import {
    requestAccountDeletion,
    type AccountDeletionState,
} from "@/app/account-deletion/actions";

const initialState: AccountDeletionState = {};

export default function AccountDeletionRequestForm() {
    const [state, action, pending] = useActionState(requestAccountDeletion, initialState);

    if (state.success) {
        return (
            <div className="deletion-success">
                Your request was received. We will verify ownership and complete eligible deletion
                requests within 30 days.
            </div>
        );
    }

    return (
        <form action={action} className="deletion-form">
            <input name="website" tabIndex={-1} autoComplete="off" className="deletion-honeypot" aria-hidden="true" />
            <label>
                Account email
                <input type="email" name="email" required autoComplete="email" />
            </label>
            <label>
                Optional details
                <textarea
                    name="details"
                    maxLength={1000}
                    rows={4}
                    placeholder="Customer, driver, or merchant account; alternate contact details; or anything that helps us locate the account."
                />
            </label>
            {state.error && <p role="alert" className="deletion-error">{state.error}</p>}
            <button type="submit" disabled={pending}>
                {pending ? "Submitting..." : "Request account deletion"}
            </button>
        </form>
    );
}

"use client";

import { logout } from "@/app/auth/actions";

export default function LogoutButton() {
    return (
        <button
            onClick={async () => {
                await logout();
            }}
            className="btn btn-ghost !py-1.5 md:!py-2 !px-3 md:!px-6 !text-[10px] md:!text-sm border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white whitespace-nowrap"
        >
            Log out
        </button>
    );
}

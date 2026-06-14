import { NextResponse } from "next/server";
import { getAuthSession } from "@/app/auth/actions";
import { getAccountHomeHref } from "@/lib/account-routing";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getAuthSession();

    return NextResponse.json(
        {
            authenticated: session.isAuth,
            accountHref: session.isAuth
                ? getAccountHomeHref(session.role)
                : "/login",
        },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        }
    );
}

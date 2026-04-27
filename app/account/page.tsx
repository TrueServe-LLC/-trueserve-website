import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { getAccountHomeHref } from "@/lib/account-routing";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
    const { isAuth, role } = await getAuthSession();

    if (!isAuth) {
        redirect("/login");
    }

    redirect(getAccountHomeHref(role));
}

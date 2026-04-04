"use client";

import { redirect } from "next/navigation";

export default function MerchantPortal() {
    redirect("/merchant/signup");
    return null;
}

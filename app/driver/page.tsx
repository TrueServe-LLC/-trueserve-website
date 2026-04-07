"use client";

import { redirect } from "next/navigation";

export default function DriverPortal() {
    redirect("/driver/signup");
    return null;
}

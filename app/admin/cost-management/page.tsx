import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import AdminStyles from "@/components/admin/AdminStyles";
import CostDashboard from "@/components/admin/CostDashboard";
import CostSyncManager from "@/components/admin/CostSyncManager";
import { analyzeCosts, checkBudgetAlerts } from "@/lib/costAnalytics";
import type { MonthlyCost } from "@/lib/costAnalytics";

export const dynamic = "force-dynamic";

async function getServiceCosts() {
    try {
        const { data, error } = await supabaseAdmin
            .from("ServiceCost")
            .select("*")
            .order("month", { ascending: false })
            .limit(24); // Last 24 months

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching service costs:", e);
        return [];
    }
}

async function getBudgetAlerts() {
    try {
        const { data, error } = await supabaseAdmin
            .from("BudgetAlert")
            .select("*");

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching budget alerts:", e);
        return [];
    }
}

// Mock data generator for demo
function generateMockCosts(): MonthlyCost[] {
    const costs: MonthlyCost[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const month = date.toISOString().slice(0, 7);

        const stripeVariance = (Math.random() - 0.5) * 1000 + 800;
        const supabaseVariance = (Math.random() - 0.5) * 200 + 300;
        const gcVariance = (Math.random() - 0.5) * 500 + 1000;
        const mapboxVariance = (Math.random() - 0.5) * 100 + 150;
        const resendVariance = (Math.random() - 0.5) * 50 + 75;
        const vonageVariance = (Math.random() - 0.5) * 150 + 250;

        costs.push({
            month,
            totalCost: Math.max(0, stripeVariance + supabaseVariance + gcVariance + mapboxVariance + resendVariance + vonageVariance),
            byService: {
                stripe: Math.max(0, stripeVariance),
                supabase: Math.max(0, supabaseVariance),
                "google-cloud": Math.max(0, gcVariance),
                mapbox: Math.max(0, mapboxVariance),
                resend: Math.max(0, resendVariance),
                vonage: Math.max(0, vonageVariance),
            },
        });
    }

    return costs;
}

export default async function CostManagementPage() {
    // Check if user is admin
    const session = await getAuthSession();
    if (!session?.adminId) {
        redirect("/admin/login");
    }

    const realCosts = await getServiceCosts();
    const budgets = await getBudgetAlerts();

    // For now, use mock data if no real data exists
    let monthlyCosts: MonthlyCost[] = [];

    if (realCosts.length > 0) {
        // Convert real data to MonthlyCost format
        const costMap = new Map<string, MonthlyCost>();
        realCosts.forEach((cost: any) => {
            const month = cost.month;
            if (!costMap.has(month)) {
                costMap.set(month, {
                    month,
                    totalCost: 0,
                    byService: {
                        stripe: 0,
                        supabase: 0,
                        "google-cloud": 0,
                        mapbox: 0,
                        resend: 0,
                        vonage: 0,
                    },
                });
            }
            const entry = costMap.get(month)!;
            entry.byService[cost.service as any] = cost.cost;
            entry.totalCost += cost.cost;
        });
        monthlyCosts = Array.from(costMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    } else {
        // Use mock data for demo
        monthlyCosts = generateMockCosts();
    }

    const analysis = analyzeCosts(monthlyCosts, budgets as any);
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Check for budget warnings
    const budgetWarnings = monthlyCosts
        .find((m) => m.month === currentMonth)
        ?.byService && budgets.length > 0
        ? Object.entries(monthlyCosts.find((m) => m.month === currentMonth)!.byService)
            .map(([service, cost]) => {
                const budget = budgets.find((b: any) => b.service === service);
                if (budget && cost >= (budget.monthlyLimit * budget.alert_threshold) / 100) {
                    return {
                        service,
                        spent: cost,
                        limit: budget.monthlyLimit,
                    };
                }
                return null;
            })
            .filter(Boolean) as any[]
        : [];

    return (
        <div className="min-h-screen bg-[#0a0c09]">
            <AdminStyles />

            <header className="border-b border-white/10 bg-[#0f1117] sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">Cost Management</h1>
                        <p className="mt-2 text-sm text-white/50">
                            Track and manage spending across all services
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Sync Manager */}
                <div className="mb-8">
                    <CostSyncManager />
                </div>

                <CostDashboard
                    analysis={analysis}
                    currentMonth={currentMonth}
                    budgetWarnings={budgetWarnings}
                />

                {/* Info Box */}
                <div className="mt-8 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <h3 className="font-semibold text-blue-300 mb-2">📊 About Cost Data</h3>
                    <p className="text-sm text-blue-200/80">
                        This dashboard shows estimated costs based on service usage. For accurate billing information, check each service's dashboard directly.
                        Forecasts use historical trends and may change with usage patterns.
                    </p>
                </div>

                {/* Services Guide */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-white mb-4">Services Overview</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                name: "Stripe Payments",
                                description: "Payment processing and order management",
                                link: "https://dashboard.stripe.com",
                            },
                            {
                                name: "Supabase Database",
                                description: "PostgreSQL database and real-time data",
                                link: "https://supabase.com/dashboard",
                            },
                            {
                                name: "Google Cloud",
                                description: "APIs for maps, translation, and AI",
                                link: "https://console.cloud.google.com",
                            },
                            {
                                name: "Mapbox Maps",
                                description: "Location services and mapping",
                                link: "https://account.mapbox.com",
                            },
                            {
                                name: "Resend Email",
                                description: "Email delivery service",
                                link: "https://resend.com/dashboard",
                            },
                            {
                                name: "Vonage SMS",
                                description: "SMS notification delivery",
                                link: "https://dashboard.nexmo.com",
                            },
                        ].map((service) => (
                            <a
                                key={service.name}
                                href={service.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-white/10 bg-[#10131b] p-4 hover:border-[#e8a230]/40 hover:bg-white/[0.02] transition-all"
                            >
                                <h3 className="font-bold text-white">{service.name}</h3>
                                <p className="mt-1 text-sm text-white/50">{service.description}</p>
                                <p className="mt-2 text-xs text-[#68c7cc]">Open dashboard →</p>
                            </a>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

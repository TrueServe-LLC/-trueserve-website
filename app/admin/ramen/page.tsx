import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAdminSession } from "@/app/admin/login/actions";
import { redirect } from "next/navigation";
import RamenDashboard from "@/components/admin/RamenDashboard";

export const dynamic = "force-dynamic";

function isMock(r: any) {
  return (
    r?.isMock === true ||
    /mock|test|demo|preview|sandbox|sample|qa|staging|seed/i.test(
      `${r?.name || ""} ${r?.email || ""}`
    )
  );
}

export default async function RamenPage() {
  const session = await getAdminSession();
  if (!session?.isAuth) redirect("/admin/login");

  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const d7  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000).toISOString();

  // ── Fetch raw data ────────────────────────────────────────────────────
  const [ordersRes, usersRes, driversRes, reviewsRes] = await Promise.all([
    supabaseAdmin
      .from("Order")
      .select("id, userId, total, totalAmount, status, createdAt, deliveredAt")
      .in("status", ["DELIVERED", "COMPLETED", "PICKED_UP", "READY_FOR_PICKUP", "PREPARING", "PENDING"])
      .order("createdAt", { ascending: true }),

    supabaseAdmin
      .from("User")
      .select("id, email, name, role, isMock, createdAt")
      .eq("role", "CUSTOMER"),

    supabaseAdmin
      .from("Driver")
      .select("id, userId, status, createdAt")
      .neq("status", "REJECTED"),

    supabaseAdmin
      .from("Review")
      .select("id, rating, customerId, createdAt"),
  ]);

  const allOrders   = (ordersRes.data  || []);
  const allUsers    = (usersRes.data   || []).filter(u => !isMock(u));
  const allDrivers  = (driversRes.data || []);
  const allReviews  = (reviewsRes.data || []);

  const delivered   = allOrders.filter(o => o.status === "DELIVERED" || o.status === "COMPLETED");

  // ── MONETIZATION ─────────────────────────────────────────────────────
  const revenue = (o: any) => Number(o.totalAmount || o.total || 0);

  const revAll   = delivered.reduce((s, o) => s + revenue(o), 0);
  const rev30    = delivered.filter(o => o.createdAt >= d30).reduce((s, o) => s + revenue(o), 0);
  const revPrev  = delivered.filter(o => o.createdAt >= d60 && o.createdAt < d30).reduce((s, o) => s + revenue(o), 0);
  const aov      = delivered.length ? revAll / delivered.length : 0;
  const revTrend = revPrev > 0 ? ((rev30 - revPrev) / revPrev) * 100 : null;

  // ── ACTIVATION ────────────────────────────────────────────────────────
  // % of customers who placed first order within 7 days of signup
  const firstOrderByUser: Record<string, string> = {};
  for (const o of allOrders) {
    if (!o.userId) continue;
    if (!firstOrderByUser[o.userId] || o.createdAt < firstOrderByUser[o.userId]) {
      firstOrderByUser[o.userId] = o.createdAt;
    }
  }

  let activated = 0;
  let activationDenominator = 0;
  for (const u of allUsers) {
    const firstOrder = firstOrderByUser[u.id];
    if (!firstOrder) continue; // no order yet — exclude from denominator (never had a chance)
    activationDenominator++;
    const diffDays = (new Date(firstOrder).getTime() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) activated++;
  }
  const activationRate = activationDenominator > 0 ? (activated / activationDenominator) * 100 : 0;

  // ── RETENTION (30-day) ────────────────────────────────────────────────
  // % of customers with ≥1 delivered order who returned within 30 days of first order
  const deliveredByUser: Record<string, string[]> = {};
  for (const o of delivered) {
    if (!o.userId) continue;
    if (!deliveredByUser[o.userId]) deliveredByUser[o.userId] = [];
    deliveredByUser[o.userId].push(o.createdAt);
  }

  let retained = 0;
  const retentionDenominator = Object.keys(deliveredByUser).length;
  for (const [, dates] of Object.entries(deliveredByUser)) {
    dates.sort();
    if (dates.length < 2) continue;
    const first = new Date(dates[0]).getTime();
    const second = new Date(dates[1]).getTime();
    const diffDays = (second - first) / (1000 * 60 * 60 * 24);
    if (diffDays <= 30) retained++;
  }
  const retentionRate = retentionDenominator > 0 ? (retained / retentionDenominator) * 100 : 0;

  // ── ENGAGEMENT (WAU / MAU / stickiness) ───────────────────────────────
  const wauUsers = new Set(allOrders.filter(o => o.createdAt >= d7).map(o => o.userId).filter(Boolean));
  const mauUsers = new Set(allOrders.filter(o => o.createdAt >= d30).map(o => o.userId).filter(Boolean));
  const wau = wauUsers.size;
  const mau = mauUsers.size;
  const stickiness = mau > 0 ? (wau / mau) * 100 : 0;

  const ordersPerMauUser = mau > 0
    ? allOrders.filter(o => o.createdAt >= d30 && mauUsers.has(o.userId)).length / mau
    : 0;

  // ── NPS (from reviews) ────────────────────────────────────────────────
  const promoters  = allReviews.filter(r => r.rating >= 4).length;
  const detractors = allReviews.filter(r => r.rating <= 2).length;
  const passives   = allReviews.length - promoters - detractors;
  const nps = allReviews.length > 0
    ? Math.round(((promoters - detractors) / allReviews.length) * 100)
    : null;
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
    : null;

  // ── 30-day order trend (sparkline data) ───────────────────────────────
  const sparkline: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStr = day.toISOString().slice(0, 10);
    const dayOrders = delivered.filter(o => o.createdAt?.slice(0, 10) === dayStr);
    sparkline.push({
      date: dayStr,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + revenue(o), 0),
    });
  }

  return (
    <RamenDashboard
      metrics={{
        // R
        retentionRate,
        retained,
        retentionDenominator,
        // A
        activationRate,
        activated,
        activationDenominator,
        // M
        revAll,
        rev30,
        revPrev,
        revTrend,
        aov,
        deliveredCount: delivered.length,
        // E
        wau,
        mau,
        stickiness,
        ordersPerMauUser,
        // N
        nps,
        avgRating,
        promoters,
        passives,
        detractors,
        reviewCount: allReviews.length,
        // meta
        totalCustomers: allUsers.length,
        totalDrivers: allDrivers.length,
        sparkline,
      }}
    />
  );
}

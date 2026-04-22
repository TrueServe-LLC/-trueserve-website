import { supabaseAdmin } from "@/lib/supabase-admin";

const COMPLETED_ORDER_STATUSES = new Set(["DELIVERED", "COMPLETED"]);

export type DriverOrderMetricsInput = {
    id: string;
    status?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    estimatedETA?: string | null;
    deliveredAt?: string | null;
    pickedUpAt?: string | null;
};

export type DriverReviewMetricsInput = {
    id: string;
    orderId?: string | null;
    rating?: number | string | null;
    comment?: string | null;
    createdAt?: string | null;
    photoUrl?: string | null;
};

export type DriverRecentFeedback = {
    id: string;
    orderId: string | null;
    rating: number;
    comment: string | null;
    createdAt: string | null;
    photoUrl: string | null;
};

export type DriverPerformanceMetrics = {
    averageRating: number | null;
    reviewCount: number;
    reviewWindowCount: number;
    assignedTrips: number;
    completedTrips: number;
    completionRate: number | null;
    tripsWithMeasuredEta: number;
    onTimeCompletedTrips: number;
    onTimeRate: number | null;
    reviewCoverage: number | null;
    recentFeedback: DriverRecentFeedback[];
};

function roundToSingleDecimal(value: number) {
    return Number(value.toFixed(1));
}

function isCompletedOrder(order: DriverOrderMetricsInput) {
    return Boolean(order.deliveredAt) || COMPLETED_ORDER_STATUSES.has(order.status || "");
}

function resolveDeliveredTimestamp(order: DriverOrderMetricsInput) {
    return order.deliveredAt || (isCompletedOrder(order) ? order.updatedAt || order.createdAt || null : null);
}

export function calculateDriverPerformanceMetrics(input: {
    orders: DriverOrderMetricsInput[];
    reviews: DriverReviewMetricsInput[];
    totalReviewCount?: number;
}): DriverPerformanceMetrics {
    const orders = input.orders || [];
    const normalizedReviews = (input.reviews || [])
        .map((review) => ({
            id: review.id,
            orderId: review.orderId || null,
            rating: Number(review.rating),
            comment: review.comment?.trim() || null,
            createdAt: review.createdAt || null,
            photoUrl: review.photoUrl || null,
        }))
        .filter((review) => Number.isFinite(review.rating));

    const reviewWindowCount = normalizedReviews.length;
    const reviewCount = input.totalReviewCount ?? reviewWindowCount;
    const averageRating = reviewWindowCount
        ? roundToSingleDecimal(
            normalizedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewWindowCount
        )
        : null;

    const assignedTrips = orders.length;
    const completedTrips = orders.filter(isCompletedOrder).length;
    const completionRate = assignedTrips ? roundToSingleDecimal((completedTrips / assignedTrips) * 100) : null;

    const etaTrackedTrips = orders.filter((order) => {
        const deliveredTimestamp = resolveDeliveredTimestamp(order);
        return Boolean(order.estimatedETA && deliveredTimestamp);
    });
    const onTimeCompletedTrips = etaTrackedTrips.filter((order) => {
        const deliveredTimestamp = resolveDeliveredTimestamp(order);
        if (!deliveredTimestamp || !order.estimatedETA) return false;
        return new Date(deliveredTimestamp).getTime() <= new Date(order.estimatedETA).getTime();
    }).length;
    const tripsWithMeasuredEta = etaTrackedTrips.length;
    const onTimeRate = tripsWithMeasuredEta
        ? roundToSingleDecimal((onTimeCompletedTrips / tripsWithMeasuredEta) * 100)
        : null;

    const reviewCoverage = completedTrips
        ? roundToSingleDecimal(Math.min((reviewCount / completedTrips) * 100, 100))
        : null;

    return {
        averageRating,
        reviewCount,
        reviewWindowCount,
        assignedTrips,
        completedTrips,
        completionRate,
        tripsWithMeasuredEta,
        onTimeCompletedTrips,
        onTimeRate,
        reviewCoverage,
        recentFeedback: normalizedReviews.slice(0, 5),
    };
}

export async function fetchDriverPerformanceMetrics(
    driverId: string,
    options?: {
        orders?: DriverOrderMetricsInput[];
        reviewLimit?: number;
    }
): Promise<DriverPerformanceMetrics> {
    const reviewLimit = options?.reviewLimit ?? 100;
    const orders = options?.orders ?? [];

    const [reviewResponse, reviewCountResponse, orderResponse] = await Promise.all([
        supabaseAdmin
            .from("Review")
            .select("id, orderId, rating, comment, createdAt, photoUrl")
            .eq("driverId", driverId)
            .order("createdAt", { ascending: false })
            .limit(reviewLimit),
        supabaseAdmin
            .from("Review")
            .select("id", { count: "exact", head: true })
            .eq("driverId", driverId),
        options?.orders
            ? Promise.resolve({ data: orders, error: null })
            : supabaseAdmin
                .from("Order")
                .select("id, status, createdAt, updatedAt, estimatedETA, deliveredAt, pickedUpAt")
                .eq("driverId", driverId),
    ]);

    if (reviewResponse.error) {
        throw reviewResponse.error;
    }

    if (reviewCountResponse.error) {
        throw reviewCountResponse.error;
    }

    if (orderResponse.error) {
        throw orderResponse.error;
    }

    return calculateDriverPerformanceMetrics({
        orders: (orderResponse.data as DriverOrderMetricsInput[]) || orders,
        reviews: reviewResponse.data || [],
        totalReviewCount: reviewCountResponse.count ?? reviewResponse.data?.length ?? 0,
    });
}

export async function syncDriverStoredRating(
    driverId: string,
    options?: {
        orders?: DriverOrderMetricsInput[];
        reviewLimit?: number;
    }
) {
    const metrics = await fetchDriverPerformanceMetrics(driverId, options);

    const { error } = await supabaseAdmin
        .from("Driver")
        .update({
            rating: metrics.averageRating ?? 0,
            updatedAt: new Date().toISOString(),
        })
        .eq("id", driverId);

    if (error) {
        throw error;
    }

    return metrics;
}

export function getPreviewDriverPerformanceMetrics(): DriverPerformanceMetrics {
    return calculateDriverPerformanceMetrics({
        orders: [
            {
                id: "preview-order-1",
                status: "DELIVERED",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 28).toISOString(),
                estimatedETA: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30).toISOString(),
            },
            {
                id: "preview-order-2",
                status: "DELIVERED",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 25).toISOString(),
                estimatedETA: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 27).toISOString(),
            },
            {
                id: "preview-order-3",
                status: "PICKED_UP",
                createdAt: new Date().toISOString(),
            },
        ],
        reviews: [
            {
                id: "preview-review-1",
                orderId: "preview-order-1",
                rating: 5,
                comment: "Fast handoff and clear updates the whole way.",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            },
            {
                id: "preview-review-2",
                orderId: "preview-order-2",
                rating: 4,
                comment: "Friendly delivery and everything arrived sealed.",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            },
        ],
        totalReviewCount: 2,
    });
}

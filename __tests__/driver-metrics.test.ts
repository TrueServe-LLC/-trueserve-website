import { calculateDriverPerformanceMetrics } from "@/lib/driver-metrics";

describe("calculateDriverPerformanceMetrics", () => {
    it("computes rating, completion, on-time, and review coverage from real data", () => {
        const metrics = calculateDriverPerformanceMetrics({
            orders: [
                {
                    id: "order-1",
                    status: "DELIVERED",
                    createdAt: "2026-04-18T10:00:00.000Z",
                    deliveredAt: "2026-04-18T10:24:00.000Z",
                    estimatedETA: "2026-04-18T10:30:00.000Z",
                },
                {
                    id: "order-2",
                    status: "DELIVERED",
                    createdAt: "2026-04-19T11:00:00.000Z",
                    deliveredAt: "2026-04-19T11:46:00.000Z",
                    estimatedETA: "2026-04-19T11:40:00.000Z",
                },
                {
                    id: "order-3",
                    status: "PICKED_UP",
                    createdAt: "2026-04-20T12:00:00.000Z",
                },
            ],
            reviews: [
                {
                    id: "review-1",
                    orderId: "order-1",
                    rating: 5,
                    comment: "Great delivery",
                    createdAt: "2026-04-18T10:30:00.000Z",
                },
                {
                    id: "review-2",
                    orderId: "order-2",
                    rating: 4,
                    comment: "A little late but very nice",
                    createdAt: "2026-04-19T11:50:00.000Z",
                },
            ],
            totalReviewCount: 2,
        });

        expect(metrics.averageRating).toBe(4.5);
        expect(metrics.reviewCount).toBe(2);
        expect(metrics.assignedTrips).toBe(3);
        expect(metrics.completedTrips).toBe(2);
        expect(metrics.completionRate).toBe(66.7);
        expect(metrics.tripsWithMeasuredEta).toBe(2);
        expect(metrics.onTimeCompletedTrips).toBe(1);
        expect(metrics.onTimeRate).toBe(50);
        expect(metrics.reviewCoverage).toBe(100);
        expect(metrics.recentFeedback).toHaveLength(2);
    });

    it("falls back cleanly when no reviews or ETA data exist", () => {
        const metrics = calculateDriverPerformanceMetrics({
            orders: [
                {
                    id: "order-1",
                    status: "PICKED_UP",
                    createdAt: "2026-04-20T12:00:00.000Z",
                },
            ],
            reviews: [],
            totalReviewCount: 0,
        });

        expect(metrics.averageRating).toBeNull();
        expect(metrics.reviewCount).toBe(0);
        expect(metrics.completedTrips).toBe(0);
        expect(metrics.completionRate).toBe(0);
        expect(metrics.onTimeRate).toBeNull();
        expect(metrics.reviewCoverage).toBeNull();
        expect(metrics.recentFeedback).toHaveLength(0);
    });
});

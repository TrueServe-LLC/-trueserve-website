/**
 * Cost Analytics Library
 * Provides cost tracking, forecasting, and analysis for TrueServe services
 */

export type ServiceName = 'stripe' | 'supabase' | 'google-cloud' | 'mapbox' | 'resend' | 'vonage';

export interface ServiceCost {
    id: string;
    service: ServiceName;
    month: string; // YYYY-MM format
    cost: number; // in USD
    usageMetric?: string; // e.g., "50M API calls", "100GB storage"
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BudgetAlert {
    id: string;
    service: ServiceName;
    monthlyLimit: number; // in USD
    alertEmail: string;
    alertThreshold: number; // 80 = alert at 80% of budget
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MonthlyCost {
    month: string;
    totalCost: number;
    byService: Record<ServiceName, number>;
}

export interface CostForecast {
    month: string;
    projectedCost: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface CostAnalysis {
    currentMonthCost: number;
    monthlyAverage: number;
    yTDCost: number;
    projectedAnnualCost: number;
    costTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
    topServices: Array<{ service: ServiceName; cost: number; percentage: number }>;
    forecast: CostForecast[];
}

/**
 * Calculate simple linear regression trend for cost forecasting
 */
export function calculateCostTrend(costs: number[]): CostForecast[] {
    if (costs.length < 2) {
        return [];
    }

    // Calculate linear regression
    const n = costs.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = costs.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * costs[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Determine trend
    let trend: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
    if (slope > 50) trend = 'INCREASING';
    else if (slope < -50) trend = 'DECREASING';

    // Project next 3 months
    const forecasts: CostForecast[] = [];
    const currentMonth = new Date();

    for (let i = 1; i <= 3; i++) {
        const futureMonth = new Date(currentMonth);
        futureMonth.setMonth(futureMonth.getMonth() + i);
        const monthStr = futureMonth.toISOString().slice(0, 7);

        const projectedCost = Math.max(0, intercept + slope * (n + i - 1));
        const confidence = i === 1 ? 'HIGH' : i === 2 ? 'MEDIUM' : 'LOW';

        forecasts.push({
            month: monthStr,
            projectedCost: Math.round(projectedCost * 100) / 100,
            confidence: confidence as 'HIGH' | 'MEDIUM' | 'LOW',
            trend,
        });
    }

    return forecasts;
}

/**
 * Calculate comprehensive cost analysis
 */
export function analyzeCosts(monthlyCosts: MonthlyCost[], budgets: BudgetAlert[]): CostAnalysis {
    if (monthlyCosts.length === 0) {
        return {
            currentMonthCost: 0,
            monthlyAverage: 0,
            yTDCost: 0,
            projectedAnnualCost: 0,
            costTrend: 'STABLE',
            topServices: [],
            forecast: [],
        };
    }

    const currentMonthCost = monthlyCosts[monthlyCosts.length - 1]?.totalCost || 0;
    const monthlyAverage = monthlyCosts.reduce((sum, m) => sum + m.totalCost, 0) / monthlyCosts.length;
    const yTDCost = monthlyCosts.reduce((sum, m) => sum + m.totalCost, 0);
    const projectedAnnualCost = monthlyAverage * 12;

    // Determine cost trend
    let costTrend: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
    if (monthlyCosts.length >= 2) {
        const recent = currentMonthCost;
        const previous = monthlyCosts[monthlyCosts.length - 2]?.totalCost || currentMonthCost;
        const percentChange = ((recent - previous) / previous) * 100;
        if (percentChange > 5) costTrend = 'INCREASING';
        else if (percentChange < -5) costTrend = 'DECREASING';
    }

    // Get top services
    const serviceTotal: Record<ServiceName, number> = {
        stripe: 0,
        supabase: 0,
        'google-cloud': 0,
        mapbox: 0,
        resend: 0,
        vonage: 0,
    };

    monthlyCosts.forEach((month) => {
        Object.entries(month.byService).forEach(([service, cost]) => {
            serviceTotal[service as ServiceName] = (serviceTotal[service as ServiceName] || 0) + cost;
        });
    });

    const topServices = Object.entries(serviceTotal)
        .map(([service, cost]) => ({
            service: service as ServiceName,
            cost,
            percentage: (cost / yTDCost) * 100,
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

    // Generate forecast
    const costs = monthlyCosts.map((m) => m.totalCost);
    const forecast = calculateCostTrend(costs);

    return {
        currentMonthCost,
        monthlyAverage,
        yTDCost,
        projectedAnnualCost,
        costTrend,
        topServices,
        forecast,
    };
}

/**
 * Check if any budgets are exceeded
 */
export function checkBudgetAlerts(
    currentCost: number,
    service: ServiceName,
    budgets: BudgetAlert[]
): BudgetAlert | null {
    const budget = budgets.find((b) => b.service === service && b.enabled);
    if (!budget) return null;

    const percentOfBudget = (currentCost / budget.monthlyLimit) * 100;
    if (percentOfBudget >= budget.alertThreshold) {
        return budget;
    }

    return null;
}

/**
 * Get service display name
 */
export function getServiceDisplayName(service: ServiceName): string {
    const displayNames: Record<ServiceName, string> = {
        stripe: 'Stripe Payments',
        supabase: 'Supabase Database',
        'google-cloud': 'Google Cloud',
        mapbox: 'Mapbox Maps',
        resend: 'Resend Email',
        vonage: 'Vonage SMS',
    };
    return displayNames[service] || service;
}

/**
 * Get service icon/color
 */
export function getServiceColor(service: ServiceName): string {
    const colors: Record<ServiceName, string> = {
        stripe: '#635BFF',
        supabase: '#3ECF8E',
        'google-cloud': '#EA4335',
        mapbox: '#357ABD',
        resend: '#000000',
        vonage: '#3D82F6',
    };
    return colors[service] || '#888888';
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(cost);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
    return `${Math.round(value * 10) / 10}%`;
}

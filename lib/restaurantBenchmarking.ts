/**
 * Restaurant Benchmarking Library
 * Calculates restaurant performance metrics relative to peers and network averages
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface BenchmarkComparison {
  restaurantId: string;
  restaurantName: string;
  complianceScore: number;
  percentileRank: number;
  percentileLabel: string;
  networkAverage: number;
  similarRestaurantAverage: number;
  performanceGap: number;
  peerCount: number;
  topPerformers: Array<{
    id: string;
    name: string;
    score: number;
    state: string;
  }>;
}

export interface NetworkBenchmarks {
  state: string;
  averageScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  restaurantCount: number;
  highPerformers: number;
  lowPerformers: number;
  averageGrade: string;
}

export interface PerformanceGap {
  restaurantId: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  improvementPercentage: number;
  areasForImprovement: Array<{
    area: string;
    currentScore: number;
    benchmarkScore: number;
  }>;
}

/**
 * Find restaurants similar to the given restaurant
 * Similarity based on: state, compliance tier, inspection history length
 */
export async function findSimilarRestaurants(
  restaurantId: string,
  limit: number = 50
): Promise<
  Array<{
    id: string;
    name: string;
    complianceScore: number;
    complianceStatus: string;
    state: string;
    createdAt: string;
  }>
> {
  try {
    // Get the restaurant to find similar ones
    const { data: targetRestaurant } = await supabaseAdmin
      .from('Restaurant')
      .select('id, name, complianceScore, complianceStatus, state, createdAt')
      .eq('id', restaurantId)
      .single();

    if (!targetRestaurant) {
      return [];
    }

    // Find similar restaurants in the same state with similar compliance tier
    // Exclude mock/test restaurants and those with no compliance score
    const { data: similarRestaurants } = await supabaseAdmin
      .from('Restaurant')
      .select('id, name, complianceScore, complianceStatus, state, createdAt')
      .eq('state', targetRestaurant.state)
      .eq('isMock', false)
      .neq('id', restaurantId)
      .not('complianceScore', 'is', null)
      .gt('complianceScore', 0)
      .order('complianceScore', { ascending: false })
      .limit(limit);

    if (!similarRestaurants) {
      return [];
    }

    // Filter by similar compliance tier
    const tierGroups: Record<string, number> = {
      FLAGGED: 0,
      FAIL: 20,
      IN_REVIEW: 50,
      PASS: 70,
      NOT_STARTED: 0,
    };

    const targetTierScore = tierGroups[targetRestaurant.complianceStatus] || 50;

    return similarRestaurants.filter((r) => {
      const rTierScore = tierGroups[r.complianceStatus] || 50;
      return Math.abs(rTierScore - targetTierScore) <= 20;
    });
  } catch (error) {
    console.error('[restaurantBenchmarking] Error finding similar restaurants:', error);
    return [];
  }
}

/**
 * Calculate percentile rank for a restaurant within its peer group
 * 0-25: Bottom quartile, 25-50: Below average, 50-75: Above average, 75-100: Top quartile
 */
export async function calculatePercentileRank(
  restaurantId: string
): Promise<{ rank: number; label: string; total: number }> {
  try {
    // Get the restaurant's score
    const { data: restaurant } = await supabaseAdmin
      .from('Restaurant')
      .select('id, complianceScore, state')
      .eq('id', restaurantId)
      .single();

    if (!restaurant) {
      return { rank: 0, label: 'Unknown', total: 0 };
    }

    // Get all real restaurants in the same state with valid scores
    const { data: stateRestaurants } = await supabaseAdmin
      .from('Restaurant')
      .select('id, complianceScore')
      .eq('state', restaurant.state)
      .eq('isMock', false)
      .not('complianceScore', 'is', null)
      .gt('complianceScore', 0);

    if (!stateRestaurants || stateRestaurants.length === 0) {
      return { rank: 50, label: 'Average', total: 1 };
    }

    // Calculate percentile
    const sortedScores = stateRestaurants
      .map((r) => r.complianceScore)
      .sort((a, b) => a - b);

    const targetScore = restaurant.complianceScore;
    const belowCount = sortedScores.filter((s) => s < targetScore).length;
    const percentile = Math.round((belowCount / sortedScores.length) * 100);

    let label = 'Below Average';
    if (percentile >= 75) label = 'Top Performer';
    else if (percentile >= 50) label = 'Above Average';
    else if (percentile >= 25) label = 'Below Average';
    else label = 'Bottom Quartile';

    return { rank: percentile, label, total: sortedScores.length };
  } catch (error) {
    console.error('[restaurantBenchmarking] Error calculating percentile rank:', error);
    return { rank: 0, label: 'Error', total: 0 };
  }
}

/**
 * Get network benchmarks for a specific state
 * Returns aggregated metrics for comparison
 */
export async function getNetworkBenchmarks(
  state: string
): Promise<NetworkBenchmarks | null> {
  try {
    const { data: restaurants } = await supabaseAdmin
      .from('Restaurant')
      .select('id, complianceScore, healthGrade, complianceStatus')
      .eq('state', state)
      .eq('isMock', false)
      .not('complianceScore', 'is', null)
      .gt('complianceScore', 0);

    if (!restaurants || restaurants.length === 0) {
      return null;
    }

    const scores = restaurants.map((r) => r.complianceScore).sort((a, b) => a - b);

    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const medianScore = scores[Math.floor(scores.length / 2)];
    const minScore = scores[0];
    const maxScore = scores[scores.length - 1];

    // Count performance tiers
    const highPerformers = restaurants.filter((r) => r.complianceScore >= 85).length;
    const lowPerformers = restaurants.filter((r) => r.complianceScore < 50).length;

    // Calculate average grade
    const gradeCounts: Record<string, number> = {};
    restaurants.forEach((r) => {
      gradeCounts[r.healthGrade || 'Unknown'] =
        (gradeCounts[r.healthGrade || 'Unknown'] || 0) + 1;
    });

    const mostCommonGrade = Object.keys(gradeCounts).reduce((a, b) =>
      gradeCounts[a] > gradeCounts[b] ? a : b
    );

    return {
      state,
      averageScore,
      medianScore,
      minScore,
      maxScore,
      restaurantCount: restaurants.length,
      highPerformers,
      lowPerformers,
      averageGrade: mostCommonGrade,
    };
  } catch (error) {
    console.error('[restaurantBenchmarking] Error getting network benchmarks:', error);
    return null;
  }
}

/**
 * Get benchmark comparison for a restaurant
 * Shows how it compares to peers and network average
 */
export async function getBenchmarkComparison(
  restaurantId: string
): Promise<BenchmarkComparison | null> {
  try {
    // Get restaurant info
    const { data: restaurant } = await supabaseAdmin
      .from('Restaurant')
      .select('id, name, complianceScore, state')
      .eq('id', restaurantId)
      .single();

    if (!restaurant) {
      return null;
    }

    // Find similar restaurants
    const similarRestaurants = await findSimilarRestaurants(restaurantId);

    // Calculate percentile rank
    const percentileData = await calculatePercentileRank(restaurantId);

    // Get network benchmarks
    const networkBenchmarks = await getNetworkBenchmarks(restaurant.state);

    // Calculate similar restaurant average
    const similarScores = similarRestaurants.map((r) => r.complianceScore);
    const similarAverage =
      similarScores.length > 0
        ? Math.round(similarScores.reduce((a, b) => a + b, 0) / similarScores.length)
        : 0;

    // Get top performers in state — exclude mock/test restaurants, zero scores, and the current restaurant
    const { data: topPerformers } = await supabaseAdmin
      .from('Restaurant')
      .select('id, name, complianceScore, state')
      .eq('state', restaurant.state)
      .eq('isMock', false)
      .neq('id', restaurantId)
      .not('complianceScore', 'is', null)
      .gt('complianceScore', 0)
      .order('complianceScore', { ascending: false })
      .limit(3);

    const performanceGap = restaurant.complianceScore - (similarAverage || 0);

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      complianceScore: restaurant.complianceScore || 0,
      percentileRank: percentileData.rank,
      percentileLabel: percentileData.label,
      networkAverage: networkBenchmarks?.averageScore || 0,
      similarRestaurantAverage: similarAverage,
      performanceGap: performanceGap,
      peerCount: similarRestaurants.length,
      topPerformers: (topPerformers || []).map((r) => ({
        id: r.id,
        name: r.name,
        score: r.complianceScore || 0,
        state: r.state,
      })),
    };
  } catch (error) {
    console.error('[restaurantBenchmarking] Error getting benchmark comparison:', error);
    return null;
  }
}

/**
 * Identify performance gaps and areas for improvement
 */
export async function identifyPerformanceGap(
  restaurantId: string
): Promise<PerformanceGap | null> {
  try {
    const benchmark = await getBenchmarkComparison(restaurantId);

    if (!benchmark) {
      return null;
    }

    const currentScore = benchmark.complianceScore;
    const targetScore = benchmark.similarRestaurantAverage;
    const gap = targetScore - currentScore;
    const improvementPercentage =
      currentScore > 0 ? Math.round((gap / currentScore) * 100) : 0;

    // Identify specific areas for improvement based on violations
    const { data: latestInspection } = await supabaseAdmin
      .from('StateInspectionData')
      .select('violations')
      .eq('restaurantId', restaurantId)
      .order('inspectionDate', { ascending: false })
      .limit(1)
      .single();

    const areasForImprovement: Array<{
      area: string;
      currentScore: number;
      benchmarkScore: number;
    }> = [];

    if (latestInspection && latestInspection.violations) {
      const violations = latestInspection.violations as any[];
      const violationAreas = new Set<string>();

      violations.forEach((v) => {
        const desc = typeof v === 'string' ? v : v.description || '';
        if (desc.toLowerCase().includes('temperature'))
          violationAreas.add('Temperature Control');
        if (desc.toLowerCase().includes('cleaning'))
          violationAreas.add('Cleaning & Sanitation');
        if (desc.toLowerCase().includes('labeling'))
          violationAreas.add('Labeling & Traceability');
        if (desc.toLowerCase().includes('staff') || desc.toLowerCase().includes('training'))
          violationAreas.add('Staff Training');
      });

      violationAreas.forEach((area) => {
        areasForImprovement.push({
          area,
          currentScore: currentScore,
          benchmarkScore: targetScore,
        });
      });
    }

    return {
      restaurantId,
      currentScore,
      targetScore,
      gap: Math.round(gap),
      improvementPercentage,
      areasForImprovement,
    };
  } catch (error) {
    console.error('[restaurantBenchmarking] Error identifying performance gap:', error);
    return null;
  }
}

/**
 * Get top performing restaurants in a state for learning
 */
export async function getBestPerformersInState(
  state: string,
  limit: number = 5
): Promise<
  Array<{
    id: string;
    name: string;
    complianceScore: number;
    healthGrade: string;
  }>
> {
  try {
    const { data: topRestaurants } = await supabaseAdmin
      .from('Restaurant')
      .select('id, name, complianceScore, healthGrade')
      .eq('state', state)
      .eq('complianceStatus', 'PASS')
      .eq('isMock', false)
      .not('complianceScore', 'is', null)
      .gt('complianceScore', 0)
      .order('complianceScore', { ascending: false })
      .limit(limit);

    return topRestaurants || [];
  } catch (error) {
    console.error('[restaurantBenchmarking] Error getting best performers:', error);
    return [];
  }
}

/**
 * Get common improvements that similar restaurants made
 */
export async function getCommonImprovementsInPeerGroup(
  restaurantId: string
): Promise<string[]> {
  try {
    const similarRestaurants = await findSimilarRestaurants(restaurantId, 10);

    if (similarRestaurants.length === 0) {
      return [];
    }

    // Get inspections for similar restaurants and count violation improvements
    const improvementPatterns: Record<string, number> = {};

    for (const similar of similarRestaurants) {
      const { data: inspections } = await supabaseAdmin
        .from('StateInspectionData')
        .select('violations, inspectionDate')
        .eq('restaurantId', similar.id)
        .order('inspectionDate', { ascending: false })
        .limit(2);

      if (inspections && inspections.length >= 2) {
        const previous = inspections[1];
        const recent = inspections[0];

        if (previous && recent) {
          const prevViolations = (previous.violations as any[]) || [];
          const recentViolations = (recent.violations as any[]) || [];

          const corrected = prevViolations.filter(
            (v) =>
              !recentViolations.some(
                (rv) =>
                  (typeof v === 'string' ? v : v.description) ===
                  (typeof rv === 'string' ? rv : rv.description)
              )
          );

          corrected.forEach((v) => {
            const desc = typeof v === 'string' ? v : v.description || '';
            const key =
              desc.toLowerCase().includes('temperature')
                ? 'Temperature Control'
                : desc.toLowerCase().includes('cleaning')
                ? 'Cleaning & Sanitation'
                : desc.toLowerCase().includes('labeling')
                ? 'Labeling'
                : 'General Compliance';

            improvementPatterns[key] = (improvementPatterns[key] || 0) + 1;
          });
        }
      }
    }

    // Return top improvements
    return Object.entries(improvementPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([improvement]) => improvement);
  } catch (error) {
    console.error('[restaurantBenchmarking] Error getting common improvements:', error);
    return [];
  }
}

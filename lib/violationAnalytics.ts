/**
 * Violation Analytics Library
 * Analyzes inspection violations by severity, tracks critical violations,
 * and provides metrics for compliance scoring and alerts
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

export type ViolationSeverity = 'critical' | 'major' | 'minor';

export interface ViolationAggregate {
  id: string;
  restaurantId: string;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  totalViolations: number;
  criticalPercentage: number;
  lastUpdatedAt: string;
}

export interface CriticalViolationAlert {
  id: string;
  restaurantId: string;
  state: string;
  inspectionDate: string;
  violationDescription: string;
  severity: ViolationSeverity;
  alertSentAt: string | null;
  createdAt: string;
}

export interface ViolationTrend {
  date: string;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  totalCount: number;
}

/**
 * Determine violation severity based on violation description and category
 * Maps common health code violations to severity levels
 */
export function determineViolationSeverity(
  violationDescription: string
): ViolationSeverity {
  if (!violationDescription) return 'minor';

  const desc = violationDescription.toLowerCase();

  // Critical violations - food safety hazards
  const criticalPatterns = [
    /temperature|cold chain|hot holding|cooling/i,
    /raw|cross.?contamination|allergen/i,
    /pest|rodent|insect|contamination/i,
    /hepatitis|norovirus|salmonella|e\.?coli|pathogen/i,
    /handwashing|personal hygiene|hair|gloves/i,
    /food source|unsafe source|unapproved source/i,
    /toxic substance|poison|chemical|cleaner|pesticide/i,
  ];

  // Major violations - significant non-compliance
  const majorPatterns = [
    /label|date mark|storage|shelf life/i,
    /equipment.*condition|repair|maintain/i,
    /cleaning|sanitize|hygiene|ventilation/i,
    /records|documentation|monitoring|log/i,
    /employee health|training|certification/i,
  ];

  for (const pattern of criticalPatterns) {
    if (pattern.test(desc)) {
      return 'critical';
    }
  }

  for (const pattern of majorPatterns) {
    if (pattern.test(desc)) {
      return 'major';
    }
  }

  return 'minor';
}

/**
 * Aggregate violations by severity for a restaurant
 * Counts critical, major, and minor violations from latest inspection
 */
export async function aggregateViolationsBySeverity(
  restaurantId: string
): Promise<ViolationAggregate | null> {
  try {
    // Get latest inspection with violations
    const { data: latestInspection } = await supabaseAdmin
      .from('StateInspectionData')
      .select('violations')
      .eq('restaurantId', restaurantId)
      .order('inspectionDate', { ascending: false })
      .limit(1)
      .single();

    if (!latestInspection || !latestInspection.violations) {
      return {
        id: `agg_${restaurantId}`,
        restaurantId,
        criticalCount: 0,
        majorCount: 0,
        minorCount: 0,
        totalViolations: 0,
        criticalPercentage: 0,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    const violations = latestInspection.violations as any[];
    let criticalCount = 0;
    let majorCount = 0;
    let minorCount = 0;

    for (const violation of violations) {
      const severity = determineViolationSeverity(
        violation?.description || violation || ''
      );

      if (severity === 'critical') criticalCount++;
      else if (severity === 'major') majorCount++;
      else minorCount++;
    }

    const totalViolations = violations.length;
    const criticalPercentage =
      totalViolations > 0 ? (criticalCount / totalViolations) * 100 : 0;

    // Upsert aggregation
    const { error } = await supabaseAdmin
      .from('ViolationAggregate')
      .upsert(
        {
          id: `agg_${restaurantId}`,
          restaurantId,
          criticalCount,
          majorCount,
          minorCount,
          totalViolations,
          criticalPercentage: Math.round(criticalPercentage * 100) / 100,
          lastUpdatedAt: new Date().toISOString(),
        },
        { onConflict: 'restaurantId' }
      );

    if (error) {
      console.error('[violationAnalytics] Error upserting aggregate:', error);
      return null;
    }

    return {
      id: `agg_${restaurantId}`,
      restaurantId,
      criticalCount,
      majorCount,
      minorCount,
      totalViolations,
      criticalPercentage: Math.round(criticalPercentage * 100) / 100,
      lastUpdatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[violationAnalytics] Error aggregating violations:', error);
    return null;
  }
}

/**
 * Check if a restaurant has any critical violations
 */
export async function hasCriticalViolations(
  restaurantId: string
): Promise<boolean> {
  try {
    const aggregate = await aggregateViolationsBySeverity(restaurantId);
    return aggregate ? aggregate.criticalCount > 0 : false;
  } catch (error) {
    console.error('[violationAnalytics] Error checking critical violations:', error);
    return false;
  }
}

/**
 * Get violation trend over specified number of days
 * Returns data points for each inspection within the time period
 */
export async function getViolationTrend(
  restaurantId: string,
  days: number = 180
): Promise<ViolationTrend[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: inspections } = await supabaseAdmin
      .from('StateInspectionData')
      .select('inspectionDate, violations')
      .eq('restaurantId', restaurantId)
      .gte('inspectionDate', cutoffDate.toISOString())
      .order('inspectionDate', { ascending: true });

    if (!inspections || inspections.length === 0) {
      return [];
    }

    const trends: ViolationTrend[] = [];

    for (const inspection of inspections) {
      const violations = inspection.violations as any[];
      let criticalCount = 0;
      let majorCount = 0;
      let minorCount = 0;

      for (const violation of violations) {
        const severity = determineViolationSeverity(
          violation?.description || violation || ''
        );

        if (severity === 'critical') criticalCount++;
        else if (severity === 'major') majorCount++;
        else minorCount++;
      }

      trends.push({
        date: new Date(inspection.inspectionDate).toISOString().split('T')[0],
        criticalCount,
        majorCount,
        minorCount,
        totalCount: violations.length,
      });
    }

    return trends;
  } catch (error) {
    console.error('[violationAnalytics] Error getting violation trend:', error);
    return [];
  }
}

/**
 * Calculate impact of violations on compliance score
 * Critical violations have highest impact, reducing score proportionally
 */
export function calculateViolationImpactOnScore(
  baseScore: number,
  aggregate: ViolationAggregate
): number {
  let score = baseScore;

  // Each critical violation: -5 points (max -20)
  score -= Math.min(aggregate.criticalCount * 5, 20);

  // Each major violation: -1 point (max -10)
  score -= Math.min(aggregate.majorCount * 1, 10);

  // Minor violations have minimal impact (-0.5 each, max -5)
  score -= Math.min(aggregate.minorCount * 0.5, 5);

  return Math.max(score, 0); // Minimum score is 0
}

/**
 * Get critical violations from latest inspection
 * Used for alerts and dashboard display
 */
export async function getCriticalViolationsForRestaurant(
  restaurantId: string
): Promise<Array<{ description: string; severity: ViolationSeverity }>> {
  try {
    const { data: latestInspection } = await supabaseAdmin
      .from('StateInspectionData')
      .select('violations')
      .eq('restaurantId', restaurantId)
      .order('inspectionDate', { ascending: false })
      .limit(1)
      .single();

    if (!latestInspection || !latestInspection.violations) {
      return [];
    }

    const violations = latestInspection.violations as any[];
    const criticalViolations = [];

    for (const violation of violations) {
      const desc = violation?.description || violation || '';
      const severity = determineViolationSeverity(desc);

      if (severity === 'critical') {
        criticalViolations.push({
          description: desc,
          severity,
        });
      }
    }

    return criticalViolations;
  } catch (error) {
    console.error('[violationAnalytics] Error getting critical violations:', error);
    return [];
  }
}

/**
 * Log new critical violation alert to database
 */
export async function logCriticalViolationAlert(
  restaurantId: string,
  state: string,
  inspectionDate: string,
  violationDescription: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('CriticalViolationAlert')
      .insert({
        restaurantId,
        state,
        inspectionDate,
        violationDescription,
        severity: determineViolationSeverity(violationDescription),
        createdAt: new Date().toISOString(),
      });

    if (error) {
      console.error('[violationAnalytics] Error logging critical alert:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[violationAnalytics] Error in logCriticalViolationAlert:', error);
    return false;
  }
}

/**
 * Update critical violation alert status
 */
export async function updateCriticalViolationAlertStatus(
  alertId: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('CriticalViolationAlert')
      .update({ alertSentAt: new Date().toISOString() })
      .eq('id', alertId);

    if (error) {
      console.error('[violationAnalytics] Error updating alert status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[violationAnalytics] Error in updateCriticalViolationAlertStatus:', error);
    return false;
  }
}

/**
 * Get all unsent critical violation alerts
 */
export async function getUnsentCriticalViolationAlerts(): Promise<
  Array<{
    id: string;
    restaurantId: string;
    restaurantName: string;
    ownerEmail: string;
    ownerPhone: string;
    state: string;
    inspectionDate: string;
    violationDescription: string;
  }>
> {
  try {
    const { data: alerts, error } = await supabaseAdmin
      .from('CriticalViolationAlert')
      .select(
        `
        id,
        restaurantId,
        state,
        inspectionDate,
        violationDescription,
        Restaurant!inner(id, name, ownerId),
        User!inner(email, phone)
        `
      )
      .is('alertSentAt', null)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('[violationAnalytics] Error fetching unsent alerts:', error);
      return [];
    }

    if (!alerts) {
      return [];
    }

    return alerts.map((alert: any) => ({
      id: alert.id,
      restaurantId: alert.restaurantId,
      restaurantName: alert.Restaurant?.name || 'Unknown',
      ownerEmail: alert.User?.email || '',
      ownerPhone: alert.User?.phone || '',
      state: alert.state,
      inspectionDate: alert.inspectionDate,
      violationDescription: alert.violationDescription,
    }));
  } catch (error) {
    console.error('[violationAnalytics] Error in getUnsentCriticalViolationAlerts:', error);
    return [];
  }
}

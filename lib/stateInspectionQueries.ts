/**
 * Server-side queries for state inspection data
 * Used by merchant compliance portal to display live inspection history
 */

import { createClient } from "@/lib/supabase/server";
import { inspectionCache } from "@/lib/inspectionCache";

export interface InspectionDataWithMetadata {
  inspectionDate: string;
  grade: string | null;
  score: number | null;
  status: string;
  violations: any[];
  sourceAPI: string;
  externalURL: string | null;
  notes: string | null;
}

export interface InspectionMetadata {
  lastSyncedAt: string | null;
  recordCount: number;
  isStale: boolean;
}

/**
 * Get live inspection data for a merchant's restaurant
 * Returns most recent inspections with cache metadata
 */
export async function getRestaurantInspections(
  restaurantId: string,
  state: string
): Promise<{
  inspections: InspectionDataWithMetadata[];
  metadata: InspectionMetadata;
}> {
  try {
    const supabase = await createClient();

    // Check if user owns this restaurant
    const { data: restaurant, error: authError } = await supabase
      .from('Restaurant')
      .select('id, state')
      .eq('id', restaurantId)
      .single();

    if (authError || !restaurant) {
      return {
        inspections: [],
        metadata: {
          lastSyncedAt: null,
          recordCount: 0,
          isStale: true,
        },
      };
    }

    // Fetch inspection data
    const { data, error } = await supabase
      .from('StateInspectionData')
      .select('*')
      .eq('restaurantId', restaurantId)
      .eq('state', state)
      .order('inspectionDate', { ascending: false })
      .limit(20);

    const inspections: InspectionDataWithMetadata[] = (data || []).map((record: any) => ({
      inspectionDate: record.inspectionDate,
      grade: record.grade,
      score: record.score,
      status: record.status,
      violations: record.violations || [],
      sourceAPI: record.sourceAPI,
      externalURL: record.externalURL,
      notes: record.notes,
    }));

    // Get cache metadata
    const metadata = await inspectionCache.getCacheMetadata(restaurantId, state);

    return {
      inspections,
      metadata: {
        lastSyncedAt: metadata.lastSyncedAt?.toISOString() || null,
        recordCount: metadata.recordCount,
        isStale: metadata.isStale,
      },
    };
  } catch (error) {
    console.error('[getRestaurantInspections] Error:', error);
    return {
      inspections: [],
      metadata: {
        lastSyncedAt: null,
        recordCount: 0,
        isStale: true,
      },
    };
  }
}

/**
 * Get all inspection records for a restaurant across all years
 */
export async function getAllRestaurantInspections(
  restaurantId: string
): Promise<InspectionDataWithMetadata[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('StateInspectionData')
      .select('*')
      .eq('restaurantId', restaurantId)
      .order('inspectionDate', { ascending: false })
      .limit(100);

    if (error || !data) {
      return [];
    }

    return data.map((record: any) => ({
      inspectionDate: record.inspectionDate,
      grade: record.grade,
      score: record.score,
      status: record.status,
      violations: record.violations || [],
      sourceAPI: record.sourceAPI,
      externalURL: record.externalURL,
      notes: record.notes,
    }));
  } catch (error) {
    console.error('[getAllRestaurantInspections] Error:', error);
    return [];
  }
}

/**
 * Check if inspection data is available for a state
 */
export async function hasInspectionData(
  restaurantId: string,
  state: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('StateInspectionData')
      .select('id', { count: 'exact' })
      .eq('restaurantId', restaurantId)
      .eq('state', state)
      .limit(1);

    return !error && data && data.length > 0;
  } catch (error) {
    console.error('[hasInspectionData] Error:', error);
    return false;
  }
}

/**
 * Get sync status from StateAPISyncLog
 */
export async function getLatestSyncStatus(state: string): Promise<{
  status: string;
  completedAt: string | null;
  recordsSynced: number;
  errorCount: number;
} | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('StateAPISyncLog')
      .select('status, syncCompletedAt, recordsSynced, errorCount')
      .eq('state', state)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      status: data.status,
      completedAt: data.syncCompletedAt,
      recordsSynced: data.recordsSynced,
      errorCount: data.errorCount,
    };
  } catch (error) {
    console.error('[getLatestSyncStatus] Error:', error);
    return null;
  }
}

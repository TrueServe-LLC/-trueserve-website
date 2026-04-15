/**
 * Inspection Data Cache Layer
 * Handles caching of state inspection data with fallback strategies
 */

import { createClient } from '@supabase/supabase-js';
import { InspectionRecord } from './stateAPIs/baseStateAPI';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export class InspectionCache {
  private ttlSeconds: number;

  constructor(ttlSeconds: number = 86400) {
    // Default 24 hours
    this.ttlSeconds = ttlSeconds;
  }

  /**
   * Get cached inspection data from database
   */
  async getFromCache(
    restaurantId: string,
    state: string
  ): Promise<InspectionRecord[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('StateInspectionData')
        .select('*')
        .eq('restaurantId', restaurantId)
        .eq('state', state)
        .order('inspectionDate', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[InspectionCache] Database read error:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Convert DB records back to InspectionRecord format
      return data.map((record: any) => ({
        externalId: record.externalInspectionId,
        establishmentName: '',
        inspectionDate: new Date(record.inspectionDate),
        violations: record.violations || [],
        score: record.score,
        grade: record.grade,
        status: record.status,
        externalURL: record.externalURL,
        notes: record.notes,
      }));
    } catch (error) {
      console.error('[InspectionCache] Error reading cache:', error);
      return [];
    }
  }

  /**
   * Save inspection data to cache
   */
  async saveToCache(
    restaurantId: string,
    state: string,
    records: InspectionRecord[]
  ): Promise<boolean> {
    try {
      if (!records || records.length === 0) {
        console.warn('[InspectionCache] No records to cache');
        return false;
      }

      const now = new Date();
      const cacheRecords = records.map((record) => ({
        restaurantId,
        state,
        externalInspectionId: record.externalId,
        inspectionDate: record.inspectionDate,
        inspectorName: record.inspectorName || null,
        violations: record.violations,
        score: record.score || null,
        grade: record.grade || null,
        status: record.status,
        notes: record.notes || null,
        sourceAPI: state.toLowerCase(),
        externalURL: record.externalURL || null,
        lastSyncedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }));

      // Upsert: update if exists (by state + externalId), insert if new
      const { error } = await supabaseAdmin
        .from('StateInspectionData')
        .upsert(cacheRecords, {
          onConflict: 'state,externalInspectionId',
        });

      if (error) {
        console.error('[InspectionCache] Database write error:', error);
        return false;
      }

      console.log(
        `[InspectionCache] Cached ${cacheRecords.length} records for ${restaurantId} in ${state}`
      );
      return true;
    } catch (error) {
      console.error('[InspectionCache] Error saving cache:', error);
      return false;
    }
  }

  /**
   * Check if cached data is stale (older than TTL)
   */
  async isStale(restaurantId: string, state: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('StateInspectionData')
        .select('lastSyncedAt')
        .eq('restaurantId', restaurantId)
        .eq('state', state)
        .order('lastSyncedAt', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return true; // No cached data = stale
      }

      const lastSync = new Date(data.lastSyncedAt);
      const now = new Date();
      const ageSeconds = (now.getTime() - lastSync.getTime()) / 1000;

      return ageSeconds > this.ttlSeconds;
    } catch (error) {
      console.error('[InspectionCache] Error checking staleness:', error);
      return true; // Assume stale on error
    }
  }

  /**
   * Get fallback cached data if API fails
   */
  async getFallbackData(
    restaurantId: string,
    state: string
  ): Promise<InspectionRecord[] | null> {
    try {
      const cached = await this.getFromCache(restaurantId, state);

      if (cached && cached.length > 0) {
        console.log(
          `[InspectionCache] Using fallback cached data for ${restaurantId}`
        );
        return cached;
      }

      return null;
    } catch (error) {
      console.error('[InspectionCache] Error getting fallback data:', error);
      return null;
    }
  }

  /**
   * Get cache metadata (for UI display)
   */
  async getCacheMetadata(
    restaurantId: string,
    state: string
  ): Promise<{
    lastSyncedAt: Date | null;
    recordCount: number;
    isStale: boolean;
  }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('StateInspectionData')
        .select('lastSyncedAt')
        .eq('restaurantId', restaurantId)
        .eq('state', state);

      if (error || !data || data.length === 0) {
        return {
          lastSyncedAt: null,
          recordCount: 0,
          isStale: true,
        };
      }

      const lastSync = new Date(
        data[data.length - 1].lastSyncedAt
      );
      const isStale = await this.isStale(restaurantId, state);

      return {
        lastSyncedAt: lastSync,
        recordCount: data.length,
        isStale,
      };
    } catch (error) {
      console.error('[InspectionCache] Error getting metadata:', error);
      return {
        lastSyncedAt: null,
        recordCount: 0,
        isStale: true,
      };
    }
  }

  /**
   * Clear old cache entries (older than 2 years)
   */
  async cleanup(): Promise<number> {
    try {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const { data, error: countError } = await supabaseAdmin
        .from('StateInspectionData')
        .select('id', { count: 'exact' })
        .lt('createdAt', twoYearsAgo.toISOString());

      if (countError) {
        console.error('[InspectionCache] Cleanup count error:', countError);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const ids = data.map((r: any) => r.id);

      const { error: deleteError } = await supabaseAdmin
        .from('StateInspectionData')
        .delete()
        .in('id', ids);

      if (deleteError) {
        console.error('[InspectionCache] Cleanup delete error:', deleteError);
        return 0;
      }

      console.log(`[InspectionCache] Cleaned up ${ids.length} old records`);
      return ids.length;
    } catch (error) {
      console.error('[InspectionCache] Cleanup error:', error);
      return 0;
    }
  }
}

// Singleton instance
export const inspectionCache = new InspectionCache(
  parseInt(process.env.INSPECTION_CACHE_TTL || '86400', 10)
);

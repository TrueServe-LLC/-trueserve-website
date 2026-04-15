/**
 * New York State Department of Health Inspections API
 * Uses public NY Health data portal for inspection data
 */

import { BaseStateAPI, InspectionRecord, EstablishmentMatch, Violation } from './baseStateAPI';

export class NewYorkAPI extends BaseStateAPI {
  // NY Health Department public data endpoint
  private baseUrl = 'https://data.ny.gov/api/3/action/datastore_search';
  // Resource ID for restaurant inspections dataset
  private resourceId = '4ix6-fy5p'; // NY Health Department Inspections dataset

  constructor(apiKey?: string) {
    super('NY', apiKey);
  }

  /**
   * Get inspection history for a New York establishment
   * Note: NY API uses establishment name search, not direct ID lookup
   */
  async getInspections(externalId: string): Promise<InspectionRecord[]> {
    try {
      if (!externalId) {
        console.warn('[NY API] Missing externalId');
        return [];
      }

      // Use externalId as establishment name for NY
      const response = await fetch(
        `${this.baseUrl}?resource_id=${this.resourceId}&q=${encodeURIComponent(
          externalId
        )}&sort=inspection_date desc&limit=100`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.result || !data.result.records) {
        return [];
      }

      return data.result.records
        .map((record: any) => this.parseRecord(record))
        .filter((r): r is InspectionRecord => r !== null);
    } catch (error) {
      this.handleError('getInspections', error);
      return [];
    }
  }

  /**
   * Search for establishments in New York
   */
  async searchEstablishments(query: string): Promise<EstablishmentMatch[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?resource_id=${this.resourceId}&q=${encodeURIComponent(
          query
        )}&limit=50`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.result || !data.result.records) {
        return [];
      }

      // De-duplicate by establishment name
      const unique = new Map<string, any>();
      data.result.records.forEach((r: any) => {
        const name = r.establishment_name || r.name || '';
        if (name && !unique.has(name)) {
          unique.set(name, r);
        }
      });

      return Array.from(unique.values()).map((r: any) => ({
        externalId: r.establishment_name || r.name || '',
        name: r.establishment_name || r.name || '',
        address: r.street || r.address || '',
        city: r.city || '',
        state: 'NY',
      }));
    } catch (error) {
      this.handleError('searchEstablishments', error);
      return [];
    }
  }

  /**
   * Parse a single inspection record from NY API response
   */
  private parseRecord(record: any): InspectionRecord | null {
    try {
      const externalId = record.inspection_id || record.id;
      if (!externalId) {
        return null;
      }

      const inspectionDate = new Date(
        record.inspection_date || record.date || new Date()
      );

      return {
        externalId: String(externalId),
        establishmentName: record.establishment_name || record.name || 'Unknown',
        establishmentAddress: record.street || record.address,
        inspectionDate,
        inspectorName: record.inspector || undefined,
        violations: this.parseViolations(record),
        score: this.parseScore(record.score || record.points),
        grade: this.parseGrade(record.grade || record.rating),
        status: this.mapStatus(record.result || record.status),
        externalURL: this.buildExternalURL(record.establishment_name || ''),
        notes: record.notes || record.comments,
      };
    } catch (error) {
      console.error('[NY API] Failed to parse record:', error);
      return null;
    }
  }

  /**
   * Parse NY-specific violation format
   */
  private parseViolations(record: any): Violation[] {
    const violations: Violation[] = [];

    // NY API may include violation info in the record directly
    if (record.violations) {
      const violationsList = Array.isArray(record.violations)
        ? record.violations
        : record.violations
            .split('|')
            .filter((v: string) => v.trim());

      violationsList.forEach((v: any) => {
        const description = typeof v === 'string' ? v : v.description || '';
        if (description) {
          violations.push({
            code: typeof v === 'string' ? 'VIOLATION' : v.code || 'VIOLATION',
            description,
            severity: this.determineViolationSeverity(description),
          });
        }
      });
    }

    return violations;
  }

  /**
   * Determine violation severity based on description keywords
   */
  private determineViolationSeverity(
    description: string
  ): 'critical' | 'major' | 'minor' {
    const normalized = description.toLowerCase();

    if (
      normalized.includes('critical') ||
      normalized.includes('imminent health hazard') ||
      normalized.includes('temperature') ||
      normalized.includes('pest') ||
      normalized.includes('contamination')
    ) {
      return 'critical';
    }

    if (
      normalized.includes('major') ||
      normalized.includes('core') ||
      normalized.includes('significant')
    ) {
      return 'major';
    }

    return 'minor';
  }

  /**
   * Map NY inspection result to standard format
   */
  private mapStatus(
    result: string
  ): 'PASS' | 'FAIL' | 'CONDITIONAL' {
    const normalized = String(result).toUpperCase();

    if (
      normalized.includes('FAIL') ||
      normalized.includes('NOT MET') ||
      normalized.includes('CLOSE')
    ) {
      return 'FAIL';
    }

    if (
      normalized.includes('CONDITIONAL') ||
      normalized.includes('REOPENED')
    ) {
      return 'CONDITIONAL';
    }

    return 'PASS';
  }

  /**
   * Build external URL to NY Health portal
   */
  private buildExternalURL(establishmentName: string): string {
    if (!establishmentName) return '';
    return `https://profiles.health.ny.gov/home_health/pages/inspections?name=${encodeURIComponent(
      establishmentName
    )}`;
  }
}

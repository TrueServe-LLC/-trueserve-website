/**
 * North Carolina Health Department Food Protection API
 * Uses DHHS Food Protection Program API for inspection data
 */

import { BaseStateAPI, InspectionRecord, EstablishmentMatch, Violation } from './baseStateAPI';

export class NorthCarolinaAPI extends BaseStateAPI {
  private baseUrl = 'https://api.dhhs.nc.gov/food/inspections';

  constructor(apiKey?: string) {
    super('NC', apiKey);
  }

  /**
   * Get inspection history for a North Carolina food establishment
   */
  async getInspections(externalId: string): Promise<InspectionRecord[]> {
    try {
      if (!externalId) {
        console.warn('[NC API] Missing externalId');
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/${encodeURIComponent(externalId)}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': this.apiKey || '',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle various response formats
      const records = Array.isArray(data) ? data : data.inspections || data.records || [];

      return records
        .map((record: any) => this.parseRecord(record))
        .filter((r): r is InspectionRecord => r !== null)
        .sort((a, b) => b.inspectionDate.getTime() - a.inspectionDate.getTime());
    } catch (error) {
      this.handleError('getInspections', error);
      return [];
    }
  }

  /**
   * Search for establishments in North Carolina
   */
  async searchEstablishments(query: string): Promise<EstablishmentMatch[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': this.apiKey || '',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : data.results || [];

      return results.map((r: any) => ({
        externalId: r.id || r.externalId || '',
        name: r.name || r.establishmentName || '',
        address: r.address || r.streetAddress || '',
        city: r.city || '',
        state: 'NC',
      }));
    } catch (error) {
      this.handleError('searchEstablishments', error);
      return [];
    }
  }

  /**
   * Parse a single inspection record from NC API response
   */
  private parseRecord(record: any): InspectionRecord | null {
    try {
      if (!record.id && !record.inspectionId) {
        return null;
      }

      const inspectionDate = new Date(record.inspectionDate || record.date || new Date());

      return {
        externalId: record.id || record.inspectionId || '',
        establishmentName: record.establishmentName || record.name || 'Unknown',
        establishmentAddress: record.address || record.streetAddress,
        inspectionDate,
        inspectorName: record.inspectorName || record.inspector,
        violations: this.parseViolations(record.violations || record.findings),
        score: this.parseScore(record.score || record.points),
        grade: this.parseGrade(record.grade || record.rating),
        status: this.mapStatus(record.status || record.result),
        externalURL: this.buildExternalURL(record.id || ''),
        notes: record.notes || record.comments,
      };
    } catch (error) {
      console.error('[NC API] Failed to parse record:', error);
      return null;
    }
  }

  /**
   * Parse NC-specific violation format
   */
  private parseViolations(rawViolations: any[]): Violation[] {
    if (!Array.isArray(rawViolations)) {
      return [];
    }

    return rawViolations.map((v) => {
      // NC uses codes like 21 NCAC 02H .0208
      const code = v.code || v.violationCode || v.id || 'UNKNOWN';

      // Determine severity based on code or explicit field
      let severity: 'critical' | 'major' | 'minor' = 'minor';

      if (v.severity) {
        severity = this.mapSeverity(v.severity);
      } else if (code.includes('CRITICAL') || code.match(/\.03\d+/)) {
        // NC codes starting with .03 are often critical
        severity = 'critical';
      } else if (code.match(/\.02\d+/)) {
        // NC codes starting with .02 are often major
        severity = 'major';
      }

      return {
        code,
        description: v.description || v.detail || `Violation ${code}`,
        severity,
      };
    });
  }

  /**
   * Map NC inspection status to standard format
   */
  private mapStatus(
    status: string
  ): 'PASS' | 'FAIL' | 'CONDITIONAL' {
    const normalized = String(status).toUpperCase();

    if (
      normalized.includes('FAIL') ||
      normalized.includes('FAILED') ||
      normalized.includes('CLOSE')
    ) {
      return 'FAIL';
    }

    if (
      normalized.includes('CONDITIONAL') ||
      normalized.includes('CONDITIONAL USE')
    ) {
      return 'CONDITIONAL';
    }

    return 'PASS';
  }

  /**
   * Build external URL to NC DHHS portal for this inspection
   */
  private buildExternalURL(externalId: string): string {
    if (!externalId) return '';
    return `https://www.dhhs.nc.gov/food-protection/inspection-record/${externalId}`;
  }
}

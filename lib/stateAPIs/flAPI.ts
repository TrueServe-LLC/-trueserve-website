/**
 * Florida Department of Health Inspections API
 * Uses public AHCA/DOH inspection data portal
 */

import { BaseStateAPI, InspectionRecord, EstablishmentMatch, Violation } from './baseStateAPI';

export class FloridaAPI extends BaseStateAPI {
  // Florida uses county-specific portals, starting with AHCA data
  private baseUrl = 'https://secure.floridahealth.gov/establishment-search/';

  constructor(apiKey?: string) {
    super('FL', apiKey);
  }

  /**
   * Get inspection history for a Florida establishment
   * Note: FL doesn't have a centralized REST API yet
   * This is a placeholder for future API integration
   * For now, we recommend using the hardcoded links in Phase 1
   */
  async getInspections(externalId: string): Promise<InspectionRecord[]> {
    try {
      if (!externalId) {
        console.warn('[FL API] Missing externalId');
        return [];
      }

      // FL API integration in progress
      // TODO: Implement when FL Health Department provides API access
      console.warn(
        '[FL API] Florida API integration pending - contact AHCA for API access'
      );

      // Placeholder: return empty array
      // In production, this would fetch from FL's actual API once available
      return [];
    } catch (error) {
      this.handleError('getInspections', error);
      return [];
    }
  }

  /**
   * Search for establishments in Florida
   */
  async searchEstablishments(query: string): Promise<EstablishmentMatch[]> {
    try {
      // For now, return empty - requires FL API documentation
      console.warn(
        '[FL API] Florida search API pending - contact AHCA for documentation'
      );
      return [];
    } catch (error) {
      this.handleError('searchEstablishments', error);
      return [];
    }
  }

  /**
   * Parse a single inspection record from FL API response
   */
  private parseRecord(record: any): InspectionRecord | null {
    try {
      if (!record.id && !record.inspectionId) {
        return null;
      }

      const inspectionDate = new Date(
        record.inspectionDate || record.date || new Date()
      );

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
      console.error('[FL API] Failed to parse record:', error);
      return null;
    }
  }

  /**
   * Parse FL-specific violation format
   */
  private parseViolations(rawViolations: any[]): Violation[] {
    if (!Array.isArray(rawViolations)) {
      return [];
    }

    return rawViolations.map((v) => ({
      code: v.code || v.violationCode || v.id || 'UNKNOWN',
      description: v.description || v.detail || v.violation || 'Unknown violation',
      severity: this.mapSeverity(v.severity || v.category || 'minor'),
    }));
  }

  /**
   * Map FL inspection status to standard format
   */
  private mapStatus(status: string): 'PASS' | 'FAIL' | 'CONDITIONAL' {
    const normalized = String(status).toUpperCase();

    if (
      normalized.includes('FAIL') ||
      normalized.includes('FAILED') ||
      normalized.includes('OUT OF COMPLIANCE') ||
      normalized.includes('CLOSE')
    ) {
      return 'FAIL';
    }

    if (normalized.includes('CONDITIONAL')) {
      return 'CONDITIONAL';
    }

    return 'PASS';
  }

  /**
   * Build external URL to FL AHCA portal
   */
  private buildExternalURL(externalId: string): string {
    if (!externalId) return '';
    // FL AHCA portal structure
    return `https://secure.floridahealth.gov/establishment-search/?id=${encodeURIComponent(
      externalId
    )}`;
  }
}

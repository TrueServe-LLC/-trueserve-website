/**
 * Base abstraction for state health department inspection APIs
 * Each state (NC, NY, FL, PA) inherits from this and implements state-specific logic
 */

export interface Violation {
  code: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface InspectionRecord {
  externalId: string;
  establishmentName: string;
  establishmentAddress?: string;
  inspectionDate: Date;
  inspectorName?: string;
  violations: Violation[];
  score?: number;
  grade?: string;
  status: 'PASS' | 'FAIL' | 'CONDITIONAL';
  externalURL?: string;
  notes?: string;
}

export interface EstablishmentMatch {
  externalId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
}

export abstract class BaseStateAPI {
  protected state: string;
  protected apiKey: string;

  constructor(state: string, apiKey?: string) {
    this.state = state;
    this.apiKey = apiKey || '';
  }

  /**
   * Get inspection history for an establishment by external ID
   * @param externalId State's unique identifier for the establishment
   * @returns Array of inspection records (most recent first)
   */
  abstract getInspections(externalId: string): Promise<InspectionRecord[]>;

  /**
   * Search for establishments by name or address
   * @param query Search term (name or address)
   * @returns Array of potential matches with external IDs
   */
  abstract searchEstablishments(query: string): Promise<EstablishmentMatch[]>;

  /**
   * Format a date to ISO string for consistency
   */
  protected formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
  }

  /**
   * Normalize violation data to standard format
   */
  protected normalizeViolations(rawViolations: any[]): Violation[] {
    if (!Array.isArray(rawViolations)) {
      return [];
    }

    return rawViolations.map((v) => ({
      code: v.code || v.violationCode || v.id || 'UNKNOWN',
      description: v.description || v.title || v.detail || 'Unknown violation',
      severity: this.mapSeverity(v.severity || v.type || 'minor'),
    }));
  }

  /**
   * Map state-specific severity levels to standard format
   */
  protected mapSeverity(
    severity: string
  ): 'critical' | 'major' | 'minor' {
    const normalized = severity.toLowerCase();

    if (
      normalized.includes('critical') ||
      normalized.includes('fail') ||
      normalized.includes('high') ||
      normalized.includes('imminent')
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
   * Parse grade letter (A, B, C, etc.) and normalize it
   */
  protected parseGrade(grade: string | number | null): string | null {
    if (!grade) return null;

    const normalized = String(grade).toUpperCase().trim().charAt(0);
    if (/^[A-F]$/.test(normalized)) {
      return normalized;
    }

    return null;
  }

  /**
   * Parse score (0-100) and clamp to valid range
   */
  protected parseScore(score: any): number | null {
    const num = Number(score);
    if (isNaN(num)) return null;
    return Math.min(100, Math.max(0, Math.round(num)));
  }

  /**
   * Handle API errors with logging
   */
  protected handleError(
    operation: string,
    error: any
  ): void {
    console.error(`[${this.state} API] ${operation} failed:`, {
      message: error?.message || String(error),
      status: error?.status || error?.statusCode,
      state: this.state,
    });
  }
}

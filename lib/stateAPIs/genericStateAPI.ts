/**
 * Generic State API Template
 * Base class for state-specific API implementations
 * Can be extended or used as-is with configuration for common API patterns
 */

export interface InspectionRecord {
  externalInspectionId: string;
  inspectionDate: string;
  inspectorName?: string;
  violations: Array<{
    description: string;
    severity?: 'critical' | 'major' | 'minor';
    correctionDate?: string;
  }>;
  score?: number;
  grade?: string;
  status: 'PASS' | 'FAIL' | 'CONDITIONAL';
  notes?: string;
  sourceAPI: string;
  externalURL?: string;
}

export interface EstablishmentRecord {
  externalEstablishmentId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  ownerName?: string;
  county?: string;
}

export abstract class BaseStateAPI {
  protected state: string;
  protected apiKey?: string;

  constructor(state: string, apiKey?: string) {
    this.state = state;
    this.apiKey = apiKey;
  }

  /**
   * Fetch inspections for an establishment
   * Must be implemented by subclasses
   */
  abstract getInspections(establishmentId: string): Promise<InspectionRecord[]>;

  /**
   * Search for establishments by name or address
   * Must be implemented by subclasses
   */
  abstract searchEstablishments(query: string): Promise<EstablishmentRecord[]>;

  /**
   * Get a single establishment by ID
   * Optional - default implementation searches
   */
  async getEstablishment(establishmentId: string): Promise<EstablishmentRecord | null> {
    // Default: search by ID in establishment name
    const results = await this.searchEstablishments(establishmentId);
    return results.find((e) => e.externalEstablishmentId === establishmentId) || null;
  }

  /**
   * Parse violations from API response
   * Can be overridden for custom parsing
   */
  protected parseViolations(data: any): Array<{ description: string; severity?: string }> {
    if (Array.isArray(data)) {
      return data.map((v) => ({
        description: typeof v === 'string' ? v : v.description || v.name || JSON.stringify(v),
        severity: v.severity || v.type,
      }));
    }
    return [];
  }

  /**
   * Validate API response
   * Returns true if response is valid, false otherwise
   */
  protected validateResponse(data: any): boolean {
    return data !== null && data !== undefined;
  }

  /**
   * Handle rate limiting
   * Can be overridden for custom rate limit handling
   */
  protected async handleRateLimit(retryAfter?: number): Promise<void> {
    const delay = Math.min(retryAfter || 60, 300); // Max 5 minutes
    return new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }

  /**
   * Make HTTP request with error handling
   */
  protected async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        timeout: 30000,
        ...options,
        headers: {
          'User-Agent': 'TrueServe/1.0',
          ...options.headers,
        },
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        await this.handleRateLimit(retryAfter ? parseInt(retryAfter) : undefined);
        return this.makeRequest(url, options);
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error(`[${this.state}] API Request Error:`, error);
      throw error;
    }
  }
}

/**
 * Generic REST API Implementation
 * Can be used for states with standard REST APIs
 */
export class GenericRestStateAPI extends BaseStateAPI {
  private baseUrl: string;
  private inspectionEndpoint: string;
  private searchEndpoint: string;

  constructor(
    state: string,
    baseUrl: string,
    inspectionEndpoint: string,
    searchEndpoint: string,
    apiKey?: string
  ) {
    super(state, apiKey);
    this.baseUrl = baseUrl;
    this.inspectionEndpoint = inspectionEndpoint;
    this.searchEndpoint = searchEndpoint;
  }

  async getInspections(establishmentId: string): Promise<InspectionRecord[]> {
    try {
      const url = `${this.baseUrl}${this.inspectionEndpoint}`.replace('{id}', establishmentId);
      const headers: Record<string, string> = {};

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await this.makeRequest(url, { headers });

      if (!this.validateResponse(response)) {
        return [];
      }

      // Parse response - implementation may vary by state
      const inspections = Array.isArray(response) ? response : response.data || response.inspections || [];

      return inspections.map((inspection: any) => ({
        externalInspectionId: inspection.id || inspection.inspection_id || '',
        inspectionDate: inspection.date || inspection.inspection_date || new Date().toISOString(),
        inspectorName: inspection.inspector || inspection.inspector_name,
        violations: this.parseViolations(inspection.violations || inspection.violation_items || []),
        score: inspection.score || inspection.points,
        grade: inspection.grade || inspection.rating,
        status: this.parseStatus(inspection.status || inspection.result || 'PASS'),
        notes: inspection.notes || inspection.comments,
        sourceAPI: this.state,
        externalURL: inspection.url || inspection.report_url,
      }));
    } catch (error) {
      console.error(`[${this.state}] Failed to get inspections for ${establishmentId}:`, error);
      return [];
    }
  }

  async searchEstablishments(query: string): Promise<EstablishmentRecord[]> {
    try {
      const url = `${this.baseUrl}${this.searchEndpoint}?q=${encodeURIComponent(query)}`;
      const headers: Record<string, string> = {};

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await this.makeRequest(url, { headers });

      if (!this.validateResponse(response)) {
        return [];
      }

      const results = Array.isArray(response) ? response : response.data || response.results || [];

      return results.map((est: any) => ({
        externalEstablishmentId: est.id || est.establishment_id || '',
        name: est.name || est.business_name || '',
        address: est.address || est.street_address || '',
        city: est.city || '',
        state: est.state || this.state,
        zipCode: est.zip || est.zip_code,
        phone: est.phone || est.phone_number,
        ownerName: est.owner || est.owner_name,
        county: est.county,
      }));
    } catch (error) {
      console.error(`[${this.state}] Failed to search establishments:`, error);
      return [];
    }
  }

  private parseStatus(status: string): 'PASS' | 'FAIL' | 'CONDITIONAL' {
    const normalized = status.toUpperCase();
    if (normalized.includes('FAIL')) return 'FAIL';
    if (normalized.includes('CONDITIONAL') || normalized.includes('CONDITIONAL PASS')) return 'CONDITIONAL';
    return 'PASS';
  }
}

/**
 * Data Portal API Implementation
 * For states that expose data through portals (Socrata, etc.)
 */
export class DataPortalStateAPI extends BaseStateAPI {
  private portalUrl: string;
  private datasetId: string;

  constructor(state: string, portalUrl: string, datasetId: string) {
    super(state);
    this.portalUrl = portalUrl;
    this.datasetId = datasetId;
  }

  async getInspections(establishmentId: string): Promise<InspectionRecord[]> {
    try {
      // Socrata SoQL query
      const query = `SELECT * WHERE establishment_id='${establishmentId}' ORDER BY inspection_date DESC LIMIT 100`;
      const url = `${this.portalUrl}/resource/${this.datasetId}.json?$where=${encodeURIComponent(query)}`;

      const response = await this.makeRequest(url);

      if (!Array.isArray(response)) {
        return [];
      }

      return response.map((record: any) => ({
        externalInspectionId: record.inspection_id || record.id || '',
        inspectionDate: record.inspection_date || new Date().toISOString(),
        inspectorName: record.inspector_name,
        violations: this.parseViolations(record.violations || []),
        score: record.score,
        grade: record.grade,
        status: this.parseStatus(record.status || 'PASS'),
        notes: record.comments,
        sourceAPI: this.state,
        externalURL: record.report_url,
      }));
    } catch (error) {
      console.error(`[${this.state}] Failed to get inspections from data portal:`, error);
      return [];
    }
  }

  async searchEstablishments(query: string): Promise<EstablishmentRecord[]> {
    try {
      const soqlQuery = `SELECT * WHERE contains(business_name, '${query}') LIMIT 50`;
      const url = `${this.portalUrl}/resource/${this.datasetId}.json?$where=${encodeURIComponent(soqlQuery)}`;

      const response = await this.makeRequest(url);

      if (!Array.isArray(response)) {
        return [];
      }

      return response.map((record: any) => ({
        externalEstablishmentId: record.establishment_id || record.id || '',
        name: record.business_name || record.name || '',
        address: record.address || '',
        city: record.city || '',
        state: record.state || this.state,
        zipCode: record.zip_code,
        phone: record.phone,
        ownerName: record.owner_name,
        county: record.county,
      }));
    } catch (error) {
      console.error(`[${this.state}] Failed to search data portal:`, error);
      return [];
    }
  }

  private parseStatus(status: string): 'PASS' | 'FAIL' | 'CONDITIONAL' {
    const normalized = status.toUpperCase();
    if (normalized.includes('FAIL')) return 'FAIL';
    if (normalized.includes('CONDITIONAL')) return 'CONDITIONAL';
    return 'PASS';
  }
}

/**
 * Fallback API - Returns empty results
 * Used for states without public APIs
 * Prompts manual lookup or fallback to hardcoded links
 */
export class FallbackStateAPI extends BaseStateAPI {
  private fallbackUrl: string;

  constructor(state: string, fallbackUrl: string) {
    super(state);
    this.fallbackUrl = fallbackUrl;
  }

  async getInspections(_establishmentId: string): Promise<InspectionRecord[]> {
    // Fallback: no data available
    console.log(
      `[${this.state}] No API available. Please visit: ${this.fallbackUrl}`
    );
    return [];
  }

  async searchEstablishments(_query: string): Promise<EstablishmentRecord[]> {
    // Fallback: no search available
    return [];
  }
}

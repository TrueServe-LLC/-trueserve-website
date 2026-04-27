import { logger } from './logger';

export type HealthInspectionRecord = {
    inspectionId: string;
    restaurantName: string;
    address: string;
    city: string;
    state: string;
    inspectionDate: string;
    score: number; // 0-100
    grade: string; // A, B, C, D
    status: 'PASS' | 'FAIL' | 'CONDITIONAL';
    violations: Array<{ code: string; severity: 'critical' | 'major' | 'minor'; description: string }>;
    sourceUrl?: string;
    inspector?: string;
};

// ---------------------------------------------------------------------------
// NC county codes for the CDPEHS public portal
// https://public.cdpehs.com/NCENVPBL/
// ---------------------------------------------------------------------------
const NC_COUNTY_CODES: Record<string, number> = {
    ALAMANCE: 1, ALEXANDER: 2, ALLEGHANY: 3, ANSON: 4, ASHE: 5,
    AVERY: 6, BEAUFORT: 7, BERTIE: 8, BLADEN: 9, BRUNSWICK: 10,
    BUNCOMBE: 11, BURKE: 12, CABARRUS: 13, CALDWELL: 14, CAMDEN: 15,
    CARTERET: 16, CASWELL: 17, CATAWBA: 18, CHATHAM: 19, CHEROKEE: 20,
    CHOWAN: 21, CLAY: 22, CLEVELAND: 23, COLUMBUS: 24, CRAVEN: 25,
    CUMBERLAND: 26, CURRITUCK: 27, DARE: 28, DAVIDSON: 29, DAVIE: 30,
    DUPLIN: 31, DURHAM: 32, EDGECOMBE: 33, FORSYTH: 34, FRANKLIN: 35,
    GASTON: 36, GATES: 37, GRAHAM: 38, GRANVILLE: 39, GREENE: 40,
    GUILFORD: 41, HALIFAX: 42, HARNETT: 43, HAYWOOD: 44, HENDERSON: 45,
    HERTFORD: 46, HOKE: 47, HYDE: 48, IREDELL: 49, JACKSON: 50,
    JOHNSTON: 51, JONES: 52, LEE: 53, LENOIR: 54, LINCOLN: 55,
    MACON: 56, MADISON: 57, MARTIN: 58, MCDOWELL: 59, MECKLENBURG: 60,
    MITCHELL: 61, MONTGOMERY: 62, MOORE: 63, NASH: 64, NEW_HANOVER: 65,
    NORTHAMPTON: 66, ONSLOW: 67, ORANGE: 68, PAMLICO: 69, PASQUOTANK: 70,
    PENDER: 71, PERQUIMANS: 72, PERSON: 73, PITT: 74, POLK: 75,
    RANDOLPH: 76, RICHMOND: 77, ROBESON: 78, ROCKINGHAM: 79, ROWAN: 80,
    RUTHERFORD: 81, SAMPSON: 82, SCOTLAND: 83, STANLY: 84, STOKES: 85,
    SURRY: 86, SWAIN: 87, TRANSYLVANIA: 88, TYRRELL: 89, UNION: 90,
    VANCE: 91, WAKE: 92, WARREN: 93, WASHINGTON: 94, WATAUGA: 95,
    WAYNE: 96, WILKES: 97, WILSON: 98, YADKIN: 99, YANCEY: 100,
};

// Map common city names → county codes
const NC_CITY_TO_COUNTY: Record<string, number> = {
    // Cumberland County
    fayetteville: 26, hope_mills: 26, spring_lake: 26, fort_bragg: 26,
    // Mecklenburg County
    charlotte: 60, matthews: 60, mint_hill: 60, huntersville: 60, cornelius: 60,
    // Wake County
    raleigh: 92, cary: 92, apex: 92, holly_springs: 92, fuquay_varina: 92,
    // Guilford County
    greensboro: 41, high_point: 41,
    // Forsyth County
    winston_salem: 34, 'winston-salem': 34,
    // Durham County
    durham: 32,
    // Buncombe County
    asheville: 11,
    // New Hanover County
    wilmington: 65,
};

function getNCCountyCode(city: string): number {
    const normalized = city.toLowerCase().replace(/\s+/g, '_');
    return NC_CITY_TO_COUNTY[normalized] ?? NC_CITY_TO_COUNTY[city.toLowerCase()] ?? 26; // default Cumberland
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function scoreToGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

function gradeToScore(grade: string): number {
    const g = String(grade).toUpperCase().trim();
    if (g === 'A') return 95;
    if (g === 'B') return 85;
    if (g === 'C') return 75;
    if (g === 'D') return 65;
    return 55;
}

// ---------------------------------------------------------------------------
// SC DHEC — ArcGIS MapServer (confirmed working, updated daily)
// Service: https://gis.dhec.sc.gov/arcgis/rest/services/health/Food_Grades/MapServer/0
// Coverage: All SC facilities permitted under SC Regulation 61-25
// ---------------------------------------------------------------------------
export async function fetchSCInspections(
    restaurantName: string,
    city: string
): Promise<HealthInspectionRecord[]> {
    try {
        const arcgisBase =
            'https://gis.dhec.sc.gov/arcgis/rest/services/health/Food_Grades/MapServer/0/query';

        // Sanitize inputs for SQL LIKE — escape single quotes
        const safeName = restaurantName.replace(/'/g, "''");
        const safeCity = city.replace(/'/g, "''");

        const namePart = `UPPER(FACILITY_NAME) LIKE UPPER('%${safeName}%')`;
        const cityPart = safeCity ? ` AND UPPER(CITY) LIKE UPPER('%${safeCity}%')` : '';
        const whereClause = namePart + cityPart;

        const params = new URLSearchParams({
            where: whereClause,
            outFields: '*',
            orderByFields: 'INSPECTION_DATE DESC',
            resultRecordCount: '10',
            f: 'json',
        });

        const url = `${arcgisBase}?${params.toString()}`;
        logger.info({ url, restaurantName, city }, '[SC DHEC] Querying ArcGIS MapServer');

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'TrueServe-HealthCompliance/1.0' },
            // 10-second timeout via AbortController
            signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
            logger.warn({ status: response.status, restaurantName }, '[SC DHEC] ArcGIS query failed');
            return [];
        }

        const data = await response.json();

        if (data.error) {
            logger.warn({ error: data.error, restaurantName }, '[SC DHEC] ArcGIS returned error');
            return [];
        }

        if (!data.features || data.features.length === 0) {
            logger.info({ restaurantName, city }, '[SC DHEC] No inspection records found');
            return [];
        }

        logger.info({ count: data.features.length, restaurantName }, '[SC DHEC] Records found');

        return data.features.map((feature: any): HealthInspectionRecord => {
            const a = feature.attributes;

            // ArcGIS stores epoch milliseconds for date fields
            let inspDate: string;
            if (a.INSPECTION_DATE && typeof a.INSPECTION_DATE === 'number') {
                inspDate = new Date(a.INSPECTION_DATE).toISOString();
            } else if (a.INSPECTION_DATE) {
                inspDate = new Date(String(a.INSPECTION_DATE)).toISOString();
            } else {
                inspDate = new Date().toISOString();
            }

            // SC DHEC may store score as 0-100 or percentage-points
            const rawScore = parseFloat(a.SCORE ?? a.TOTAL_SCORE ?? a.INSPECTION_SCORE ?? 0);
            const score = isNaN(rawScore) ? 0 : Math.min(100, Math.max(0, rawScore));

            const rawGrade: string = a.GRADE ?? a.LETTER_GRADE ?? a.INSPECTION_GRADE ?? '';
            const grade = rawGrade.trim() || scoreToGrade(score);

            const status: 'PASS' | 'FAIL' | 'CONDITIONAL' =
                score >= 85 ? 'PASS' : score >= 70 ? 'CONDITIONAL' : 'FAIL';

            // Build violations array from VIOLATIONS or OBSERVATION text if present
            const violations: HealthInspectionRecord['violations'] = [];
            const rawViolations = a.VIOLATIONS ?? a.VIOLATION_TEXT ?? '';
            if (rawViolations) {
                const parts = String(rawViolations).split(/[;|\n]/).filter(Boolean);
                parts.slice(0, 10).forEach((desc, i) => {
                    const d = desc.trim();
                    if (!d) return;
                    violations.push({
                        code: `SC-${i + 1}`,
                        severity: d.toLowerCase().includes('critical') ? 'critical'
                            : d.toLowerCase().includes('major') ? 'major'
                            : 'minor',
                        description: d,
                    });
                });
            }

            return {
                inspectionId: `sc-dhec-${a.OBJECTID ?? a.PERMIT_NUMBER ?? Date.now()}-${inspDate.slice(0, 10)}`,
                restaurantName: a.FACILITY_NAME ?? restaurantName,
                address: a.STREET ?? a.ADDRESS ?? a.LOCATION ?? '',
                city: a.CITY ?? city,
                state: 'SC',
                inspectionDate: inspDate,
                score,
                grade,
                status,
                violations,
                sourceUrl: 'https://apps.dhec.sc.gov/Environment/FoodGrades/',
                inspector: a.INSPECTOR ?? a.INSPECTOR_NAME ?? undefined,
            };
        });
    } catch (error) {
        logger.error({ error, restaurantName, city }, '[SC DHEC] Inspection fetch error');
        return [];
    }
}

// ---------------------------------------------------------------------------
// NC — CDPEHS Public Portal (Environmental Health Services)
// Portal: https://public.cdpehs.com/NCENVPBL/
// Data is county-level; we map city → county code.
// ---------------------------------------------------------------------------
export async function fetchNCInspections(
    restaurantName: string,
    city: string
): Promise<HealthInspectionRecord[]> {
    try {
        const countyCode = getNCCountyCode(city);

        // CDPEHS "Inspection" table page — filterable by establishment name
        const url = new URL(
            'https://public.cdpehs.com/NCENVPBL/INSPECTION/ShowINSPECTIONTablePage.aspx'
        );
        url.searchParams.set('ESTTST_CTY', String(countyCode));
        // EST_ID is not known; filter by name in query string
        // The portal also accepts EST_NAME on the establishment search page
        const estUrl = new URL(
            'https://public.cdpehs.com/NCENVPBL/ESTABLISHMENT/ShowESTABLISHMENTTablePage.aspx'
        );
        estUrl.searchParams.set('ESTTST_CTY', String(countyCode));
        estUrl.searchParams.set('EST_NAME', restaurantName);

        logger.info(
            { url: estUrl.toString(), restaurantName, city, countyCode },
            '[NC CDPEHS] Querying establishment portal'
        );

        const response = await fetch(estUrl.toString(), {
            method: 'GET',
            headers: {
                'User-Agent': 'TrueServe-HealthCompliance/1.0',
                Accept: 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(12_000),
        });

        if (!response.ok) {
            logger.warn(
                { status: response.status, restaurantName, countyCode },
                '[NC CDPEHS] Portal request failed'
            );
            return [];
        }

        const html = await response.text();
        return parseNCCDPEHSHtml(html, restaurantName, city, countyCode);
    } catch (error) {
        logger.error({ error, restaurantName, city }, '[NC CDPEHS] Inspection fetch error');
        return [];
    }
}

/**
 * Parse NC CDPEHS HTML — extract inspection rows from the data table.
 *
 * The portal renders a <table> with columns roughly:
 *   [0] Establishment name
 *   [1] Address
 *   [2] City
 *   [3] Inspection date
 *   [4] Score
 *   [5] Grade
 *   [6] Inspector
 */
function parseNCCDPEHSHtml(
    html: string,
    restaurantName: string,
    city: string,
    countyCode: number
): HealthInspectionRecord[] {
    const records: HealthInspectionRecord[] = [];
    try {
        // Match all <tr> elements containing <td> cells
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        let rowMatch: RegExpExecArray | null;

        while ((rowMatch = rowRegex.exec(html)) !== null) {
            const row = rowMatch[1];
            const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
            const cells: string[] = [];
            let cellMatch: RegExpExecArray | null;

            while ((cellMatch = cellRegex.exec(row)) !== null) {
                const text = cellMatch[1]
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .trim();
                cells.push(text);
            }

            // Need at least 5 columns; skip header/empty rows
            if (cells.length < 5) continue;

            // Name match — fuzzy: row establishment name contains any word from query name
            const rowName = cells[0].toLowerCase();
            const queryWords = restaurantName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
            const nameMatch = queryWords.some(w => rowName.includes(w));
            if (!nameMatch) continue;

            // Try to parse date — look for MM/DD/YYYY or YYYY-MM-DD in any cell
            let inspDate = new Date();
            for (const cell of cells) {
                const mdyMatch = cell.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                const isoMatch = cell.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (mdyMatch) {
                    inspDate = new Date(`${mdyMatch[3]}-${mdyMatch[1].padStart(2, '0')}-${mdyMatch[2].padStart(2, '0')}`);
                    break;
                } else if (isoMatch) {
                    inspDate = new Date(cell.slice(0, 10));
                    break;
                }
            }

            // Score — first number between 0 and 100
            let score = 0;
            for (const cell of cells) {
                const num = parseFloat(cell);
                if (!isNaN(num) && num >= 0 && num <= 100) {
                    score = num;
                    break;
                }
            }

            // Grade — single A-F letter
            let grade = '';
            for (const cell of cells) {
                const g = cell.trim().toUpperCase();
                if (/^[A-F]$/.test(g)) {
                    grade = g;
                    break;
                }
            }
            if (!grade) grade = score > 0 ? scoreToGrade(score) : 'A';
            if (score === 0) score = gradeToScore(grade);

            const status: 'PASS' | 'FAIL' | 'CONDITIONAL' =
                score >= 85 ? 'PASS' : score >= 70 ? 'CONDITIONAL' : 'FAIL';

            records.push({
                inspectionId: `nc-cdpehs-${countyCode}-${inspDate.getTime()}`,
                restaurantName: cells[0] || restaurantName,
                address: cells[1] || '',
                city: cells[2] || city,
                state: 'NC',
                inspectionDate: inspDate.toISOString(),
                score,
                grade,
                status,
                violations: [],
                sourceUrl: `https://public.cdpehs.com/NCENVPBL/ESTABLISHMENT/ShowESTABLISHMENTTablePage.aspx?ESTTST_CTY=${countyCode}`,
                inspector: cells[6] || undefined,
            });

            if (records.length >= 5) break; // cap at 5 most recent
        }

        logger.info({ count: records.length, restaurantName, countyCode }, '[NC CDPEHS] Parsed records');
    } catch (err) {
        logger.warn({ err }, '[NC CDPEHS] HTML parse error');
    }
    return records;
}

// ---------------------------------------------------------------------------
// Router — dispatches to the correct state implementation
// ---------------------------------------------------------------------------
export async function getHealthInspections(
    restaurantName: string,
    city: string,
    state: string
): Promise<HealthInspectionRecord[]> {
    if (!restaurantName || !city || !state) {
        return [];
    }

    const normalized = state.toUpperCase();

    if (normalized === 'SC') {
        return fetchSCInspections(restaurantName, city);
    }

    if (normalized === 'NC') {
        return fetchNCInspections(restaurantName, city);
    }

    logger.warn({ state }, '[HealthInspections] Unsupported state — no inspection API configured');
    return [];
}

// ---------------------------------------------------------------------------
// Calculate compliance score from inspection records
// Weighs recent inspections more heavily
// ---------------------------------------------------------------------------
export function calculateComplianceScore(records: HealthInspectionRecord[]): number {
    if (records.length === 0) return 85; // Default if no records

    const now = Date.now();
    let totalScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const inspectionTime = new Date(record.inspectionDate).getTime();
        const ageInDays = (now - inspectionTime) / (1000 * 60 * 60 * 24);

        // Recency weight: recent = 1.0, old = 0.3
        const recencyWeight = Math.max(0.3, 1.0 - ageInDays / 365);
        const weight = recencyWeight * Math.pow(0.8, i); // Decay for older records

        totalScore += record.score * weight;
        totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 85;
}

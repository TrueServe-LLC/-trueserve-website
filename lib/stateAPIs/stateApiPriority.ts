/**
 * State API Priority List and Configuration
 * Defines which states have public inspection data APIs and their priority for implementation
 *
 * Priority tiers:
 * - High: Public, well-documented APIs available
 * - Medium: APIs exist but require contact/documentation
 * - Low: Limited/no public APIs, may require web scraping or manual lookup
 */

export interface StateAPIConfig {
  state: string;
  stateName: string;
  healthDeptName: string;
  priority: 'high' | 'medium' | 'low';
  apiAvailable: boolean;
  apiType: 'rest' | 'web_scrape' | 'data_portal' | 'none';
  apiUrl?: string;
  requiresAuth: boolean;
  authMethod?: 'api_key' | 'oauth' | 'contact_dept';
  inspectionFrequency: number; // days
  notes?: string;
  implemented: boolean;
}

export const STATE_API_CONFIGS: Record<string, StateAPIConfig> = {
  // Currently Implemented States (Phase 2)
  'NC': {
    state: 'NC',
    stateName: 'North Carolina',
    healthDeptName: 'North Carolina Department of Health and Human Services',
    priority: 'high',
    apiAvailable: true,
    apiType: 'rest',
    apiUrl: 'https://api.dhhs.nc.gov/food',
    requiresAuth: true,
    authMethod: 'api_key',
    inspectionFrequency: 365,
    notes: 'Well-documented API with good data quality',
    implemented: true,
  },
  'NY': {
    state: 'NY',
    stateName: 'New York',
    healthDeptName: 'New York Department of Health',
    priority: 'high',
    apiAvailable: true,
    apiType: 'data_portal',
    apiUrl: 'https://data.ny.gov/api',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'Public data portal, good coverage',
    implemented: true,
  },
  'FL': {
    state: 'FL',
    stateName: 'Florida',
    healthDeptName: 'Florida Department of Health',
    priority: 'high',
    apiAvailable: true,
    apiType: 'rest',
    apiUrl: 'https://myfloridaeh.com/api',
    requiresAuth: true,
    authMethod: 'api_key',
    inspectionFrequency: 365,
    notes: 'AHCA inspection data',
    implemented: true,
  },
  'PA': {
    state: 'PA',
    stateName: 'Pennsylvania',
    healthDeptName: 'Pennsylvania Department of Agriculture',
    priority: 'high',
    apiAvailable: true,
    apiType: 'rest',
    requiresAuth: true,
    authMethod: 'api_key',
    inspectionFrequency: 365,
    notes: 'PA DSHS inspection API',
    implemented: true,
  },

  // High Priority - Ready for Implementation
  'CA': {
    state: 'CA',
    stateName: 'California',
    healthDeptName: 'California Department of Public Health',
    priority: 'high',
    apiAvailable: true,
    apiType: 'data_portal',
    apiUrl: 'https://data.ca.gov',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'Comprehensive state data portal',
    implemented: false,
  },
  'TX': {
    state: 'TX',
    stateName: 'Texas',
    healthDeptName: 'Texas Department of State Health Services',
    priority: 'high',
    apiAvailable: true,
    apiType: 'rest',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'Public REST API',
    implemented: false,
  },
  'IL': {
    state: 'IL',
    stateName: 'Illinois',
    healthDeptName: 'Illinois Department of Public Health',
    priority: 'high',
    apiAvailable: true,
    apiType: 'data_portal',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'DataHub portal with inspection data',
    implemented: false,
  },
  'OH': {
    state: 'OH',
    stateName: 'Ohio',
    healthDeptName: 'Ohio Department of Health and Human Services',
    priority: 'high',
    apiAvailable: true,
    apiType: 'rest',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'Open data initiative',
    implemented: false,
  },
  'MA': {
    state: 'MA',
    stateName: 'Massachusetts',
    healthDeptName: 'Massachusetts Department of Public Health',
    priority: 'high',
    apiAvailable: true,
    apiType: 'data_portal',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'Mass.gov data portal',
    implemented: false,
  },

  // Medium Priority - Contact/Documentation Required
  'TN': {
    state: 'TN',
    stateName: 'Tennessee',
    healthDeptName: 'Tennessee Department of Health',
    priority: 'medium',
    apiAvailable: true,
    apiType: 'rest',
    requiresAuth: true,
    authMethod: 'contact_dept',
    inspectionFrequency: 365,
    notes: 'API available but requires department contact',
    implemented: false,
  },
  'LA': {
    state: 'LA',
    stateName: 'Louisiana',
    healthDeptName: 'Louisiana Department of Health',
    priority: 'medium',
    apiAvailable: true,
    apiType: 'web_scrape',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'May require web scraping',
    implemented: false,
  },
  'MI': {
    state: 'MI',
    stateName: 'Michigan',
    healthDeptName: 'Michigan Department of Health and Human Services',
    priority: 'medium',
    apiAvailable: true,
    apiType: 'data_portal',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'Data available through portal',
    implemented: false,
  },
  'CO': {
    state: 'CO',
    stateName: 'Colorado',
    healthDeptName: 'Colorado Department of Public Health and Environment',
    priority: 'medium',
    apiAvailable: true,
    apiType: 'web_scrape',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'Web scraping or direct contact',
    implemented: false,
  },
  'GA': {
    state: 'GA',
    stateName: 'Georgia',
    healthDeptName: 'Georgia Department of Public Health',
    priority: 'medium',
    apiAvailable: false,
    apiType: 'none',
    requiresAuth: false,
    inspectionFrequency: 365,
    notes: 'Limited public API, contact required',
    implemented: false,
  },

  // Low Priority - Limited/No Public APIs
  'AZ': {
    state: 'AZ',
    stateName: 'Arizona',
    healthDeptName: 'Arizona Department of Health Services',
    priority: 'low',
    apiAvailable: false,
    apiType: 'none',
    requiresAuth: false,
    inspectionFrequency: 365,
    implemented: false,
  },
  'NV': {
    state: 'NV',
    stateName: 'Nevada',
    healthDeptName: 'Nevada Division of Health and Human Services',
    priority: 'low',
    apiAvailable: false,
    apiType: 'none',
    requiresAuth: false,
    inspectionFrequency: 365,
    implemented: false,
  },
  'WA': {
    state: 'WA',
    stateName: 'Washington',
    healthDeptName: 'Washington Department of Health',
    priority: 'low',
    apiAvailable: true,
    apiType: 'web_scrape',
    requiresAuth: false,
    inspectionFrequency: 365,
    implemented: false,
  },
  'OR': {
    state: 'OR',
    stateName: 'Oregon',
    healthDeptName: 'Oregon Health Authority',
    priority: 'low',
    apiAvailable: false,
    apiType: 'none',
    requiresAuth: false,
    inspectionFrequency: 365,
    implemented: false,
  },
  'MO': {
    state: 'MO',
    stateName: 'Missouri',
    healthDeptName: 'Missouri Department of Health and Senior Services',
    priority: 'low',
    apiAvailable: false,
    apiType: 'none',
    requiresAuth: false,
    inspectionFrequency: 365,
    implemented: false,
  },

  // Additional States (Stubs)
  'AL': { state: 'AL', stateName: 'Alabama', healthDeptName: 'Alabama Dept of Public Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'AK': { state: 'AK', stateName: 'Alaska', healthDeptName: 'Alaska Dept of Health and Social Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'AR': { state: 'AR', stateName: 'Arkansas', healthDeptName: 'Arkansas Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'CT': { state: 'CT', stateName: 'Connecticut', healthDeptName: 'Connecticut Public Health Dept', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'DE': { state: 'DE', stateName: 'Delaware', healthDeptName: 'Delaware Div of Public Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'HI': { state: 'HI', stateName: 'Hawaii', healthDeptName: 'Hawaii Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'ID': { state: 'ID', stateName: 'Idaho', healthDeptName: 'Idaho Dept of Health and Welfare', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'IN': { state: 'IN', stateName: 'Indiana', healthDeptName: 'Indiana Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'IA': { state: 'IA', stateName: 'Iowa', healthDeptName: 'Iowa Dept of Public Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'KS': { state: 'KS', stateName: 'Kansas', healthDeptName: 'Kansas Dept of Health and Environment', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'KY': { state: 'KY', stateName: 'Kentucky', healthDeptName: 'Kentucky Dept for Public Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'ME': { state: 'ME', stateName: 'Maine', healthDeptName: 'Maine Dept of Health and Human Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'MD': { state: 'MD', stateName: 'Maryland', healthDeptName: 'Maryland Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'MN': { state: 'MN', stateName: 'Minnesota', healthDeptName: 'Minnesota Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'MS': { state: 'MS', stateName: 'Mississippi', healthDeptName: 'Mississippi Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'MT': { state: 'MT', stateName: 'Montana', healthDeptName: 'Montana Dept of Public Health and Human Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'NE': { state: 'NE', stateName: 'Nebraska', healthDeptName: 'Nebraska Dept of Health and Human Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'NH': { state: 'NH', stateName: 'New Hampshire', healthDeptName: 'New Hampshire Dept of Health and Human Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'NJ': { state: 'NJ', stateName: 'New Jersey', healthDeptName: 'New Jersey Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'NM': { state: 'NM', stateName: 'New Mexico', healthDeptName: 'New Mexico Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'ND': { state: 'ND', stateName: 'North Dakota', healthDeptName: 'North Dakota Dept of Health and Human Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'OK': { state: 'OK', stateName: 'Oklahoma', healthDeptName: 'Oklahoma Dept of Health and Human Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'RI': { state: 'RI', stateName: 'Rhode Island', healthDeptName: 'Rhode Island Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'SC': { state: 'SC', stateName: 'South Carolina', healthDeptName: 'South Carolina Dept of Health and Environmental Control', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'SD': { state: 'SD', stateName: 'South Dakota', healthDeptName: 'South Dakota Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'UT': { state: 'UT', stateName: 'Utah', healthDeptName: 'Utah Dept of Health and Human Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'VT': { state: 'VT', stateName: 'Vermont', healthDeptName: 'Vermont Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'VA': { state: 'VA', stateName: 'Virginia', healthDeptName: 'Virginia Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'WI': { state: 'WI', stateName: 'Wisconsin', healthDeptName: 'Wisconsin Dept of Health Services', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
  'WY': { state: 'WY', stateName: 'Wyoming', healthDeptName: 'Wyoming Dept of Health', priority: 'low', apiAvailable: false, apiType: 'none', requiresAuth: false, inspectionFrequency: 365, implemented: false },
};

/**
 * Get next states to implement based on priority
 */
export function getNextStatesToImplement(limit: number = 5): StateAPIConfig[] {
  return Object.values(STATE_API_CONFIGS)
    .filter((config) => !config.implemented && config.apiAvailable)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, limit);
}

/**
 * Get state API configuration by state code
 */
export function getStateAPIConfig(state: string): StateAPIConfig | undefined {
  return STATE_API_CONFIGS[state.toUpperCase()];
}

/**
 * Get all implemented states
 */
export function getImplementedStates(): StateAPIConfig[] {
  return Object.values(STATE_API_CONFIGS).filter((config) => config.implemented);
}

/**
 * Get all high-priority states
 */
export function getHighPriorityStates(): StateAPIConfig[] {
  return Object.values(STATE_API_CONFIGS)
    .filter((config) => config.priority === 'high' && config.apiAvailable)
    .sort((a, b) => {
      if (a.implemented && !b.implemented) return -1;
      if (!a.implemented && b.implemented) return 1;
      return 0;
    });
}

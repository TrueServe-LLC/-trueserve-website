/**
 * State-specific inspection reports and requirements
 * Maps states to their official health department inspection resources
 */

export const STATE_INSPECTION_REPORTS: Record<string, StateInspectionInfo> = {
  // Northeast
  "CT": {
    state: "Connecticut",
    stateCode: "CT",
    healthDept: "Connecticut Department of Consumer Protection",
    inspectionURL: "https://portal.ct.gov/DEEP/Public-Health/Foodborne-Illness-Outbreaks",
    requirementsURL: "https://portal.ct.gov/DEEP/Public-Health",
    phoneNumber: "(860) 509-7374",
    requirements: ["Food Handler Certification", "Health Inspection Approval", "HACCP Plan"]
  },
  "ME": {
    state: "Maine",
    stateCode: "ME",
    healthDept: "Maine Department of Health and Human Services",
    inspectionURL: "https://www.maine.gov/dhhs/mecdc/environmental-health/food-safety",
    requirementsURL: "https://www.maine.gov/dhhs/mecdc/environmental-health",
    phoneNumber: "(207) 287-8016",
    requirements: ["Food Service License", "Health Inspection", "Employee Training"]
  },
  "NH": {
    state: "New Hampshire",
    stateCode: "NH",
    healthDept: "New Hampshire Department of Health and Human Services",
    inspectionURL: "https://www.dhhs.nh.gov/organization/bureau-of-food-protection",
    requirementsURL: "https://www.dhhs.nh.gov/public-health/food-protection",
    phoneNumber: "(603) 271-4588",
    requirements: ["Food Service License", "Health Certificate", "Inspection Report"]
  },
  "MA": {
    state: "Massachusetts",
    stateCode: "MA",
    healthDept: "Massachusetts Department of Public Health",
    inspectionURL: "https://www.mass.gov/service-details/food-establishment-license",
    requirementsURL: "https://www.mass.gov/guides/food-establishment-license",
    phoneNumber: "(617) 983-6712",
    requirements: ["Food Service License", "Health Department Approval", "Annual Inspection"]
  },
  "VT": {
    state: "Vermont",
    stateCode: "VT",
    healthDept: "Vermont Department of Health",
    inspectionURL: "https://dec.vermont.gov/health-environmental-protection/food-safety",
    requirementsURL: "https://dec.vermont.gov/health-environmental-protection/food-safety/inspections",
    phoneNumber: "(802) 828-2886",
    requirements: ["Food Service Permit", "Health Inspection", "Employee Certification"]
  },
  "RI": {
    state: "Rhode Island",
    stateCode: "RI",
    healthDept: "Rhode Island Department of Health",
    inspectionURL: "https://health.ri.gov/environmental/occupational/foodprotection",
    requirementsURL: "https://health.ri.gov/environmental/occupational",
    phoneNumber: "(401) 222-2751",
    requirements: ["Food Service License", "Health Permit", "Inspection Certificate"]
  },
  "NY": {
    state: "New York",
    stateCode: "NY",
    healthDept: "New York Department of Health",
    inspectionURL: "https://www.health.ny.gov/environmental/public_health_law/food_protection",
    requirementsURL: "https://www.health.ny.gov/environmental/public_health_law/",
    phoneNumber: "(518) 402-7650",
    requirements: ["Food Service License", "Health Department Inspection", "Certified Course"]
  },
  "NJ": {
    state: "New Jersey",
    stateCode: "NJ",
    healthDept: "New Jersey Department of Health",
    inspectionURL: "https://www.nj.gov/health/foodprotection",
    requirementsURL: "https://www.nj.gov/health/foodprotection/establishments.shtml",
    phoneNumber: "(609) 588-3123",
    requirements: ["Food Service License", "Health Inspection", "Training Certification"]
  },
  "PA": {
    state: "Pennsylvania",
    stateCode: "PA",
    healthDept: "Pennsylvania Department of Agriculture",
    inspectionURL: "https://www.agriculture.pa.gov/Business_Education/Food/Pages/default.aspx",
    requirementsURL: "https://www.agriculture.pa.gov/Business_Education/Food/Pages/Operator-Requirements.aspx",
    phoneNumber: "(717) 787-4601",
    requirements: ["Food Service License", "HACCP Training", "Health Inspection"]
  },

  // Southeast
  "VA": {
    state: "Virginia",
    stateCode: "VA",
    healthDept: "Virginia Department of Health",
    inspectionURL: "https://www.deq.virginia.gov/air/food-safety",
    requirementsURL: "https://www.deq.virginia.gov/air/food-safety-regulations",
    phoneNumber: "(804) 786-2128",
    requirements: ["Food Service License", "Health Permit", "Inspection Report"]
  },
  "WV": {
    state: "West Virginia",
    stateCode: "WV",
    healthDept: "West Virginia Department of Health and Human Resources",
    inspectionURL: "https://dhhr.wv.gov/food-safety",
    requirementsURL: "https://dhhr.wv.gov/food-safety/food-service-rules",
    phoneNumber: "(304) 558-2981",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "NC": {
    state: "North Carolina",
    stateCode: "NC",
    healthDept: "NC Dept. of Health & Human Services – Food & Drug Protection",
    inspectionURL: "https://www.ncdhhs.gov/divisions/public-health/food-and-drug-protection-division",
    requirementsURL: "https://www.ncdhhs.gov/divisions/public-health/food-and-drug-protection-division/food-protection/retail-food-program",
    phoneNumber: "(919) 733-3000",
    requirements: ["Food Service License", "County Health Inspection", "Manager Certification"]
  },
  "SC": {
    state: "South Carolina",
    stateCode: "SC",
    healthDept: "SC Dept. of Health & Environmental Control – Food Safety",
    inspectionURL: "https://www.scdhec.gov/food-safety",
    requirementsURL: "https://www.scdhec.gov/food-safety/food-establishments",
    phoneNumber: "(803) 898-3432",
    requirements: ["Food Service License", "Health Department Inspection", "Employee Training"]
  },
  "GA": {
    state: "Georgia",
    stateCode: "GA",
    healthDept: "Georgia Department of Health and Human Services",
    inspectionURL: "https://dph.georgia.gov/environmental-health/food-safety",
    requirementsURL: "https://dph.georgia.gov/environmental-health/food-safety/food-service-rules",
    phoneNumber: "(404) 657-6534",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "FL": {
    state: "Florida",
    stateCode: "FL",
    healthDept: "Florida Department of Business and Professional Regulation",
    inspectionURL: "https://www.myflorida.com/dbpr/food/",
    requirementsURL: "https://www.myflorida.com/dbpr/food/inspections/",
    phoneNumber: "(850) 245-5534",
    requirements: ["Food Service License", "Health Inspection", "Manager Certification"]
  },
  "AL": {
    state: "Alabama",
    stateCode: "AL",
    healthDept: "Alabama Department of Public Health",
    inspectionURL: "https://www.alabamapublichealth.gov/foodsafety/",
    requirementsURL: "https://www.alabamapublichealth.gov/foodsafety/rules.html",
    phoneNumber: "(334) 206-5372",
    requirements: ["Food Service License", "Health Permit", "Inspection"]
  },
  "MS": {
    state: "Mississippi",
    stateCode: "MS",
    healthDept: "Mississippi Department of Health",
    inspectionURL: "https://msdh.ms.gov/msdhsite/_static/14,0,173.html",
    requirementsURL: "https://msdh.ms.gov/msdhsite/_static/14,0,173.html",
    phoneNumber: "(601) 576-7659",
    requirements: ["Food Service License", "Health Inspection", "Training"]
  },
  "LA": {
    state: "Louisiana",
    stateCode: "LA",
    healthDept: "Louisiana Department of Health",
    inspectionURL: "https://www.ldh.la.gov/index.cfm/page/1649",
    requirementsURL: "https://www.ldh.la.gov/index.cfm/page/1649",
    phoneNumber: "(225) 342-6757",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "TX": {
    state: "Texas",
    stateCode: "TX",
    healthDept: "Texas Health and Human Services",
    inspectionURL: "https://www.dshs.texas.gov/foodandwater/food/",
    requirementsURL: "https://www.dshs.texas.gov/foodandwater/food/inspection/",
    phoneNumber: "(512) 776-7111",
    requirements: ["Food Service License", "Health Inspection", "Manager Training"]
  },

  // Midwest
  "OH": {
    state: "Ohio",
    stateCode: "OH",
    healthDept: "Ohio Department of Health",
    inspectionURL: "https://odh.ohio.gov/know-our-programs/food-safety/welcome",
    requirementsURL: "https://odh.ohio.gov/know-our-programs/food-safety/food-service-requirements",
    phoneNumber: "(614) 644-7797",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "IN": {
    state: "Indiana",
    stateCode: "IN",
    healthDept: "Indiana Department of Health",
    inspectionURL: "https://www.in.gov/health/food-safety/",
    requirementsURL: "https://www.in.gov/health/food-safety/rules-and-regulations/",
    phoneNumber: "(317) 234-1830",
    requirements: ["Food Service License", "Health Permit", "Inspection"]
  },
  "IL": {
    state: "Illinois",
    stateCode: "IL",
    healthDept: "Illinois Department of Public Health",
    inspectionURL: "https://www.dph.illinois.gov/content/dam/soi/en/web/idph/topics-services/food-drugs-daycares/food/index",
    requirementsURL: "https://www.dph.illinois.gov/content/dam/soi/en/web/idph/topics-services/food-drugs-daycares/food",
    phoneNumber: "(217) 782-4977",
    requirements: ["Food Service License", "Health Inspection", "Training"]
  },
  "MI": {
    state: "Michigan",
    stateCode: "MI",
    healthDept: "Michigan Department of Agriculture and Rural Development",
    inspectionURL: "https://www.michigan.gov/mdard/divisions/food-safety",
    requirementsURL: "https://www.michigan.gov/mdard/divisions/food-safety/food-service-rules",
    phoneNumber: "(517) 373-1060",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "WI": {
    state: "Wisconsin",
    stateCode: "WI",
    healthDept: "Wisconsin Department of Health Services",
    inspectionURL: "https://dsps.wi.gov/industry/health/food/",
    requirementsURL: "https://dsps.wi.gov/industry/health/food/licensing/",
    phoneNumber: "(608) 266-2112",
    requirements: ["Food Service License", "Health Permit", "Inspection"]
  },
  "MN": {
    state: "Minnesota",
    stateCode: "MN",
    healthDept: "Minnesota Department of Health",
    inspectionURL: "https://www.health.state.mn.us/communities/environment/food/",
    requirementsURL: "https://www.health.state.mn.us/communities/environment/food/licensing/",
    phoneNumber: "(651) 201-5815",
    requirements: ["Food Service License", "Health Inspection", "Training"]
  },
  "MO": {
    state: "Missouri",
    stateCode: "MO",
    healthDept: "Missouri Department of Health and Senior Services",
    inspectionURL: "https://health.mo.gov/living/healthcondiseases/communicable/foodborne/",
    requirementsURL: "https://health.mo.gov/living/healthcondiseases/communicable/foodborne/",
    phoneNumber: "(573) 751-6400",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "IA": {
    state: "Iowa",
    stateCode: "IA",
    healthDept: "Iowa Department of Inspections and Appeals",
    inspectionURL: "https://dia.iowa.gov/food-and-consumer-safety",
    requirementsURL: "https://dia.iowa.gov/food-and-consumer-safety/food-service",
    phoneNumber: "(515) 725-0368",
    requirements: ["Food Service License", "Health Inspection", "Training"]
  },

  // West
  "CO": {
    state: "Colorado",
    stateCode: "CO",
    healthDept: "Colorado Department of Public Health and Environment",
    inspectionURL: "https://cdphe.colorado.gov/wqd/food-safety",
    requirementsURL: "https://cdphe.colorado.gov/wqd/food-safety/licensing",
    phoneNumber: "(303) 692-2700",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "CA": {
    state: "California",
    stateCode: "CA",
    healthDept: "California Department of Public Health",
    inspectionURL: "https://www.cdph.ca.gov/Programs/CID/DCDC/Pages/Environmental-Health/Food-Safety-Program.aspx",
    requirementsURL: "https://www.cdph.ca.gov/Programs/CID/DCDC/Pages/Environmental-Health/Food-Safety-Program.aspx",
    phoneNumber: "(916) 558-1784",
    requirements: ["Food Service License", "Health Inspection", "Manager Certification"]
  },
  "WA": {
    state: "Washington",
    stateCode: "WA",
    healthDept: "Washington Department of Health",
    inspectionURL: "https://doh.wa.gov/public-health-healthcare-providers/food-safety-standards-outreach",
    requirementsURL: "https://doh.wa.gov/public-health-healthcare-providers/food-safety-standards-outreach/food-service-requirements",
    phoneNumber: "(206) 418-5500",
    requirements: ["Food Service License", "Health Inspection", "Training"]
  },
  "OR": {
    state: "Oregon",
    stateCode: "OR",
    healthDept: "Oregon Health Authority",
    inspectionURL: "https://www.oregon.gov/deq/aq/Pages/index.aspx",
    requirementsURL: "https://www.oregon.gov/deq/aq/Pages/index.aspx",
    phoneNumber: "(971) 673-1111",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "NV": {
    state: "Nevada",
    stateCode: "NV",
    healthDept: "Nevada Division of Environmental Protection",
    inspectionURL: "https://ndep.nv.gov/air/permitting/food-and-agriculture",
    requirementsURL: "https://ndep.nv.gov/air/permitting/food-and-agriculture",
    phoneNumber: "(775) 687-7750",
    requirements: ["Food Service License", "Health Inspection", "Training"]
  },
  "UT": {
    state: "Utah",
    stateCode: "UT",
    healthDept: "Utah Department of Health and Human Services",
    inspectionURL: "https://epht.health.utah.gov/foodborne-illness-outbreaks/",
    requirementsURL: "https://epht.health.utah.gov/foodborne-illness-outbreaks/",
    phoneNumber: "(801) 538-9003",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
  "AZ": {
    state: "Arizona",
    stateCode: "AZ",
    healthDept: "Arizona Department of Health Services",
    inspectionURL: "https://housing.az.gov/documents-links/health-code-documents",
    requirementsURL: "https://housing.az.gov/documents-links/health-code-documents",
    phoneNumber: "(602) 364-1808",
    requirements: ["Food Service License", "Health Inspection", "Training"]
  },
  "NM": {
    state: "New Mexico",
    stateCode: "NM",
    healthDept: "New Mexico Environment Department",
    inspectionURL: "https://www.env.nm.gov/occupational-health-safety/food-safety/",
    requirementsURL: "https://www.env.nm.gov/occupational-health-safety/food-safety/",
    phoneNumber: "(505) 827-2850",
    requirements: ["Food Service License", "Health Inspection", "Certification"]
  },
};

export interface StateInspectionInfo {
  state: string;
  stateCode: string;
  healthDept: string;
  inspectionURL: string;
  requirementsURL: string;
  phoneNumber: string;
  requirements: string[];
}

export function getStateInspectionInfo(stateCode: string): StateInspectionInfo | null {
  return STATE_INSPECTION_REPORTS[stateCode.toUpperCase()] || null;
}

export function getAllStates(): StateInspectionInfo[] {
  return Object.values(STATE_INSPECTION_REPORTS).sort((a, b) => a.state.localeCompare(b.state));
}

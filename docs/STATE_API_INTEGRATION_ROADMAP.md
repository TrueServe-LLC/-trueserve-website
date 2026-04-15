# State Health Department API Integration Roadmap

**Status:** Future Enhancement  
**Priority:** Medium  
**Timeline:** Post-MVP (After Initial Launch)

---

## Overview

This document outlines the strategy for integrating real-time state health department inspection data APIs into the TrueServe merchant compliance portal.

**Current State (MVP):**
- ✅ Static links to state health department inspection report portals
- ✅ State-specific compliance requirements hardcoded
- ✅ Working for merchant presentations and basic compliance tracking

**Future State (Phase 2):**
- Real-time inspection data from state APIs
- Automated compliance alerts
- Historical inspection data display
- Comparative compliance metrics

---

## Research Findings

### States with Public APIs

#### **Tier 1: Well-Documented APIs**

**1. North Carolina (NC) - DHHS**
- **API:** NC DHHS Food Protection API
- **Documentation:** https://www.dhhs.nc.gov/about/divisions/public-health/food-protection-program
- **Data Available:** 
  - Inspection dates & results
  - Violations by severity
  - Establishment info
- **Authentication:** API Key-based
- **Rate Limits:** Standard (likely 1000 req/day)
- **Contact:** food.protection@dhhs.nc.gov
- **Status:** ✅ Recommended for first integration

**2. New York (NY) - Department of Health**
- **API:** Health Department Inspections API
- **Portal:** https://profiles.health.ny.gov/home_health/pages/inspections
- **Data Available:**
  - Inspection results
  - Violation details
  - Grade history
- **Format:** REST API (JSON)
- **Documentation:** Limited but available
- **Status:** ⚠️ Good candidate (requires verification)

**3. Florida (FL) - Department of Health**
- **API:** Florida Health Inspections Data
- **Portal:** https://www.floridahealth.gov/statistics-and-data/eh-tracking-and-reporting/index.html
- **Data Available:**
  - Inspection reports
  - Violation codes
  - Historical data
- **Status:** ⚠️ Research needed

**4. Pennsylvania (PA) - Department of Agriculture**
- **API:** PA Retail Food Inspection Reports API
- **Portal:** https://www.pa.gov/agencies/pda/food/food-safety/retail-food-inspection-reports
- **Data Available:**
  - Establishment inspections
  - Violation history
- **Status:** ⚠️ Under investigation

#### **Tier 2: Limited/Emerging APIs**

**5. Michigan (MI)**
- **System:** MI-SAFE Online
- **URL:** https://www2.mda.state.mi.us/MiSafe/Default
- **Status:** 🔄 Possible data scraping approach

**6. Texas (TX)**
- **System:** DSHS Food Safety
- **Contact:** Food.Safety@dshs.texas.gov
- **Status:** 🔄 Direct API inquiry needed

**7. California (CA)**
- **System:** County-level APIs (varies)
- **Challenge:** No state-wide API (50+ counties)
- **Status:** ❌ Complex - County-by-county integration

#### **Tier 3: No Public APIs (State Websites Only)**

These states don't offer public APIs. We'd need to either:
1. Contact health department for custom API access
2. Use web scraping (not ideal)
3. Maintain manual data updates

States in this category: Alabama, Arizona, Connecticut, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, Ohio, Oklahoma, Oregon, Rhode Island, South Carolina, Tennessee, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming

---

## Implementation Strategy

### **Phase 1: Research & Validation** (2-3 weeks)

**Week 1: API Availability Research**
```
For each state (starting with Tier 1):
1. Contact health department
2. Request API documentation
3. Verify data freshness & accuracy
4. Check rate limits & licensing requirements
5. Document findings
```

**Week 2: Pilot Integration**
```
Select ONE state (recommend: North Carolina)
1. Get API credentials
2. Build basic integration
3. Test data accuracy
4. Document response formats
5. Plan error handling
```

**Week 3: Design System**
```
1. Design unified data model (abstracting state differences)
2. Plan caching strategy
3. Design error handling
4. Plan monitoring & alerts
```

---

### **Phase 2: Development** (4-6 weeks)

**Backend Development:**
```typescript
// Create abstraction layer for state APIs
/lib/stateAPIs/
  ├── baseStateAPI.ts (abstract base class)
  ├── nc.ts (North Carolina implementation)
  ├── ny.ts (New York implementation)
  ├── fl.ts (Florida implementation)
  └── pa.ts (Pennsylvania implementation)

// Create cache layer
/lib/inspectionCache.ts
  - Redis/database caching
  - TTL strategy per state
  - Fallback to manual data

// Create sync worker
/app/api/cron/sync-inspections.ts
  - Daily sync from each state API
  - Handle errors gracefully
  - Log failures for monitoring
```

**Database Schema Updates:**
```sql
-- Store real inspection data
CREATE TABLE StateInspectionData (
  id UUID PRIMARY KEY,
  restaurantId UUID REFERENCES Restaurant(id),
  state VARCHAR(2),
  inspectionDate DATE,
  inspectorName VARCHAR(255),
  violations JSONB,
  score INT,
  grade VARCHAR(1),
  notes TEXT,
  sourceAPI VARCHAR(50),
  lastSyncedAt TIMESTAMP,
  externalInspectionId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Track API sync status
CREATE TABLE StateAPISyncLog (
  id UUID PRIMARY KEY,
  state VARCHAR(2),
  syncStartedAt TIMESTAMP,
  syncCompletedAt TIMESTAMP,
  recordsSynced INT,
  errorCount INT,
  status VARCHAR(50), -- success, partial, failed
  errorDetails JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

**Frontend Updates:**
```typescript
// Update MerchantComplianceClient.tsx
- Add real data toggle (API vs hardcoded)
- Display "Last synced" timestamp
- Show inspection details from API
- Add manual refresh button
- Handle API errors gracefully
```

---

### **Phase 3: Rollout** (2-3 weeks)

**State-by-State Rollout:**
1. Start with North Carolina (highest confidence)
2. Add New York (if API works)
3. Add Florida (if approved)
4. Add Pennsylvania (if available)
5. Continue with Tier 2 states

**Monitoring:**
- Track API health & uptime
- Monitor data accuracy
- Alert on sync failures
- Log all API calls

---

## Contact Information for State APIs

### **How to Request API Access**

**Template Email:**
```
Subject: API Access Request - Food Establishment Inspection Data

Dear [State Health Department],

We are developing a compliance management platform for food service merchants 
and would like to request API access to your state's food establishment 
inspection data.

Requesting:
- Inspection history by establishment
- Violation details
- Inspection scores/grades
- Establishment information

Use Case:
- Help merchants track compliance requirements
- Display inspection history to restaurant owners
- Provide compliance alerts

Would you be able to provide:
1. API documentation
2. API credentials/keys
3. Rate limits & SLA
4. Data licensing agreement

Thank you for your time.

Best regards,
[Your Name]
TrueServe Platform
contact@trueserve.delivery
```

---

## Expected Benefits

### **For Merchants:**
- Real-time inspection status
- Historical inspection data
- Violation tracking & resolution
- Compliance alerts before issues arise
- Competitive comparison (anonymized)

### **For TrueServe:**
- Differentiation vs competitors
- Better compliance risk assessment
- Proactive alerts (compliance issues)
- Reduced liability
- Data for analytics & insights

### **Risk Mitigation:**
- Better driver/merchant vetting
- Early warning of compliance issues
- Demonstration of due diligence

---

## Technical Considerations

### **Error Handling:**
```typescript
// What if API is down?
try {
  const data = await fetchStateAPI(state);
  cacheData(data);
  return data;
} catch (error) {
  // Fall back to cached data
  const cached = getCachedData(state);
  if (cached) return cached;
  
  // If no cache, show last known data with warning
  return {
    data: lastKnownData,
    warning: "Using cached data from [date]. Real-time data unavailable."
  };
}
```

### **Rate Limiting:**
- Most state APIs have 1,000-10,000 req/day limits
- Strategy: Batch daily syncs, cache aggressively
- Sync at 3 AM UTC to spread load

### **Data Privacy:**
- Handle inspection data securely
- Only show to authorized merchants (their own restaurant)
- Comply with FOIA restrictions
- Document data handling procedures

---

## Estimated Effort & Cost

| Phase | Effort | Cost | Timeline |
|-------|--------|------|----------|
| Research | 40 hours | $0 | 2-3 weeks |
| Development | 120 hours | $0 | 4-6 weeks |
| Testing | 40 hours | $0 | 1-2 weeks |
| Rollout | 20 hours | $0 | 2-3 weeks |
| **Total** | **220 hours** | **$0** | **~3 months** |

**No licensing costs** - all state APIs should be free public data.

---

## Success Metrics

**Phase 1 Complete:**
- ✅ 5+ states with confirmed API availability
- ✅ API documentation collected
- ✅ Contact information for health departments

**Phase 2 Complete:**
- ✅ At least 1 state API fully integrated
- ✅ Real-time data syncing working
- ✅ Data accuracy verified

**Phase 3 Complete:**
- ✅ 5+ states integrated
- ✅ 99% sync success rate
- ✅ < 4 hour sync latency
- ✅ Merchant feedback positive

---

## Future Enhancements

### **Post-Integration:**
1. **Predictive Compliance:** Use historical data to predict violations
2. **Benchmarking:** Compare restaurant compliance vs peers
3. **Alerts:** Real-time alerts when inspection scores change
4. **Recommendations:** Suggest improvements based on violations
5. **Integration:** Pull inspection data into driver vetting

### **Advanced Features:**
- Machine learning on violation patterns
- Seasonal compliance trends
- Violation severity scoring
- Compliance improvement suggestions

---

## Next Steps

### **Immediate (This Month):**
1. ✅ Keep current hardcoded implementation (working great!)
2. 📝 Document this roadmap (DONE)
3. 📧 Send API inquiry emails to top 5 states
4. 📋 Create tracking spreadsheet for responses

### **Short-term (Next 2 Months):**
1. Analyze responses from state health departments
2. Select 1-2 states for pilot integration
3. Begin Phase 1 development

### **Medium-term (3-6 Months):**
1. Complete Phase 2 development
2. Test with beta merchants
3. Roll out incrementally

---

## Resources & References

- **AFDO Inspection Reports:** https://www.afdo.org/resources/online-inspection-reports/
- **FDA Food Code:** https://www.fda.gov/food/food-code
- **State Health Department Contacts:** [List maintained in separate document]
- **Sample State APIs:**
  - NC: https://www.dhhs.nc.gov/about/divisions/public-health/food-protection-program
  - NY: https://profiles.health.ny.gov/home_health/pages/inspections
  - FL: https://www.floridahealth.gov/statistics-and-data/eh-tracking-and-reporting/index.html

---

## Questions & Decisions Needed

- [ ] Should we prioritize specific states first?
- [ ] What's acceptable data freshness? (Daily? Weekly?)
- [ ] Should we show inspection data from API or only links?
- [ ] How do we handle states without APIs?
- [ ] Budget for any paid API services if state APIs unavailable?

---

**Document Status:** Ready for Research Phase  
**Last Updated:** April 14, 2026  
**Next Review:** After API inquiry responses received

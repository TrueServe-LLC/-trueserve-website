# Regional Merchant & Payment Strategy

Expanding geographically requires more than just server clusters. We must adapt our business logic to handle regional variations in merchant types, taxes, and labor laws.

## 🏪 Regional Merchant Profiles

As we move West, we anticipate a shift in merchant categories and operational requirements.

| Category | East Coast (Current) | West Coast (Expansion) |
| :--- | :--- | :--- |
| **Primary Cuisines** | Soul Food, Italian, Seafood | Health-Focused, Fusion, Vegan |
| **Delivery Density** | Highly urban (NYC/Philly/Atlanta) | Suburban Sprawl (LA/Bay Area) |
| **Vehicle Types** | E-bikes and Small Sedans | Large Sedans and SUVs |
| **Peak Hours** | 6 PM - 9 PM | 7 PM - 10 PM (Later dining habits) |

### Regional Logic Overrides
We will implement a `RegionConfig` service in our Next.js app to handle these variations:
- **Default Delivery Radius**: 3 miles (East) vs 6 miles (West).
- **Service Fees**: Adjusted based on regional cost of operations.

---

## 💳 Payment & Tax Strategy (Stripe)

Each state has unique tax requirements and labor laws that affect our payment flow.

### 1. State-Specific Taxation
- **Nexus Management**: We must track sales tax for California vs. Pennsylvania.
- **Implementation**: We use **Stripe Tax** to automatically calculate the correct sales tax based on the merchant's physical address.

### 2. Labor Law Adaptations (e.g., Prop 22)
California has specific requirements for independent contractor pay (guaranteed minimum earnings, healthcare subsidies).
- **Action**: Our payment logic must calculate "Earnings Floors" for California-based drivers.
- **K8s Implementation**: We will use **Regional Edge Config** to flag these rules at the load balancer level, ensuring the correct "Driver Pay Engine" is used based on geography.

### 3. Regional Payouts
- **Settlement**: We will maintain a unified Stripe account but segment payouts by "Region ID" to simplify accounting and regional performance tracking.

---

## 🛠️ Technical Implementation: "The Region Hook"

In the code, we will move away from global constants and use geography-aware hooks:

```typescript
const { regionSettings } = useRegion();

// Example: Get regional tax rate
const currentTax = regionSettings.taxRate; 

// Example: Check for specific labor law requirements
const isProp22Active = regionSettings.features.guaranteedMinPay;
```

---
#tags/strategy #payments #merchants #expansion #california #prop22

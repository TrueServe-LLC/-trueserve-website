"use client";

import { useState } from "react";

type PosSystem = "Toast" | "Square" | "Clover" | "Lightspeed" | "Revel";

interface Step {
  step: string;
  detail: string;
  link?: string;
  linkLabel?: string;
}

const PARTNERSHIP_GUIDES: Record<PosSystem, {
  icon: string;
  color: string;
  bg: string;
  border: string;
  partnershipName: string;
  summary: string;
  trueserveSteps: Step[];
  merchantSteps: Step[];
  estimatedTime: string;
  recommended?: string;
}> = {
  Toast: {
    icon: "🍞",
    color: "#f97316",
    bg: "rgba(249,115,22,0.06)",
    border: "rgba(249,115,22,0.2)",
    partnershipName: "Toast Partner Network (via Aggregator)",
    summary: "Toast requires all ordering channels to go through their official partner network. The fastest path is via an aggregator (ItsaCheckmate, Chowly, or Otter) — they're already Toast-certified and handle the KDS injection for you.",
    estimatedTime: "1–2 weeks",
    recommended: "ItsaCheckmate",
    trueserveSteps: [
      {
        step: "Apply as an Ordering Channel Partner",
        detail: "Contact ItsaCheckmate's partnership team and describe TrueServe as a delivery ordering channel. They will provision a partner API key and sandbox environment for you.",
        link: "https://www.itsacheckmate.com",
        linkLabel: "ItsaCheckmate Partners →",
      },
      {
        step: "Implement the order push endpoint",
        detail: "POST to https://api.itsacheckmate.com/v1/orders with your partner key in the Authorization header and the restaurant's locationId in the body. Include order items, subtotal, tax, tip, customer name/phone, and delivery address.",
      },
      {
        step: "Map your order schema to their format",
        detail: "ItsaCheckmate expects: locationId, externalOrderId, items (with POS item IDs), subtotal, tax, tip, customer name/phone, and delivery address. Your existing Order + OrderItem schema maps directly.",
      },
      {
        step: "Test in sandbox",
        detail: "ItsaCheckmate provides a sandbox environment. Run 5–10 test orders through to verify they appear on the Toast KDS simulator before going live.",
      },
      {
        step: "Go live with Dhans Kitchen first",
        detail: "Once certified, ask Dhans Kitchen to connect their ItsaCheckmate account (they sign up at itsacheckmate.com, connect Toast, and paste their Location ID into your merchant portal). Their orders will then appear directly on their Toast KDS.",
      },
    ],
    merchantSteps: [
      { step: "Sign up at itsacheckmate.com", detail: "Create a restaurant account and select Toast as your POS." },
      { step: "Connect your Toast account", detail: "Authorize ItsaCheckmate to access your Toast location via OAuth." },
      { step: "Copy your Location ID", detail: "Found in ItsaCheckmate dashboard under Settings → Locations." },
      { step: "Paste Location ID into TrueServe", detail: "Go to your TrueServe merchant portal → Integrations → Aggregator Route, select ItsaCheckmate, and paste the ID." },
    ],
  },

  Square: {
    icon: "⬛",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.06)",
    border: "rgba(96,165,250,0.2)",
    partnershipName: "Square Developer / App Marketplace",
    summary: "Square has an open API — no approval required to start building. For official marketplace listing (optional but adds credibility), apply to the Square App Marketplace.",
    estimatedTime: "3–5 days to integrate, 2–4 weeks for marketplace listing",
    trueserveSteps: [
      {
        step: "Create a Square Developer account",
        detail: "Sign up at developer.squareup.com. Create an application — this gives you a sandbox App ID and access token.",
        link: "https://developer.squareup.com",
        linkLabel: "Square Developer Portal →",
      },
      {
        step: "Use the Orders API to inject orders",
        detail: "POST to https://connect.squareupapis.com/v2/orders — include the merchant's location_id, line_items (with catalog_object_ids from their Square menu), and fulfillment details. Use OAuth to act on behalf of the merchant.",
      },
      {
        step: "Implement OAuth for merchants",
        detail: "Redirect merchants to Square's OAuth endpoint so they grant TrueServe permission to create orders on their behalf. Store their access_token and location_id in your Restaurant table.",
      },
      {
        step: "Apply to Square App Marketplace (optional)",
        detail: "Once your integration is stable, apply at squareup.com/us/en/app-marketplace/apply for official listing. Increases visibility to Square merchants.",
      },
    ],
    merchantSteps: [
      { step: "Click 'Connect Square' in TrueServe", detail: "You'll be redirected to Square's authorization page." },
      { step: "Authorize TrueServe", detail: "Allow TrueServe to create orders on your behalf." },
      { step: "Select your location", detail: "If you have multiple Square locations, select the one to receive TrueServe orders." },
    ],
  },

  Clover: {
    icon: "🍀",
    color: "#4dca80",
    bg: "rgba(77,202,128,0.06)",
    border: "rgba(77,202,128,0.2)",
    partnershipName: "Clover App Market",
    summary: "Clover requires apps to be listed on their App Market to integrate with merchant devices. You build an app, submit it for review, and merchants install it from the Clover App Market.",
    estimatedTime: "2–4 weeks (includes Clover review process)",
    trueserveSteps: [
      {
        step: "Create a Clover Developer account",
        detail: "Sign up at clover.com/developers. Create a new app and configure the required permissions: ORDERS_W (write orders), INVENTORY_R (read menu items).",
        link: "https://www.clover.com/developers",
        linkLabel: "Clover Developer Portal →",
      },
      {
        step: "Build the app connector",
        detail: "Use Clover's REST API to POST orders to /v3/merchants/{merchantId}/orders. You'll need the merchant's merchantId and an OAuth token obtained after they install your app.",
      },
      {
        step: "Set up the OAuth flow",
        detail: "When a merchant installs your Clover app, Clover redirects them back to your callback URL with an auth code. Exchange it for an access token. Store the merchantId and token in your Restaurant table.",
      },
      {
        step: "Submit to Clover App Market",
        detail: "Once tested in sandbox (use a Clover developer device), submit your app for review. Clover reviews take 1–2 weeks. You'll need a privacy policy, test credentials, and a demo video.",
      },
    ],
    merchantSteps: [
      { step: "Go to Clover App Market", detail: "Search for 'TrueServe' and click Install." },
      { step: "Authorize the app", detail: "Allow TrueServe to create orders on your Clover device." },
      { step: "Orders appear automatically", detail: "TrueServe orders will fire directly to your Clover kitchen printer or KDS." },
    ],
  },

  Lightspeed: {
    icon: "⚡",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.06)",
    border: "rgba(167,139,250,0.2)",
    partnershipName: "Lightspeed Integration Partner Program",
    summary: "Lightspeed has a formal Integration Partner Program. Apply to become a certified partner, then use their Order API to inject orders into Lightspeed Restaurant (formerly Chronodrive/iKentoo).",
    estimatedTime: "3–6 weeks (partner approval + build)",
    trueserveSteps: [
      {
        step: "Apply to the Lightspeed Partner Program",
        detail: "Submit a partner application at lightspeedhq.com/partners/integration-partners. Describe TrueServe as a food delivery ordering channel. They'll assign a partner manager.",
        link: "https://www.lightspeedhq.com/partners/",
        linkLabel: "Lightspeed Partner Program →",
      },
      {
        step: "Get sandbox API credentials",
        detail: "Once approved, you'll receive a client_id and client_secret for the Lightspeed Restaurant API (OAuth 2.0). Use these to request merchant access tokens.",
      },
      {
        step: "Push orders via the Order API",
        detail: "POST to https://api.ikentoo.com/api/v1/accounts/{accountId}/orders — include order items mapped to Lightspeed menu item IDs, table/delivery info, and payment status.",
      },
      {
        step: "Menu sync",
        detail: "Pull the merchant's menu via GET /api/v1/accounts/{accountId}/menus to map your MenuItem IDs to Lightspeed's internal item IDs. Store the mapping in your database.",
      },
    ],
    merchantSteps: [
      { step: "Provide your Lightspeed Account ID", detail: "Found in Lightspeed Back Office under Settings → Account." },
      { step: "Authorize TrueServe via OAuth", detail: "You'll be redirected to Lightspeed's auth page to grant order creation permissions." },
      { step: "Confirm menu sync", detail: "TrueServe will pull your Lightspeed menu to map items automatically." },
    ],
  },

  Revel: {
    icon: "🔴",
    color: "#f87171",
    bg: "rgba(248,113,113,0.06)",
    border: "rgba(248,113,113,0.2)",
    partnershipName: "Revel Systems Developer Program",
    summary: "Revel has an open REST API accessible via their Developer Program. Apply for API access, then use their Order API to push orders into Revel's kitchen display.",
    estimatedTime: "1–2 weeks",
    trueserveSteps: [
      {
        step: "Apply for Revel API Access",
        detail: "Email developer@revelsystems.com or apply at revelsystems.com/developers to request API credentials. Describe TrueServe as a delivery ordering channel.",
        link: "https://revelsystems.com",
        linkLabel: "Revel Systems →",
      },
      {
        step: "Obtain merchant API credentials",
        detail: "Each Revel merchant has a unique api_key and api_secret. Merchants generate these in their Revel Management Console under Settings → API Access and share them with you.",
      },
      {
        step: "Push orders via Revel's Order API",
        detail: "POST to https://{merchant-subdomain}.revelup.com/enterprise/Order/ — include items (with Revel product IDs), quantities, price overrides, and customer info. Use HMAC-SHA256 authentication (already implemented in your posWebhooks.ts).",
      },
      {
        step: "Pull menu for item ID mapping",
        detail: "GET /enterprise/Product/ to retrieve the merchant's product list. Map your MenuItem IDs to Revel's product IDs and store in your database.",
      },
    ],
    merchantSteps: [
      { step: "Generate API credentials in Revel", detail: "Revel Management Console → Settings → API Access → Create new API key." },
      { step: "Paste credentials into TrueServe", detail: "Go to TrueServe merchant portal → Integrations → Direct Hub Access, select Revel, and enter your API key and secret." },
      { step: "Share your Revel subdomain", detail: "Your Revel URL looks like yourrestaurant.revelup.com — enter the subdomain in TrueServe." },
    ],
  },
};

const POS_SYSTEMS: PosSystem[] = ["Toast", "Square", "Clover", "Lightspeed", "Revel"];

export default function POSPartnershipGuide() {
  const [active, setActive] = useState<PosSystem | null>(null);
  const [tab, setTab] = useState<"trueserve" | "merchant">("trueserve");

  const guide = active ? PARTNERSHIP_GUIDES[active] : null;

  return (
    <div style={{
      background: "var(--card, #0d0f16)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      marginBottom: 24,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 32, height: 32, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0,
        }}>
          🤝
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)", margin: 0 }}>
            Partnership Integration Guides
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0, marginTop: 3 }}>
            Step-by-step instructions for TrueServe to become an official ordering channel for each POS.
          </p>
        </div>
      </div>

      {/* POS selector */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        {POS_SYSTEMS.map((pos) => {
          const g = PARTNERSHIP_GUIDES[pos];
          return (
            <button
              key={pos}
              onClick={() => { setActive(pos); setTab("trueserve"); }}
              style={{
                flex: "0 0 auto",
                padding: "12px 20px",
                background: active === pos ? g.bg : "transparent",
                border: "none",
                borderBottom: `2px solid ${active === pos ? g.color : "transparent"}`,
                color: active === pos ? g.color : "rgba(255,255,255,0.4)",
                fontSize: 11, fontWeight: 900, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.1em",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}
            >
              <span>{g.icon}</span>
              {pos}
              {pos === "Toast" && (
                <span style={{
                  fontSize: 8, fontWeight: 900, padding: "2px 6px", borderRadius: 999,
                  background: "rgba(249,115,22,0.15)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)",
                }}>
                  VIA AGGREGATOR
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!active && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13, fontStyle: "italic" }}>
          Select a POS system above to see the full partnership setup guide.
        </div>
      )}

      {active && guide && (
        <div style={{ padding: "20px" }}>
          {/* Summary */}
          <div style={{ background: guide.bg, border: `1px solid ${guide.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: guide.color, margin: 0, marginBottom: 4 }}>
                  {guide.icon} {guide.partnershipName}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
                  {guide.summary}
                </p>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, padding: "6px 12px", textAlign: "center", flexShrink: 0,
              }}>
                <p style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", margin: 0 }}>Est. Time</p>
                <p style={{ fontSize: 11, fontWeight: 900, color: "#fff", margin: 0 }}>{guide.estimatedTime}</p>
              </div>
            </div>
            {guide.recommended && (
              <p style={{ fontSize: 10, color: "#4dca80", margin: 0, marginTop: 8, fontWeight: 700 }}>
                ✓ Recommended aggregator: {guide.recommended}
              </p>
            )}
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, marginBottom: 20, width: "fit-content" }}>
            {[
              { id: "trueserve" as const, label: "TrueServe Setup (you)" },
              { id: "merchant" as const, label: "Merchant Setup (them)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 10, fontWeight: 900,
                  background: tab === t.id ? "rgba(255,255,255,0.1)" : "transparent",
                  border: "none", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.35)",
                  cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
                  transition: "all 0.15s", whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(tab === "trueserve" ? guide.trueserveSteps : guide.merchantSteps).map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 12, padding: "14px 16px",
                }}
              >
                {/* Step number */}
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: guide.bg, border: `1px solid ${guide.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 900, color: guide.color,
                }}>
                  {i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", margin: 0, marginBottom: 4 }}>
                    {s.step}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.65 }}>
                    {s.detail}
                  </p>
                  {s.link && (
                    <p style={{ margin: 0, marginTop: 8 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: guide.bg, border: `1px solid ${guide.border}`,
                        color: guide.color, borderRadius: 6, padding: "4px 10px",
                        fontSize: 10, fontWeight: 900, letterSpacing: "0.08em",
                      }}>
                        🔗 {s.linkLabel}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Toast-specific Dhans Kitchen callout */}
          {active === "Toast" && (
            <div style={{
              marginTop: 16, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: 12, padding: "14px 16px",
            }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: "#f97316", margin: 0, marginBottom: 6 }}>
                🍳 Note for Dhans Kitchen
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.65 }}>
                Dhans Kitchen already uses Toast. Right now, TrueServe orders placed by customers do{" "}
                <strong style={{ color: "#fff" }}>not</strong> appear on their Toast KDS — they have to manage
                TrueServe orders separately. Once you complete the ItsaCheckmate partnership and Dhans Kitchen
                connects their aggregator account, their TrueServe orders will fire directly to their kitchen
                display automatically — no extra tablets needed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

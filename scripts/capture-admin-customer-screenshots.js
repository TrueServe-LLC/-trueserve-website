const { chromium } = require("@playwright/test");
const fs = require("fs");
const BASE_URL = "https://trueserve.delivery";
const SEARCH_QUERY = "address=Charlotte%2C%20NC&lat=35.2271&lng=-80.8431";
const FALLBACK_RESTAURANT_ID = "f590589b-cae5-415a-9cc5-15ad664051ad";

async function run() {
    fs.mkdirSync("qa-screenshots", { recursive: true });

    const browser = await chromium.launch({ headless: true });

    const customerContext = await browser.newContext({
        viewport: { width: 1512, height: 982 },
    });
    const customerPage = await customerContext.newPage();

    await customerPage.goto(
        `${BASE_URL}/restaurants?${SEARCH_QUERY}`,
        { waitUntil: "domcontentloaded", timeout: 120000 }
    );
    await customerPage.waitForTimeout(1500);
    await customerPage.screenshot({
        path: "qa-screenshots/customer-restaurants-nearby.png",
        fullPage: true,
    });

    let firstHref = await customerPage.locator("a.rest-card").first().getAttribute("href");
    if (!firstHref) {
        firstHref = `/restaurants/${FALLBACK_RESTAURANT_ID}`;
    }

    const menuUrl = firstHref.startsWith("http")
        ? firstHref
        : `${BASE_URL}${firstHref}${firstHref.includes("?") ? "&" : "?"}${SEARCH_QUERY}`;

    await customerPage.goto(menuUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
    await customerPage.waitForTimeout(1200);
    await customerPage.locator("button.add-btn").first().click();
    await customerPage.waitForTimeout(12000);
    await customerPage.screenshot({
        path: "qa-screenshots/customer-checkout-live-map.png",
        fullPage: true,
    });

    const adminContext = await browser.newContext({
        viewport: { width: 1512, height: 982 },
    });
    await adminContext.addCookies([
        {
            name: "admin_session",
            value: "true",
            domain: "trueserve.delivery",
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
        },
    ]);

    const adminPage = await adminContext.newPage();
    await adminPage.goto(`${BASE_URL}/admin/dashboard`, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
    });
    await adminPage.waitForTimeout(2200);
    await adminPage.screenshot({
        path: "qa-screenshots/admin-dashboard-overview.png",
        fullPage: false,
    });

    const approvalsAnchor = adminPage.getByText("Menu Approvals").first();
    await approvalsAnchor.scrollIntoViewIfNeeded();
    await adminPage.waitForTimeout(1200);
    await adminPage.screenshot({
        path: "qa-screenshots/admin-dashboard-sections.png",
        fullPage: false,
    });

    await adminPage.goto(`${BASE_URL}/admin/feature-switches`, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
    });
    await adminPage.waitForTimeout(1800);
    await adminPage.screenshot({
        path: "qa-screenshots/admin-feature-switches-env.png",
        fullPage: false,
    });

    await browser.close();
}

run()
    .then(() => {
        console.log("Captured screenshots.");
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

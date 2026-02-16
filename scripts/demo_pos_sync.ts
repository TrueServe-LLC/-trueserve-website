
/**
 * Demo Script: Simulating a POS System (Toast / Clover)
 * syncing a menu with TrueServe using the Sync API.
 */
async function simulatePOSSync() {
    const API_URL = "http://localhost:3000/api/v1/sync/menu";
    const API_KEY = "REPLACE_WITH_RESTAURANT_API_KEY"; // You'll get this after adding the column

    const menuData = {
        items: [
            {
                posId: "pos_burger_123",
                name: "POS Synced Burger",
                price: 15.99,
                description: "This item was updated automatically by the restaurant's POS system."
            },
            {
                posId: "pos_fries_456",
                name: "Curly Fries",
                price: 5.50,
                description: "Golden curly fries synced from POS."
            }
        ]
    };

    console.log("Sending sync request to TrueServe...");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY
            },
            body: JSON.stringify(menuData)
        });

        const result = await response.json();
        console.log("Sync Response:", result);
    } catch (err) {
        console.error("Sync Failed:", err);
        console.log("\nNote: Ensure the local server is running (npm run dev) before testing.");
    }
}

simulatePOSSync();

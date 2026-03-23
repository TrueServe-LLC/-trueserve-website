import { clearAllMockData } from "../app/admin/qa-actions";

async function run() {
    console.log("Clearing all mock data...");
    const res = await clearAllMockData();
    console.log(res);
}

run().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
});

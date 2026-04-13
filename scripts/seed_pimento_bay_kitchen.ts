import dotenv from "dotenv";
import { seedPimentoBayKitchen } from "../lib/pimentoBayKitchenSeed";

dotenv.config({ path: ".env.local" });

async function main() {
  if (process.env.RUN_PIMENTO_BAY_SEED !== "true") {
    console.log("Skipping Pimento Bay Kitchen seed outside Vercel.");
    return;
  }

  console.log("Seeding Pimento Bay Kitchen...");
  const result = await seedPimentoBayKitchen();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Pimento seed failed:", error);
  process.exit(1);
});

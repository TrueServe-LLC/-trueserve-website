import dotenv from "dotenv";
import { seedKrave489 } from "../lib/krave489Seed";

dotenv.config({ path: ".env.local" });

async function main() {
  if (process.env.VERCEL !== "1" && process.env.RUN_KRAVE489_SEED !== "true") {
    console.log("Skipping Krave 489 seed outside Vercel.");
    return;
  }

  console.log("Seeding Krave 489...");
  const result = await seedKrave489();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Krave 489 seed failed:", error);
  process.exit(1);
});

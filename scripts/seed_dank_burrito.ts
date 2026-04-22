import dotenv from "dotenv";
import { seedDankBurrito } from "../lib/dankBurritoSeed";

dotenv.config({ path: ".env.local" });

async function main() {
  if (process.env.VERCEL !== "1" && process.env.RUN_DANK_BURRITO_SEED !== "true") {
    console.log("Skipping Dank Burrito seed outside Vercel.");
    return;
  }

  console.log("Seeding Dank Burrito...");
  const result = await seedDankBurrito();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Dank Burrito seed failed:", error);
  process.exit(1);
});

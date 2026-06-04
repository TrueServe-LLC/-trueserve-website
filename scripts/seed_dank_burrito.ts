import dotenv from "dotenv";
import { seedDankBurrito } from "../lib/dankBurritoSeed";

dotenv.config({ path: ".env.local" });

async function main() {
  if (process.env.RUN_DANK_BURRITO_SEED !== "true") {
    console.log("Skipping Dank Burrito seed. Set RUN_DANK_BURRITO_SEED=true to run it.");
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

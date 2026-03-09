import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { getStripe } from "../lib/stripe";

async function main() {
  try {
    const customer = await getStripe().customers.create({
        email: "test@example.com",
    });
    console.log("Customer created:", customer.id);
    const intent = await getStripe().setupIntents.create({
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
        usage: 'off_session',
    });
    console.log("Intent created:", intent.client_secret);
  } catch (e) {
    console.error("Error creating setup intent:", e);
  }
}
main();

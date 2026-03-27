import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function setSlug() {
  const restaurantId = 'a92adb13-7605-4295-a333-f5c1c946f582'
  
  console.log("Setting slug for Dhan's Kitchen...")
  
  const { data, error } = await supabase
    .from('Restaurant')
    .update({ slug: 'dhans-kitchen', visibility: 'VISIBLE' })
    .eq('id', restaurantId)

  if (error) {
    console.error("Error setting slug:", error)
  } else {
    console.log("✅ Success! Dhan's Kitchen is now officially live at /restaurants/dhans-kitchen")
  }
}

setSlug()

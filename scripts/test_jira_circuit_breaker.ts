import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { triggerEmergencyMarketplacePause, resumeMarketplace } from '../lib/triage';
import { supabase } from '../lib/supabase';

async function runTest() {
    const TEST_ISSUE = "TL-1"; // Updated to match your TL project
    const TEST_REASON = "Simulated System Triage Test";

    console.log(`--- 1. Testing EMERGENCY PAUSE for ${TEST_ISSUE} ---`);
    const pauseResult = await triggerEmergencyMarketplacePause(TEST_ISSUE, TEST_REASON, "Manual Test Script");
    console.log("Pause Result:", pauseResult);

    // Verify DB
    const { data: pauseData, error: pauseError } = await supabase
        .from('SystemConfig')
        .select('value')
        .eq('key', 'MARKETPLACE_EMERGENCY_LOCK')
        .maybeSingle();
    
    if (pauseError) console.error("DB Fetch Error:", pauseError);
    console.log("DB Status (Should be true):", pauseData?.value);

    console.log("\n--- 2. Testing SYSTEM RESUME ---");
    // Wait a bit to ensure timestamps are different
    await new Promise(r => setTimeout(r, 2000));
    
    const resumeResult = await resumeMarketplace(TEST_ISSUE, "Manual Test Script");
    console.log("Resume Result:", resumeResult);

    // Verify DB
    const { data: resumeData, error: resumeError } = await supabase
        .from('SystemConfig')
        .select('value')
        .eq('key', 'MARKETPLACE_EMERGENCY_LOCK')
        .maybeSingle();
    
    if (resumeError) console.error("DB Fetch Error:", resumeError);
    console.log("DB Status (Should be false):", resumeData?.value);

    console.log("\nTest Completed. Check your Jira issue for automated comments!");
}


runTest().catch(console.error);

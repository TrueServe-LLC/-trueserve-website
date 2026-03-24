import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getLDClient } from '../lib/launchdarkly';

async function test() {
    console.log("Starting LaunchDarkly connection test...");
    console.log("SDK Key:", process.env.LAUNCHDARKLY_SDK_KEY ? "EXISTS" : "MISSING");
    
    try {
        const client = await getLDClient();
        console.log("Client initialized.");
        
        // Try a known flag or just evaluate something to trigger an event
        const flagKey = 'ordering-system-enabled';
        const flagValue = await client.variation(flagKey, { kind: 'user', key: 'test-user-1' }, true);
        console.log(`Flag '${flagKey}' value:`, flagValue);
        
        console.log("Waiting for events to flush (5s)...");
        await client.flush();
        // Wait a little bit more just in case
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await client.close();
        console.log("LaunchDarkly client closed.");
        console.log("LaunchDarkly test COMPLETED.");
    } catch (error) {
        console.error("LaunchDarkly test FAILED:", error);
    }
}

test();

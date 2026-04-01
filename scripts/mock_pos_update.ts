import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the .env.local file to check for URLs
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const pos = args.find(a => a.startsWith('--pos='))?.split('=')[1] || 'toast';
const status = args.find(a => a.startsWith('--status='))?.split('=')[1] || 'confirmed';
const orderId = args.find(a => a.startsWith('--orderId='))?.split('=')[1] || 'TEST_ORDER_123';

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runMockPOSUpdate() {
    console.log(`🚀 Simulating ${pos.toUpperCase()} POS Update...`);
    console.log(`   Order: ${orderId}`);
    console.log(`   Status: ${status}`);

    const endpoint = `${BASE_URL}/api/webhook/pos/${pos}`;

    try {
        const response = await axios.post(endpoint, {
            orderId: orderId,
            status: status,
            timestamp: new Date().toISOString(),
            pos_metadata: {
                terminal_id: "TERM_99",
                staff_id: "QA_ROBOT"
            }
        });

        console.log(`✅ Success: POS Webhook received with status ${response.status}`);
        console.log(`   Body:`, response.data);
    } catch (error: any) {
        console.error(`❌ Error firing POS mock:`, error.response?.data || error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log(`💡 Tip: Make sure your local dev server is running on port ${PORT}! (npm run dev)`);
        }
    }
}

runMockPOSUpdate();

import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), '.env');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original content length:', content.length);

// The correct URL with URL-encoded password (%23 for #)
const newUrl = 'DATABASE_URL="postgresql://postgres:TrUst71H%rLx@db.fwkfddsiiybznvdrmack.supabase.co:6543/postgres?pgbouncer=true"';

// Regex matches non-commented DATABASE_URL
// We replace the active key while preserving other keys (Stripe, Admin)
if (/^DATABASE_URL=/m.test(content)) {
    content = content.replace(/^DATABASE_URL=.*$/m, newUrl);
} else {
    // If not found (or only commented version exists), append it
    content += `\n${newUrl}`;
}

fs.writeFileSync(filePath, content);
console.log('Successfully updated .env file.');
console.log('New DATABASE_URL line:', content.match(/^DATABASE_URL=.*$/m)?.[0]);

import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), '.env');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original content length:', content.length);

// Construct %23 dynamically to avoid tool interpretation
const percent = String.fromCharCode(37);
const password = `TrUst71H${percent}23rLx`;
const newUrl = `DATABASE_URL="postgresql://postgres:${password}@db.fwkfddsiiybznvdrmack.supabase.co:6543/postgres?pgbouncer=true"`;

console.log('Constructed Password (Safe):', password);

// Regex matches non-commented DATABASE_URL
if (/^DATABASE_URL=/m.test(content)) {
    content = content.replace(/^DATABASE_URL=.*$/m, newUrl);
} else {
    content += `\n${newUrl}`;
}

fs.writeFileSync(filePath, content);
console.log('Successfully updated .env file.');
// Log only the part after the password to verify correctness without leaking if possible,
// but we need to verify the %23 presence so we log it.
console.log('New DATABASE_URL line:', content.match(/^DATABASE_URL=.*$/m)?.[0]);

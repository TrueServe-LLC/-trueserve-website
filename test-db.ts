
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to database...');
        console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);
        await prisma.$connect();
        console.log('Successfully connected to database!');
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

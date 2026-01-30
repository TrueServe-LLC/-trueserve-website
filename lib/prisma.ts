
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL as string

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || (() => {
    const pool = new Pool({
        connectionString,
        connectionTimeoutMillis: 10000,
        ssl: true // Supabase requires SSL
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({
        adapter,
        log: ['query']
    })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

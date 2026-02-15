// @ts-nocheck
import { PrismaClient } from "@prisma/generated";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: any };

// PrismaPg creates a connection pool to PostgreSQL using the pg driver.
// connectionString is your DATABASE_URL from .env.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Pass the adapter to PrismaClient. This is how Prisma 7 connects
// to the database — through the adapter, not directly.
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
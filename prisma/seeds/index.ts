import { PrismaClient } from '@prisma/client';
import { seedUser } from './user.seed';
import { seedBusiness } from './business.seed';
import { seedUserBusiness } from './userBusiness.seed';

const prisma = new PrismaClient();

async function main() {
    await prisma.$transaction(async (tx) => {
        await seedUser(tx);
        await seedBusiness(tx);
        await seedUserBusiness(tx);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

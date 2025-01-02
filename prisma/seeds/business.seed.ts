import { Prisma } from '@prisma/client';

export async function seedBusiness(prisma: Prisma.TransactionClient) {
  await prisma.business.create({
    data: {
      business_id: 1,
      name: 'Sword Business',
      level: 1,
    },
  });

  await prisma.business.create({
    data: {
      business_id: 2,
      name: 'Bow Business',
      level: 1,
    },
  });
}

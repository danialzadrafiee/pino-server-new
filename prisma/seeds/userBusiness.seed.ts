import { Prisma } from '@prisma/client';

export async function seedUserBusiness(prisma: Prisma.TransactionClient) {
  await prisma.userBusiness.upsert({
    where: {
      user_id_business_id: {
        user_id: 1,
        business_id: 1,
      },
    },
    update: {},
    create: {
      user_id: 1,
      business_id: 1,
      level: 50,
    },
  });
  await prisma.userBusiness.upsert({
    where: {
      user_id_business_id: {
        user_id: 1,
        business_id: 2,
      },
    },
    update: {},
    create: {
      user_id: 1,
      business_id: 2,
      level: 50,
    },
  });
}

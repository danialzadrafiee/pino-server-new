import { Prisma } from '@prisma/client';

export async function seedUser(prisma: Prisma.TransactionClient) {
  await prisma.user.upsert({
    where: {
      telegram_id: 123, 
    },
    update: {}, 
    create: {
      referrer_id: 0,
      telegram_id: 123,
      telegram_username: 'demo_user',
      telegram_firstname: 'Demo',
      telegram_lastname: 'User',
      apple_balance: 100,
      cricket_balance: 10,
      previous_matchs_apple_earning:1,  
      direct_referrals_count: 0,
      downline_referrals_count: 0,
      // direct_referrals_count: 2,
      // downline_referrals_count: 40,
    },
  });


  
} 
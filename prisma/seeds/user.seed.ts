import { Prisma } from '@prisma/client';

export async function seedUser(prisma: Prisma.TransactionClient) {
  await prisma.user.create({
    data: {
      telegram_id: '123456789',
      referrer_id: null,
      referral_code: '11111111',
      telegram_username: 'demo_user',
      telegram_firstname: 'Demo',
      telegram_lastname: 'User',
      cricket_balance: 0,
      this_match_apple_earning: 0,
      previous_match_apple_earning: 0,
      direct_referral_count: 0,
      downline_referral_count: 0,
      apple_balance: 0,
      apple_per_second: 0,
      pets: [],
      referral_modal_watched: false,
      last_heartbeat: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
}

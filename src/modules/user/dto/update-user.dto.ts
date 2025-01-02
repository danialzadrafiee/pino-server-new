import { User } from '@prisma/client';

export class UpdateUserDto implements Partial<User> {
  referrer_id?: number;
  telegram_username?: string;
  telegram_firstname?: string;
  telegram_lastname?: string;
  cricket_balance?: number;
  this_match_apple_earning?: number;
  previous_match_apple_earning?: number;
  direct_referral_count?: number;
  downline_referral_count?: number;
  apple_balance?: number;
  apple_per_second?: number;
  last_heartbeat?: Date;
}

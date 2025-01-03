/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserBusiness } from '@prisma/client';

type UserWithBusiness = Omit<User, 'referrer_id'> & {
  userBusiness: UserBusiness[];
  referrer_id: string | null;
};

type UserResponse = UserWithBusiness;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  private calculateOfflineEarnings(
    lastHeartbeat: Date,
    applePerSecond: number,
  ): number {
    const now = new Date();
    const timeDiffInSeconds = Math.floor(
      (now.getTime() - lastHeartbeat.getTime()) / 1000,
    );
    if (timeDiffInSeconds > 4) {
      return applePerSecond * timeDiffInSeconds;
    }
    return 0;
  }
  private async generateReferralCode(maxAttempts: number = 10): Promise<string> {
    const allowedChars = [
      'A',
      'B',
      'C',
      'X',
      'Y',
      'Z',
      '1',
      '2',
      '3',
      '4',
      '5',
    ];
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let code = '';
      for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * allowedChars.length);
        code += allowedChars[randomIndex];
      }
      
      // Check if code already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { referral_code: code },
      });
      
      if (!existingUser) {
        return code; // Found a unique code
      }
      
      this.logger.debug(`Referral code collision detected: ${code}, retrying...`);
    }
    
    throw new Error(`Failed to generate unique referral code after ${maxAttempts} attempts`);
  }
  async findUserByReferralCode(referralCode: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { referral_code: referralCode },
    });
  }

  async registerNewUser(telegramData: {
    telegram_id: string | number;
    telegram_username?: string;
    telegram_firstname?: string;
    telegram_lastname?: string;
    referrer_code?: string;
  }): Promise<UserResponse> {
    // Ensure telegram_id is string
    const telegram_id = telegramData.telegram_id.toString();
    return await this.prisma.$transaction(async (prisma) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { telegram_id },
        include: {
          userBusiness: true,
        },
      });
      if (existingUser) {
        return {
          ...existingUser,
          referrer_id: existingUser.referrer_id
            ? existingUser.referrer_id.toString()
            : null,
          userBusiness: existingUser.userBusiness,
        };
      }
      let referrerId: number | null = null;
      if (telegramData.referrer_code) {
        const referrer = await prisma.user.findUnique({
          where: { referral_code: telegramData.referrer_code },
        });
        if (referrer) {
          referrerId = referrer.id;
          await prisma.user.update({
            where: { id: referrer.id },
            data: {
              direct_referral_count: { increment: 1 },
            },
          });
        }
      }
      const newUser = await prisma.user.create({
        data: {
          telegram_id,
          telegram_username: telegramData.telegram_username,
          telegram_firstname: telegramData.telegram_firstname,
          telegram_lastname: telegramData.telegram_lastname,
          referral_code: await this.generateReferralCode(),
          referrer_id: referrerId,
          last_heartbeat: new Date(),
          apple_balance: 5,
          pets: [],
        },
        include: {
          userBusiness: true,
        },
      });
      if (referrerId) {
        await prisma.referral.create({
          data: {
            referrer_id: referrerId,
            referred_id: newUser.id,
            telegram_id,
          },
        });
      }
      return {
        ...newUser,
        referrer_id: newUser.referrer_id
          ? newUser.referrer_id.toString()
          : null,
        userBusiness: newUser.userBusiness,
      };
    });
  }

  async getAuthUser(telegram_id: string): Promise<UserResponse | null> {
    this.logger.log(`Processing getAuthUser for telegram_id: ${telegram_id}`);
    return await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { telegram_id },
        include: {
          userBusiness: true,
        },
      });
      if (!user) {
        this.logger.log(`No user found for telegram_id: ${telegram_id}`);
        return null;
      }
      const offlineEarnings = this.calculateOfflineEarnings(
        user.last_heartbeat,
        user.apple_per_second,
      );
      const updatedUser = await prisma.user.update({
        where: { telegram_id },
        data: {
          apple_balance: user.apple_balance + offlineEarnings,
          last_heartbeat: new Date(),
        },
        include: {
          userBusiness: true,
        },
      });
      this.logger.log(
        `Successfully updated user for telegram_id: ${telegram_id}`,
      );
      return {
        ...updatedUser,
        referrer_id: updatedUser.referrer_id
          ? updatedUser.referrer_id.toString()
          : null,
        userBusiness: updatedUser.userBusiness,
      };
    });
  }
}

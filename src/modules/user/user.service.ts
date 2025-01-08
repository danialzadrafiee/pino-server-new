import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { getBusinessById } from '../../constants/business.constants';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private async getUplineUsers(userId: number): Promise<number[]> {
    const uplineUsers: number[] = [];
    let currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referrer_id: true },
    });

    while (currentUser?.referrer_id) {
      uplineUsers.push(currentUser.referrer_id);
      currentUser = await this.prisma.user.findUnique({
        where: { id: currentUser.referrer_id },
        select: { referrer_id: true },
      });
    }
    return uplineUsers;
  }

  async heartbeat(userId: number, updateUserDto: UpdateUserDto) {
    const { userBusiness, ...userData } = updateUserDto;

    return this.prisma.$transaction(async (prisma) => {
      // Get current user data
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          apple_balance: true,
          apple_per_second: true,
          userBusiness: true
        }
      });

      if (!currentUser) {
        throw new BadRequestException('User not found');
      }

      // Prepare update data
      const updateData: any = {};

      // Only update apple_balance if new value is greater
      if (userData.apple_balance !== undefined) {
        const newAppleBalance = typeof userData.apple_balance === 'string'
          ? parseFloat(userData.apple_balance)
          : userData.apple_balance;
        
        if (newAppleBalance > (currentUser.apple_balance || 0)) {
          updateData.apple_balance = newAppleBalance;
        }
      }

      // Only update apple_per_second if new value is greater
      if (userData.apple_per_second !== undefined) {
        const newApplePerSecond = typeof userData.apple_per_second === 'string'
          ? parseFloat(userData.apple_per_second)
          : userData.apple_per_second;
        
        if (newApplePerSecond > (currentUser.apple_per_second || 0)) {
          updateData.apple_per_second = newApplePerSecond;
        }
      }

      // Update user with filtered data
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          invited_by_this_user: true,
          userBusiness: true,
        },
      });

      // Update userBusiness levels only if new level is greater
      if (userBusiness && userBusiness.length > 0) {
        for (const ub of userBusiness) {
          const currentBusiness = currentUser.userBusiness.find(
            b => b.business_id === ub.business_id
          );

          if (!currentBusiness || ub.level > currentBusiness.level) {
            await prisma.userBusiness.upsert({
              where: {
                user_id_business_id: {
                  user_id: userId,
                  business_id: ub.business_id,
                },
              },
              create: {
                user_id: userId,
                business_id: ub.business_id,
                level: ub.level,
              },
              update: {
                level: ub.level,
              },
            });
          }
        }
      }

      return prisma.user
        .findUnique({
          where: { id: userId },
          include: {
            invited_by_this_user: true,
            userBusiness: true,
          },
        })
        .then(async (result) => {
          if (!result) return null;

          return {
            ...result,
            userBusiness: result.userBusiness.map((ub) => ({
              ...ub,
              business: getBusinessById(ub.business_id),
            })),
          };
        });
    });
  }

  async setPetAndReferralModal(userId: number, referral_code?: string) {
    const updateData: any = {
      referral_modal_watched: true,
    };

    if (referral_code) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { pets: true },
      });

      const referrer = await this.prisma.user.findUnique({
        where: { referral_code },
      });
      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
      if (referrer.id === userId) {
        throw new BadRequestException('You cannot use your own referral code');
      }

      // Only give pet if valid referral code is provided
      const currentPets = currentUser?.pets as number[] | null | undefined;
      if (!currentPets || currentPets.length === 0) {
        const randomPetId = Math.floor(Math.random() * 2) + 1;
        updateData.pets = [randomPetId];
      }

      const uplineUsers = await this.getUplineUsers(referrer.id);
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            direct_referral_count: { increment: 1 },
          },
        });

        await tx.referral.create({
          data: {
            referrer_id: referrer.id,
            referred_id: userId,
            telegram_id: userId.toString(),
          },
        });

        if (uplineUsers.length > 0) {
          await tx.user.updateMany({
            where: { id: { in: uplineUsers } },
            data: {
              downline_referral_count: { increment: 1 },
            },
          });
        }
      });
      updateData.referrer_id = referrer.id;
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });
  }
}

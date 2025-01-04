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
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...userData,
          apple_balance:
            typeof userData.apple_balance === 'string'
              ? parseFloat(userData.apple_balance)
              : userData.apple_balance,
          apple_per_second:
            typeof userData.apple_per_second === 'string'
              ? parseFloat(userData.apple_per_second)
              : userData.apple_per_second,
        },
        include: {
          invited_by_this_user: true,
          userBusiness: true,
        },
      });

      if (userBusiness && userBusiness.length > 0) {
        for (const ub of userBusiness) {
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
    const randomPetId = Math.floor(Math.random() * 2) + 1;
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pets: true },
    });

    const updateData: any = {
      referral_modal_watched: true,
    };

    const currentPets = currentUser?.pets as number[] | null | undefined;
    if (!currentPets || currentPets.length === 0) {
      updateData.pets = [randomPetId];
    }

    if (referral_code) {
      const referrer = await this.prisma.user.findUnique({
        where: { referral_code },
      });
      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
      if (referrer.id === userId) {
        throw new BadRequestException('You cannot use your own referral code');
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

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

  async heartbeat(id: number, updateUserDto: UpdateUserDto) {
    const { userBusiness, ...userData } = updateUserDto;

    return this.prisma.$transaction(async (prisma) => {
      // Update user data
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userData,
        include: {
          invited_by_this_user: true,
          userBusiness: true,
        },
      });

      // Update userBusiness if provided
      if (userBusiness && userBusiness.length > 0) {
        // Update each userBusiness record
        for (const ub of userBusiness) {
          await prisma.userBusiness.upsert({
            where: {
              user_id_business_id: {
                user_id: id,
                business_id: ub.business_id,
              },
            },
            create: {
              user_id: id,
              business_id: ub.business_id,
              level: ub.level,
            },
            update: {
              level: ub.level,
            },
          });
        }
      }

      // Return the final updated user with all relations
      return prisma.user
        .findUnique({
          where: { id },
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

  async setPetAndReferralModal(referral_code?: string) {
    const randomPetId = Math.floor(Math.random() * 2) + 1;
    const currentUser = await this.prisma.user.findUnique({
      where: { id: 1 },
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

      const uplineUsers = await this.getUplineUsers(referrer.id);
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            direct_referral_count: { increment: 1 },
            downline_referral_count: { increment: 1 },
          },
        });

        await tx.referral.create({
          data: {
            referrer_id: referrer.id,
            referred_id: 1,
            telegram_id: '1',
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
        id: 1,
      },
      data: updateData,
    });
  }
}

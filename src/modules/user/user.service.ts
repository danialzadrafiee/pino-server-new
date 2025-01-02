import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { getBusinessById } from '../../constants/business.constants';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async heartbeat(id: number, updateUserDto: UpdateUserDto) {
    const { userBusiness, ...userData } = updateUserDto;

    return this.prisma.$transaction(async (prisma) => {
      // Update user data
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userData,
        include: {
          referrals: true,
          referred: true,
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
            referrals: true,
            referred: true,
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

  async setPetAndReferralModal(referral_code: string) {
    const randomPetId = Math.floor(Math.random() * 2) + 1;

    // Find referrer by referral code
    const referrer = await this.prisma.user.findUnique({
      where: { referral_code },
    });

    if (referrer) {
      return this.prisma.user.updateMany({
        where: {
          pets: {
            equals: [],
          },
        },
        data: {
          referral_modal_watched: true,
          pets: [randomPetId],
          referrer_id: referrer.id,
        },
      });
    }

    return this.prisma.user.updateMany({
      where: {
        pets: {
          equals: [],
        },
      },
      data: {
        referral_modal_watched: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserBusinessDto } from './dto/update-user-business.dto';
import { getBusinessById } from '../../constants/business.constants';

@Injectable()
export class UserBusinessService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const userBusinesses = await this.prisma.userBusiness.findMany({
      include: {
        user: true
      }
    });

    return userBusinesses.map(ub => ({
      ...ub,
      business: getBusinessById(ub.business_id)
    }));
  }

  async findOne(id: number) {
    const userBusiness = await this.prisma.userBusiness.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!userBusiness) return null;

    return {
      ...userBusiness,
      business: getBusinessById(userBusiness.business_id)
    };
  }

  async update(id: number, updateUserBusinessDto: UpdateUserBusinessDto) {
    const userBusiness = await this.prisma.userBusiness.update({
      where: { id },
      data: updateUserBusinessDto,
      include: {
        user: true
      }
    });

    return {
      ...userBusiness,
      business: getBusinessById(userBusiness.business_id)
    };
  }

  async findByUserAndBusiness(userId: number, businessId: number) {
    const userBusiness = await this.prisma.userBusiness.findUnique({
      where: {
        user_id_business_id: {
          user_id: userId,
          business_id: businessId
        }
      },
      include: {
        user: true
      }
    });

    if (!userBusiness) return null;

    return {
      ...userBusiness,
      business: getBusinessById(userBusiness.business_id)
    };
  }
}

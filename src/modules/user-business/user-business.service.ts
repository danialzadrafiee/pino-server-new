import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserBusinessDto } from './dto/update-user-business.dto';

@Injectable()
export class UserBusinessService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.userBusiness.findMany({
      include: {
        user: true,
        business: true
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.userBusiness.findUnique({
      where: { id },
      include: {
        user: true,
        business: true
      }
    });
  }

  async update(id: number, updateUserBusinessDto: UpdateUserBusinessDto) {
    return this.prisma.userBusiness.update({
      where: { id },
      data: updateUserBusinessDto,
      include: {
        user: true,
        business: true
      }
    });
  }

  async findByUserAndBusiness(userId: number, businessId: number) {
    return this.prisma.userBusiness.findUnique({
      where: {
        user_id_business_id: {
          user_id: userId,
          business_id: businessId
        }
      },
      include: {
        user: true,
        business: true
      }
    });
  }
}

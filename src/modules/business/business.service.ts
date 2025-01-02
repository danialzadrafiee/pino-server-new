import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.business.findMany({
      include: {
        userBusiness: {
          include: {
            user: true
          }
        }
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.business.findUnique({
      where: { id },
      include: {
        userBusiness: {
          include: {
            user: true
          }
        }
      }
    });
  }

  async update(id: number, updateBusinessDto: UpdateBusinessDto) {
    return this.prisma.business.update({
      where: { id },
      data: updateBusinessDto,
      include: {
        userBusiness: {
          include: {
            user: true
          }
        }
      }
    });
  }
}

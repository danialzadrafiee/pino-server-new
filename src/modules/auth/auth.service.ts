/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async getAuthUser() {
    return await this.prisma.user.findUnique({
      where: { id: 1 },
      include: {
        referrals: true,
        referred: true,
        user_businesses: true,
      },
    });
  }

  async testIncreaseApple() {
    return this.prisma.user.update({
      where: { id: 1 },
      data: { apple_balance: { increment: 1 } },
    });
  }
}

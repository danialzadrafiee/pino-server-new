/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateOfflineEarnings(lastHeartbeat: Date, applePerSecond: number): number {
    const now = new Date();
    const timeDiffInSeconds = Math.floor((now.getTime() - lastHeartbeat.getTime()) / 1000);
    if (timeDiffInSeconds > 4) {
      return applePerSecond * timeDiffInSeconds;
    }
    return 0;
  }

  async getAuthUser() {
    return await this.prisma.$transaction(async (prisma) => {
      // Get current user state
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          userBusiness: true,
        },
      });

      if (!user) {
        return null;
      }

      const offlineEarnings = this.calculateOfflineEarnings(
        user.last_heartbeat,
        user.apple_per_second
      );

      const updatedUser = await prisma.user.update({
        where: { id: 1 },
        data: {
          apple_balance: user.apple_balance + offlineEarnings,
          last_heartbeat: new Date(),
        },
        include: {
          userBusiness: true,
        },
      });

      return updatedUser;
    });
  }
}

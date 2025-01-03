import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TelegramAuthMiddleware } from '../auth/telegram-auth.middleware';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TelegramAuthMiddleware)
      .forRoutes(
        { path: 'user/heartbeat', method: RequestMethod.PATCH },
        { path: 'user/enter-referral-code', method: RequestMethod.POST }
      );
  }
}

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { TelegramAuthMiddleware } from './telegram-auth.middleware';
import { TelegramModule } from '../telegram/telegram.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    forwardRef(() => TelegramModule),
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TelegramAuthMiddleware)
      .forRoutes('auth/get-auth-user');
  }
}

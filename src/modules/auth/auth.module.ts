import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TelegramAuthMiddleware } from './telegram-auth.middleware';

@Module({
  imports: [],
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

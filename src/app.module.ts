import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { UserBusinessModule } from './modules/user-business/user-business.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    UserBusinessModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { UserBusinessController } from './user-business.controller';
import { UserBusinessService } from './user-business.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserBusinessController],
  providers: [UserBusinessService],
  exports: [UserBusinessService],
})
export class UserBusinessModule {}

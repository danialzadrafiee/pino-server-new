import { Controller, Get, Param, Patch, Body, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('heartbeat/:id')
  heartbeat(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.heartbeat(+id, updateUserDto);
  }
  @Post('enter-referral-code')
  setPetAndReferralModal(@Body('referral_code') referral_code: string) {
    return this.userService.setPetAndReferralModal(referral_code);
  }
}

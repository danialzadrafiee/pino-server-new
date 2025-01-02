import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { UserBusinessService } from './user-business.service';
import { UpdateUserBusinessDto } from './dto/update-user-business.dto';

@Controller('user-businesses')
export class UserBusinessController {
  constructor(private readonly userBusinessService: UserBusinessService) {}

  @Get()
  findAll() {
    return this.userBusinessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userBusinessService.findOne(+id);
  }

  @Get('user/:userId/business/:businessId')
  findByUserAndBusiness(
    @Param('userId') userId: string,
    @Param('businessId') businessId: string,
  ) {
    return this.userBusinessService.findByUserAndBusiness(+userId, +businessId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserBusinessDto: UpdateUserBusinessDto) {
    return this.userBusinessService.update(+id, updateUserBusinessDto);
  }
}

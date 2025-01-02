import { UserBusiness } from '@prisma/client';

export class UpdateUserBusinessDto implements Partial<UserBusiness> {
  level?: number;
}

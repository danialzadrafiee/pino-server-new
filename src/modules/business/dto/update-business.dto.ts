import { Business } from '@prisma/client';

export class UpdateBusinessDto implements Partial<Business> {
  name?: string;
  level?: number;
}

import { Prisma } from '@prisma/client';

export async function seedBusiness(prisma: Prisma.TransactionClient) {
  await prisma.business.create({
    data: {
      name: 'Sword',
      initial_cost: 1.5,
      coefficient: 1.05,
      initial_aps: 1,
      initial_tap_reward: 0.5,
      tiers: [
        {
          requiredLevel: 0,
          achievement: { type: 'self', multiplier: 1 },
        },
        {
          requiredLevel: 25,
          achievement: { type: 'self', multiplier: 1.1 },
        },
        {
          requiredLevel: 50,
          achievement: { type: 'self', multiplier: 1.5 },
        },
        {
          requiredLevel: 100,
          achievement: { type: 'self', multiplier: 1.8 },
        },
        {
          requiredLevel: 150,
          achievement: { type: 'global', multiplier: 1.2 },
        },
        {
          requiredLevel: 200,
          achievement: { type: 'self', multiplier: 2 },
        },
        {
          requiredLevel: 250,
          achievement: { type: 'global', multiplier: 1.3 },
        },
        {
          requiredLevel: 300,
          achievement: { type: 'self', multiplier: 2.2 },
        },
        {
          requiredLevel: 350,
          achievement: { type: 'self', multiplier: 2.5 },
        },
        {
          requiredLevel: 400,
          achievement: { type: 'global', multiplier: 1.5 },
        },
      ],
      requirements: { business: [], totalApples: 0 },
    },
  });

  await prisma.business.create({
    data: {
      name: 'Bow',
      initial_cost: 10,
      coefficient: 1.07,
      initial_aps: 5,
      initial_tap_reward: 2,
      tiers: [
        {
          requiredLevel: 0,
          achievement: { type: 'self', multiplier: 1 },
        },
        {
          requiredLevel: 25,
          achievement: { type: 'self', multiplier: 1.5 },
        },
        {
          requiredLevel: 50,
          achievement: { type: 'global', multiplier: 1.1 },
        },
        {
          requiredLevel: 100,
          achievement: { type: 'self', multiplier: 1.8 },
        },
        {
          requiredLevel: 250,
          achievement: { type: 'self', multiplier: 2.2 },
        },
        {
          requiredLevel: 300,
          achievement: { type: 'global', multiplier: 1.3 },
        },
        {
          requiredLevel: 350,
          achievement: { type: 'self', multiplier: 2.5 },
        },
        {
          requiredLevel: 400,
          achievement: { type: 'global', multiplier: 1.5 },
        },
      ],
      requirements: { business: [{ id: 1, level: 10 }], totalApples: 0 },
    },
  });
}

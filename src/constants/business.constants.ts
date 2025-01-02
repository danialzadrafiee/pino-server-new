export interface Business {
  business_id: number;
  name: string;
}

export const BUSINESSES: Business[] = [
  { business_id: 1, name: 'Sword' },
  { business_id: 2, name: 'Bow' },
  { business_id: 3, name: 'Armor' },
  { business_id: 4, name: 'Helmet' },
  { business_id: 5, name: 'Boots' },
  { business_id: 6, name: 'Gloves' },
  { business_id: 7, name: 'Ring' },
  { business_id: 8, name: 'Shield' },
  { business_id: 9, name: 'Spellbook' },
  { business_id: 10, name: 'Hat' }
];

export function getBusinessById(id: number): Business | undefined {
  return BUSINESSES.find(business => business.business_id === id);
}

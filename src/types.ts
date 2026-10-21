export interface Model {
  code: string;
  name: string;
  category: string;
  tagline: string;
}
export interface Prefecture {
  code: string;
  name: string;
}
export interface Dealer {
  id: string;
  code: string;
  prefecture_code: string;
  name: string;
  address: string;
  postal_code: string;
  lat: number;
  lng: number;
  phone: string;
  business_hours: string;
}
export interface DealerResult extends Dealer {
  hasTestCar: boolean;
  distanceKm?: number;
}
export interface SearchInput {
  modelCode: string;
  prefectureCode?: string;
  postalCode?: string;
}
export interface RequestInput {
  modelCode: string;
  dealerId: string;
  name: string;
  kana: string;
  email: string;
  phone: string;
  preferred1: string;
  preferred2: string;
  notes: string;
}

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
  photo_url?: string | null;
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
  closed_days: string;
}
export interface DealerVehicle {
  id: string;
  dealer_id: string;
  model_code: string;
  grade: string;
  body_color: string;
  interior_color: string;
}
export interface DealerResult extends Dealer {
  hasTestCar: boolean;
  vehicles: DealerVehicle[];
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
  vehicleId: string;
  name: string;
  kana: string;
  email: string;
  phone: string;
  preferred1: string;
  preferred2: string;
  notes: string;
}

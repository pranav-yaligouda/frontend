export interface Store {
  _id?: string;
  name: string;
  owner: string; // user ID as string
  image?: string;
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address?: string;
  };
  timings?: {
    [day: string]: { open: string; close: string; holiday: boolean };
  };
  holidays?: string[];
  categories?: string[];
  createdAt?: string;
  updatedAt?: string;
} 
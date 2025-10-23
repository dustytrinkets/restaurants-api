export interface RestaurantWithRating {
  id: number;
  name: string;
  neighborhood?: string;
  cuisine_type?: string;
  address?: string;
  lat?: number;
  lng?: number;
  averageRating: number;
}

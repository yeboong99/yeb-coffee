export type IntensityLevel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13;
export type FlavorNote = string;

export interface Capsule {
  id: string;
  slug: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  intensity: IntensityLevel | null;
  flavorNotes: FlavorNote[];
  isLimitedEdition: boolean;
  isDiscontinued: boolean;
  coupangRating: number | null;
  reviewCount: number;
}

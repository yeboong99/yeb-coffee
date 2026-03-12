export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  country: string;
  capsuleCount: number;
}

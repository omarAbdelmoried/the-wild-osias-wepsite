export type Cabin = {
  id: number;
  created_at: string;
  name: string | null;
  maxCapacity: number | null;
  regularPrice: number | null;
  discount: number | null;
  description: string | null;
  image: string | null;
};

export type CabinSummary = Pick<
  Cabin,
  "id" | "name" | "maxCapacity" | "regularPrice" | "discount" | "image"
>;

export type CabinPrice = Pick<Cabin, "regularPrice" | "discount">;

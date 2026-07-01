export type Product = {
  productId: string;
  ownerId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;
  quantity?: number;
  createdAt: number;
  updatedAt: number;
};

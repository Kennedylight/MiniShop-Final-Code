export type OrderStatus = 'new' | 'confirmed' | 'in_process' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type Order = {
  orderId: string;
  ownerId: string;
  shopName: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  deliveryAddress: string;
  notes?: string;
  items: OrderItem[];
  estimatedTotal: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
};

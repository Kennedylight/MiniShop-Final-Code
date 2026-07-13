import { db } from './firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { Order, OrderStatus } from '@/types/Order';
import { Owner } from '@/types/Owner';

async function postFunction(path: string, body: unknown): Promise<void> {
  try {
    await fetch(`${process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn(`Failed to call ${path}`, err);
  }
}

export function subscribeToOrder(orderId: string, cb: (order: Order | null) => void) {
  return onSnapshot(
    doc(db, 'orders', orderId),
    snap => {
      cb(snap.exists() ? ({ orderId: snap.id, ...snap.data() } as Order) : null);
    },
    error => {
      console.warn('subscribeToOrder Firestore error:', error);
      cb(null);
    }
  );
}

export async function createOrder(
  input: Omit<Order, 'orderId' | 'status' | 'createdAt' | 'updatedAt'>
) {
  const now = Date.now();

  const order = {
    ...input,
    status: 'new' as OrderStatus,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'orders'), order);

  void postFunction('sendNewOrderNotification', { orderId: docRef.id });

  return docRef.id;
}

export function subscribeOwnerOrders(
  ownerId: string,
  cb: (orders: Order[]) => void,
  onError?: (error: unknown) => void,
) {
  const q = query(
    collection(db, 'orders'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    snap => {
      const orders = snap.docs
        .map(d => ({
          orderId: d.id,
          ...d.data(),
        } as Order))
        .sort((a, b) => {
          const aTime = Number(a.createdAt || 0);
          const bTime = Number(b.createdAt || 0);
          return bTime - aTime;
        });

      cb(orders);
    },
    error => {
      console.warn('subscribeOwnerOrders Firestore error:', error);
      onError?.(error);
    }
  );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await setDoc(
    doc(db, 'orders', orderId),
    {
      status,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  void postFunction('sendOrderStatusNotification', { orderId, status });
}

export async function findShopBySlug(slug: string): Promise<Owner | null> {
  const q = query(
    collection(db, 'owners'),
    where('shopSlug', '==', slug)
  );

  const snap = await getDocs(q);

  return snap.empty ? null : (snap.docs[0].data() as Owner);
}
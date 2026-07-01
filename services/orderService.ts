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

  await fetch(`${process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL}/sendNewOrderNotification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: docRef.id }),
  }).catch(() => undefined);

  return docRef.id;
}

export function subscribeOwnerOrders(ownerId: string, cb: (orders: Order[]) => void) {
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
      console.log('subscribeOwnerOrders Firestore error:', error);
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

  await fetch(`${process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL}/sendOrderStatusNotification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, status }),
  }).catch(() => undefined);
}

export async function findShopBySlug(slug: string) {
  const q = query(
    collection(db, 'owners'),
    where('shopSlug', '==', slug)
  );

  const snap = await getDocs(q);

  return snap.empty
    ? null
    : {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      };
}
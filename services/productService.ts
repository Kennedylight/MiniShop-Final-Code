import { db, storage } from './firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  orderBy,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Product } from '@/types/Product';
import { getPhotoLimit, MAX_PHOTOS, PlanId } from '@/constants/plans';

export async function listOwnerProducts(ownerId: string) {
  const q = query(
    collection(db, 'products'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map(
    d =>
      ({
        productId: d.id,
        ...d.data(),
      } as Product)
  );
}

export async function uploadProductImage(ownerId: string, localUri: string) {
  if (!ownerId) {
    throw new Error('Missing owner ID.');
  }

  if (!localUri) {
    throw new Error('Missing image URI.');
  }

  const response = await fetch(localUri);

  if (!response.ok) {
    throw new Error('Could not read selected image.');
  }

  const blob = await response.blob();

  const fileName = `${Date.now()}.jpg`;

  // This path must match your Firebase Storage rules:
  // products/{ownerId}/{fileName}
  const fileRef = ref(storage, `products/${ownerId}/${fileName}`);

  await uploadBytes(fileRef, blob, {
    contentType: 'image/jpeg',
  });

  const downloadUrl = await getDownloadURL(fileRef);

  return downloadUrl;
}

export async function addProduct(
  ownerId: string,
  plan: PlanId,
  input: Omit<Product, 'productId' | 'ownerId' | 'createdAt' | 'updatedAt'>
) {
  if (!ownerId) {
    throw new Error('Missing owner ID.');
  }

  const products = await listOwnerProducts(ownerId);
  const limit = getPhotoLimit(plan);

  if (products.length >= limit) {
    throw new Error(`Your plan allows up to ${limit} product photos.`);
  }

  if (products.length >= MAX_PHOTOS) {
    throw new Error('MiniShop maximum is 15 photos.');
  }

  const now = Date.now();

  const docRef = await addDoc(collection(db, 'products'), {
    ...input,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function updateProduct(productId: string, data: Partial<Product>) {
  if (!productId) {
    throw new Error('Missing product ID.');
  }

  return setDoc(
    doc(db, 'products', productId),
    {
      ...data,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export async function deleteProduct(productId: string) {
  if (!productId) {
    throw new Error('Missing product ID.');
  }

  return deleteDoc(doc(db, 'products', productId));
}
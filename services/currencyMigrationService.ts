import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore';

const BATCH_SIZE = 450;

async function commitInBatches(
  refsAndData: { ref: DocumentReference; data: Record<string, unknown> }[],
) {
  for (let i = 0; i < refsAndData.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    for (const { ref, data } of refsAndData.slice(i, i + BATCH_SIZE)) {
      batch.update(ref, data);
    }
    await batch.commit();
  }
}

// Relabellise (sans recalculer aucun montant) les produits et commandes d'une
// boutique dont le champ `currency` ne correspond plus à la devise définitive
// choisie sur le profil. Nécessaire car chaque produit/commande enregistre sa
// propre devise au moment de sa création (voir products.tsx / checkout.tsx).
export async function fixLegacyCurrency(
  ownerId: string,
  currency: string,
): Promise<{ products: number; orders: number }> {
  const now = Date.now();

  const productsSnap = await getDocs(
    query(collection(db, 'products'), where('ownerId', '==', ownerId)),
  );
  const staleProducts = productsSnap.docs.filter((d) => d.data().currency !== currency);
  await commitInBatches(
    staleProducts.map((d) => ({ ref: d.ref, data: { currency, updatedAt: now } })),
  );

  const ordersSnap = await getDocs(
    query(collection(db, 'orders'), where('ownerId', '==', ownerId)),
  );
  const staleOrders = ordersSnap.docs.filter((d) => d.data().currency !== currency);
  await commitInBatches(
    staleOrders.map((d) => {
      const data = d.data();
      const items = Array.isArray(data.items)
        ? data.items.map((it: Record<string, unknown>) => ({ ...it, currency }))
        : data.items;
      return { ref: d.ref, data: { currency, items, updatedAt: now } };
    }),
  );

  return { products: staleProducts.length, orders: staleOrders.length };
}

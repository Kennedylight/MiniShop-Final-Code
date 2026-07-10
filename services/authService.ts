import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Owner } from '@/types/Owner';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function registerOwner(input: {
  fullName: string;
  email: string;
  password: string;
  shopName: string;
  phone?: string;
  whatsapp?: string;
}) {
  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateProfile(cred.user, { displayName: input.fullName });
  const now = Date.now();

  const owner: Owner = {
    ownerId: cred.user.uid,
    email: input.email.trim().toLowerCase(),
    fullName: input.fullName.trim(),
    shopName: input.shopName.trim(),
    shopSlug: slugify(input.shopName) || cred.user.uid,
    subscriptionStatus: "inactive",
    accountStatus: "active",
    createdAt: now,
    updatedAt: now,
  };

  // Comme sur le web : on n'ajoute la clé que si la valeur existe
  if (input.phone) owner.phone = input.phone.trim();
  if (input.whatsapp) owner.whatsapp = input.whatsapp.trim();

  await setDoc(doc(db, "owners", cred.user.uid), {
    ...owner,
    createdAtServer: serverTimestamp(),
  });

  return owner;
}

export async function loginOwner(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logoutOwner() {
  return signOut(auth);
}

export async function getCurrentOwner(ownerId: string) {
  const snap = await getDoc(doc(db, 'owners', ownerId));
  return snap.exists() ? (snap.data() as Owner) : null;
}

export async function updateOwnerCurrency(ownerId: string, currency: string) {
  return setDoc(doc(db, 'owners', ownerId), { currency, updatedAt: Date.now() }, { merge: true });
}

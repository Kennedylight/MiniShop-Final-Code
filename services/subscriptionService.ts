import { PlanId } from '@/constants/plans';
import { auth } from './firebase';

const FUNCTIONS_BASE_URL = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL;

export async function createCheckoutSession(plan: PlanId) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('You must be logged in.');
  const res = await fetch(`${FUNCTIONS_BASE_URL}/createCheckoutSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to create checkout session.');
  return data.url as string;
}

export async function createCustomerPortal() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('You must be logged in.');
  const res = await fetch(`${FUNCTIONS_BASE_URL}/createCustomerPortal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to create billing portal.');
  return data.url as string;
}

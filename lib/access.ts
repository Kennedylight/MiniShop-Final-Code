// lib/access.ts
import { PlanId } from "@/constants/plans";

type Owner = {
  plan?: string;
  subscriptionStatus?: string;
  trialEndsAt?: number;
};

export function effectivePlan(owner: Owner | null): PlanId {
  return (owner?.plan as PlanId) || "starter";
}

export function isTrialActive(owner: Owner | null): boolean {
  if (!owner?.trialEndsAt) return false;
  return owner.trialEndsAt > Date.now();
}

export function trialDaysLeft(owner: Owner | null): number {
  if (!owner?.trialEndsAt) return 0;
  const diff = owner.trialEndsAt - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function hasActiveAccess(owner: Owner | null): boolean {
  if (isTrialActive(owner)) return true;
  return owner?.subscriptionStatus === "active";
}
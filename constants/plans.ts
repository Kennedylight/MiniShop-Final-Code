export type PlanId = "starter" | "business" | "premium";

export const PLANS = {
  starter: {
    id: "starter" as PlanId,
    name: "Starter",
    priceLabel: "$8.99 / month",
    photoLimit: 5,
  },
  business: {
    id: "business" as PlanId,
    name: "Business",
    priceLabel: "$12.99 / month",
    photoLimit: 10,
  },
  premium: {
    id: "premium" as PlanId,
    name: "Premium",
    priceLabel: "$14.99 / month",
    photoLimit: 15,
  },
};

export const MAX_PHOTOS = 15;

export function getPhotoLimit(plan?: PlanId | null) {
  if (!plan) return 0;
  return PLANS[plan]?.photoLimit ?? 0;
}

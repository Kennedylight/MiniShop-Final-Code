import { PlanId } from "@/constants/plans";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "inactive";
export type AccountStatus = "active" | "suspended" | "disabled";

export type Owner = {
  ownerId: string;
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  shopName: string;
  shopSlug: string;
  logoUrl?: string;
  businessDescription?: string;
  businessCategory?: string;
  address?: string;
  deliveryInfo?: string;
  orderInstructions?: string;
  plan?: PlanId;
  currency?: string;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  accountStatus: AccountStatus;
  createdAt: number;
  updatedAt: number;
};

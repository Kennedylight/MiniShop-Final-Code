import * as admin from "firebase-admin";
import { onRequest, Request } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import Stripe from "stripe";
import cors from "cors";
import twilio from "twilio";

admin.initializeApp();
const db = admin.firestore();
const allowCors = cors({ origin: true });

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

// Essai gratuit (jours) — source de vérité côté serveur.
const TRIAL_DAYS = 3;
const TRIAL_PLAN = "business";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
    _stripe = new Stripe(key, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  business: process.env.STRIPE_PRICE_BUSINESS,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

async function getUidFromAuthHeader(req: Request) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new Error("Missing auth token");
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

/**
 * Essai gratuit, posé côté serveur à la création du doc owner.
 * Le client ne décide donc pas des champs d'abonnement : quelle que soit la
 * valeur écrite à l'inscription (web ou mobile), le serveur fait foi.
 * Idempotent (onCreate ne se déclenche qu'une fois) ; n'écrase jamais un
 * abonnement déjà actif.
 */
/**
 * Pose la custom claim { admin: true } sur un compte Firebase Auth.
 * Appelable uniquement par un compte déjà admin (ou en premier boot via
 * la console Firebase → Extensions → Run function).
 * Usage : POST avec Authorization: Bearer <token> et body { targetUid: "..." }
 */
export const setAdminClaim = onRequest({ invoker: "public" }, (req, res) =>
  allowCors(req, res, async () => {
    try {
      if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

      // Vérifie que l'appelant est lui-même admin
      const callerUid = await getUidFromAuthHeader(req);
      const callerToken = await admin.auth().getUser(callerUid);
      const isCallerAdmin = callerToken.customClaims?.admin === true;

      // Bootstrap : si aucun admin n'existe encore, autorise la première pose
      const { targetUid, bootstrapSecret } = req.body;
      const validBootstrap =
        process.env.ADMIN_BOOTSTRAP_SECRET &&
        bootstrapSecret === process.env.ADMIN_BOOTSTRAP_SECRET;

      if (!isCallerAdmin && !validBootstrap)
        return res.status(403).json({ error: "Forbidden" });

      if (!targetUid || typeof targetUid !== "string")
        return res.status(400).json({ error: "targetUid required" });

      await admin.auth().setCustomUserClaims(targetUid, { admin: true });
      console.log(`[setAdminClaim] admin claim set on ${targetUid}`);
      return res.json({ ok: true, uid: targetUid });
    } catch (e) {
      return res.status(500).json({ error: errorMessage(e) });
    }
  }),
);

/**
 * Révoque la custom claim admin d'un utilisateur.
 */
export const revokeAdminClaim = onRequest({ invoker: "public" }, (req, res) =>
  allowCors(req, res, async () => {
    try {
      if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

      const callerUid = await getUidFromAuthHeader(req);
      const callerToken = await admin.auth().getUser(callerUid);
      if (callerToken.customClaims?.admin !== true)
        return res.status(403).json({ error: "Forbidden" });

      const { targetUid } = req.body;
      if (!targetUid || typeof targetUid !== "string")
        return res.status(400).json({ error: "targetUid required" });

      await admin.auth().setCustomUserClaims(targetUid, { admin: false });
      console.log(`[revokeAdminClaim] admin claim revoked on ${targetUid}`);
      return res.json({ ok: true, uid: targetUid });
    } catch (e) {
      return res.status(500).json({ error: errorMessage(e) });
    }
  }),
);

export const grantTrialOnOwnerCreate = onDocumentCreated(
  "owners/{ownerId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();

    // Garde-fou : ne pas dégrader un compte déjà payant.
    if (data.subscriptionStatus === "active") return;

    const now = Date.now();
    await snap.ref.set(
      {
        plan: TRIAL_PLAN,
        subscriptionStatus: "trialing",
        trialEndsAt: now + TRIAL_DAYS * 24 * 60 * 60 * 1000,
        updatedAt: now,
      },
      { merge: true },
    );
    console.log(
      `[grantTrial] owner ${event.params.ownerId} → essai ${TRIAL_DAYS}j (business)`,
    );
  },
);

/**
 * Rappels d'expiration d'essai par WhatsApp (standard e-shop).
 * Tourne chaque jour : prévient à J-1 puis le jour J, une seule fois chacun
 * (drapeaux trialReminderJ1Sent / trialReminderJ0Sent).
 */
export const sendTrialReminders = onSchedule("0 9 * * *", async () => {
  const WEB_BASE = process.env.WEB_BASE_URL || "https://ministores.shop";
  const billingUrl = `${WEB_BASE}/dashboard/billing`;
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const snap = await db
    .collection("owners")
    .where("subscriptionStatus", "==", "trialing")
    .get();

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  for (const doc of snap.docs) {
    const o = doc.data();
    const endsAt: number | undefined = o.trialEndsAt;
    if (typeof endsAt !== "number" || !o.whatsapp) continue;
    const remaining = endsAt - now;

    let body: string | null = null;
    const patch: Record<string, unknown> = {};

    if (remaining > 0 && remaining <= DAY && !o.trialReminderJ1Sent) {
      body = `MiniShop — Bonjour ${o.fullName || ""}, votre essai gratuit se termine demain. Choisissez un plan pour garder votre boutique en ligne : ${billingUrl}`;
      patch.trialReminderJ1Sent = true;
    } else if (remaining <= 0 && !o.trialReminderJ0Sent) {
      body = `MiniShop — Votre essai gratuit est terminé. Votre boutique est masquée jusqu'à la souscription d'un plan : ${billingUrl}`;
      patch.trialReminderJ0Sent = true;
    }

    if (!body) continue;
    try {
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${o.whatsapp}`,
        body,
      });
      await doc.ref.set({ ...patch, updatedAt: now }, { merge: true });
      console.log(`[trialReminder] sent to ${doc.id}`);
    } catch (err) {
      console.error(`[trialReminder] failed for ${doc.id}`, errorMessage(err));
    }
  }
});

export const createCheckoutSession = onRequest({ invoker: "public" }, (req, res) =>
  allowCors(req, res, async () => {
    try {
      if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });
      const uid = await getUidFromAuthHeader(req);
      const { plan, returnBaseUrl } = req.body;
      if (!["starter", "business", "premium"].includes(plan))
        return res.status(400).json({ error: "Invalid plan" });

      const priceId = PRICE_BY_PLAN[plan];
      if (!priceId)
        return res
          .status(500)
          .json({ error: `No Stripe price configured for plan "${plan}".` });

      const ownerRef = db.collection("owners").doc(uid);
      const ownerSnap = await ownerRef.get();
      const owner = ownerSnap.data();
      if (!owner) return res.status(404).json({ error: "Owner not found" });

      let customerId = owner.stripeCustomerId;
      if (!customerId) {
        const customer = await getStripe().customers.create({
          email: owner.email,
          name: owner.fullName,
          metadata: { ownerId: uid },
        });
        customerId = customer.id;
        await ownerRef.update({ stripeCustomerId: customerId });
      }

      const base = returnBaseUrl || "minishop://";
      const successUrl = base.startsWith("http")
        ? `${base}/dashboard/billing?success=true`
        : "minishop://dashboard/billing?success=true";
      const cancelUrl = base.startsWith("http")
        ? `${base}/pricing?cancel=true`
        : "minishop://pricing?cancel=true";

      const session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { ownerId: uid, plan },
      });
      return res.json({ url: session.url });
    } catch (e) {
      return res.status(500).json({ error: errorMessage(e) });
    }
  }),
);

export const createCustomerPortal = onRequest({ invoker: "public" }, (req, res) =>
  allowCors(req, res, async () => {
    try {
      if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });
      const uid = await getUidFromAuthHeader(req);
      const { returnBaseUrl } = req.body;
      const owner = (await db.collection("owners").doc(uid).get()).data();
      if (!owner?.stripeCustomerId)
        return res.status(400).json({ error: "No Stripe customer found." });
      const base = returnBaseUrl || "minishop://";
      const returnUrl = base.startsWith("http")
        ? `${base}/dashboard/billing`
        : "minishop://dashboard/billing";
      const session = await getStripe().billingPortal.sessions.create({
        customer: owner.stripeCustomerId,
        return_url: returnUrl,
      });
      return res.json({ url: session.url });
    } catch (e) {
      return res.status(500).json({ error: errorMessage(e) });
    }
  }),
);

export const stripeWebhook = onRequest({ invoker: "public" }, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.rawBody,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${errorMessage(err)}`);
    return;
  }

  console.log(`[stripeWebhook] received ${event.type}`);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const ownerId = session.metadata?.ownerId;
      const plan = session.metadata?.plan;
      if (!ownerId) {
        console.warn("[stripeWebhook] checkout.session.completed without ownerId metadata");
      } else {
        // set(merge) plutôt que update() : robuste même si le doc a un souci,
        // n'écrase pas les autres champs (cf. SPEC §409).
        await db.collection("owners").doc(ownerId).set(
          {
            plan,
            subscriptionStatus: "active",
            stripeSubscriptionId: session.subscription,
            updatedAt: Date.now(),
          },
          { merge: true },
        );
        console.log(`[stripeWebhook] owner ${ownerId} activated on plan ${plan}`);
      }
    }

    if (event.type.startsWith("customer.subscription.")) {
      const sub = event.data.object as Stripe.Subscription;
      const ownerSnap = await db
        .collection("owners")
        .where("stripeCustomerId", "==", sub.customer)
        .limit(1)
        .get();
      if (ownerSnap.empty) {
        console.warn(`[stripeWebhook] no owner for customer ${sub.customer}`);
      } else {
        const ownerDoc = ownerSnap.docs[0];
        // Ne pas écraser un plan activé manuellement par un admin.
        if (ownerDoc.data().manualPlan === true) {
          console.log(`[stripeWebhook] skipping manual plan owner ${ownerDoc.id}`);
        } else {
          await ownerDoc.ref.set(
            {
              subscriptionStatus: sub.status,
              stripeSubscriptionId: sub.id,
              updatedAt: Date.now(),
            },
            { merge: true },
          );
          console.log(
            `[stripeWebhook] owner ${ownerDoc.id} status → ${sub.status}`,
          );
        }
      }
    }
  } catch (err) {
    console.error("[stripeWebhook] handler error", err);
    res.status(500).send(`Handler error: ${errorMessage(err)}`);
    return;
  }

  res.json({ received: true });
});

type OrderNotificationItem = { name: string; quantity: number; price: number };

type OrderNotificationData = {
  items: OrderNotificationItem[];
  shopName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  estimatedTotal: number;
  notes?: string;
};

function buildOrderMessage(order: OrderNotificationData) {
  const lines = order.items
    .map(
      (i, idx) =>
        `${idx + 1}. ${i.name} — Qty: ${i.quantity} — $${i.price}`,
    )
    .join("\n");
  return `New order received on MiniShop.\n\nShop: ${order.shopName}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nDelivery: ${order.deliveryAddress}\n\nOrder Details:\n${lines}\n\nEstimated Total: $${order.estimatedTotal}\nNotes: ${order.notes || "None"}\n\nPlease log in to your MiniShop app to process this order.`;
}

export const sendNewOrderNotification = onRequest({ invoker: "public" }, (req, res) =>
  allowCors(req, res, async () => {
    try {
      const { orderId } = req.body;
      const orderSnap = await db.collection("orders").doc(orderId).get();
      const order = orderSnap.data();
      if (!order) return res.status(404).json({ error: "Order not found" });
      const owner = (
        await db.collection("owners").doc(order.ownerId).get()
      ).data();
      if (!owner?.whatsapp)
        return res.json({ ok: true, skipped: "No owner WhatsApp number." });

      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${owner.whatsapp}`,
        // Cast justifié : la forme du document `orders` est garantie par
        // orderService.ts côté client, Firestore ne la type pas statiquement.
        body: buildOrderMessage(order as OrderNotificationData),
      });
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: errorMessage(e) });
    }
  }),
);

export const sendOrderStatusNotification = onRequest({ invoker: "public" }, (req, res) =>
  allowCors(req, res, async () => {
    try {
      const { orderId, status } = req.body;
      const orderSnap = await db.collection("orders").doc(orderId).get();
      const order = orderSnap.data();
      if (!order?.customerWhatsapp)
        return res.json({ ok: true, skipped: "No customer WhatsApp number." });
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${order.customerWhatsapp}`,
        body: `Hello ${order.customerName}, your order from ${order.shopName} is now: ${String(status).replace(/_/g, " ")}.`,
      });
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: errorMessage(e) });
    }
  }),
);

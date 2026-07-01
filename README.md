# MiniShop Mobile App

React Native / Expo + Firebase + Stripe starter code for MiniShop.

MiniShop lets small business owners create a mobile store, upload product photos based on subscription plan, share a store link, receive orders, and manage order status. Customer product payments are handled outside MiniShop; only owner subscriptions use Stripe.

## Plans

- Starter: up to 5 product photos
- Business: up to 10 product photos
- Premium: up to 15 product photos maximum

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add Firebase/Stripe values.

3. Create Firebase project:
- Enable Email/Password Authentication
- Enable Firestore
- Enable Storage
- Deploy `firebase.rules` and `storage.rules`
- Deploy Cloud Functions from `functions/`

4. Start Expo:

```bash
npm run start
```

## Firebase collections

- owners/{ownerId}
- products/{productId}
- orders/{orderId}
- subscriptions/{ownerId}
- adminUsers/{adminId}

## Stripe

Backend Cloud Functions create Checkout and Billing Portal sessions. Stripe webhooks update Firestore subscription fields.

## Important production tasks

- Replace placeholder icons/images in assets.
- Add stronger Cloud Function validation.
- Add admin custom claims for Super Admin.
- Configure WhatsApp/Twilio credentials.
- Configure Stripe webhook endpoint and price IDs.
- Test iOS and Android builds with EAS.

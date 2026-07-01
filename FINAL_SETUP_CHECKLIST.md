# MiniShop Final Setup Checklist

This folder contains the MiniShop React Native / Expo app plus Firebase Cloud Functions.

## 1. Install mobile dependencies

```bash
npm install
npx expo start
```

## 2. Configure Firebase

Create a Firebase project and enable:

- Authentication: Email/Password
- Firestore Database
- Firebase Storage
- Firebase Cloud Functions

Copy `.env.example` to `.env` and fill in the Firebase public values.

## 3. Configure Stripe

Create 3 recurring Stripe prices in the Stripe dashboard, then put their IDs in
`.env` (they are read by `constants/plans.ts`, no longer hardcoded):

- `EXPO_PUBLIC_STRIPE_PRICE_STARTER`
- `EXPO_PUBLIC_STRIPE_PRICE_BUSINESS`
- `EXPO_PUBLIC_STRIPE_PRICE_PREMIUM`

Use these plans:

- Starter: 5 photos
- Business: 10 photos
- Premium: 15 photos maximum

Set the function secrets (never commit them):

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

## 4. Configure Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

Add environment variables for:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`

## 5. Deploy rules

```bash
firebase deploy --only firestore:rules,storage
```

## 6. Mobile build

For testing:

```bash
npx expo start
```

For store builds:

```bash
eas build -p ios
EAS build -p android
```

## 7. Create a super admin

Admin access is granted via the Firebase custom claim `admin: true` (checked by
`app/admin/index.tsx` and the Firestore rules). There is no signup UI for it.

1. The person signs up normally in the app (email/password).
2. Download a service account key from Firebase Console > Project settings > Service accounts.
3. Run the script (from the `functions/` folder):

```bash
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json   # bash
node scripts/setAdmin.js owner@example.com                    # grant
node scripts/setAdmin.js owner@example.com --revoke           # revoke
```

4. The user signs out and back in to refresh the token.

## Notes

MiniShop processes only owner subscriptions through Stripe. Customer product payments are handled outside the app between owner and customer.

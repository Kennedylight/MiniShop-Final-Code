# MiniShop Web — Spécification d'implémentation complète

> Document de référence pour construire **l'application web MiniShop** à partir des spécifications de l'app mobile React Native / Expo existante.
> **Stack imposée :** Vite + React 18 + TypeScript + Tailwind CSS + Motion (animations) + lucide-react (icônes) + i18n (react-i18next, FR/EN/ES).
> **Backend :** réutilise **à l'identique** le projet Firebase de l'app mobile (`mystore-ff354`) — Auth, Firestore, Storage, et les mêmes Cloud Functions (Stripe + Twilio/WhatsApp).
> **Ampleur :** version **riche** — reproduit 100 % des fonctionnalités mobiles **et** ajoute les améliorations web listées en §13.

---

## Table des matières

1. [Objectif et principes](#1-objectif-et-principes)
2. [Stack technique détaillée](#2-stack-technique-détaillée)
3. [Architecture du projet (arborescence)](#3-architecture-du-projet-arborescence)
4. [Réutilisation du backend Firebase](#4-réutilisation-du-backend-firebase)
5. [Modèles de données (TypeScript)](#5-modèles-de-données-typescript)
6. [Couche services (parité mobile + web)](#6-couche-services-parité-mobile--web)
7. [Routing complet](#7-routing-complet)
8. [Spécification écran par écran](#8-spécification-écran-par-écran)
9. [Système de design (tokens, thème, dark mode)](#9-système-de-design-tokens-thème-dark-mode)
10. [Animations et micro-interactions (Motion)](#10-animations-et-micro-interactions-motion)
11. [Internationalisation (FR/EN/ES)](#11-internationalisation-fresen)
12. [Bibliothèque de composants UI](#12-bibliothèque-de-composants-ui)
13. [Fonctionnalités web enrichies](#13-fonctionnalités-web-enrichies)
14. [Gestion d'état](#14-gestion-détat)
15. [Sécurité et variables d'environnement](#15-sécurité-et-variables-denvironnement)
16. [Ajustements requis côté Cloud Functions](#16-ajustements-requis-côté-cloud-functions)
17. [Accessibilité, performance, SEO](#17-accessibilité-performance-seo)
18. [Tests et qualité](#18-tests-et-qualité)
19. [Déploiement](#19-déploiement)
20. [Checklist de parité fonctionnelle](#20-checklist-de-parité-fonctionnelle)
21. [Plan d'implémentation par phases](#21-plan-dimplémentation-par-phases)

---

## 1. Objectif et principes

Construire la version **web** de MiniShop, l'application qui permet à de petits commerçants de créer une mini-boutique en ligne, d'ajouter des produits selon un quota lié à leur abonnement, de partager un lien public de boutique, de recevoir des commandes de clients non authentifiés, et de gérer le statut des commandes.

**Rappel du modèle économique (inchangé) :**
- Seul **l'abonnement du commerçant** transite par Stripe (mensuel récurrent).
- Le **paiement des produits par le client** est **hors plateforme** (réglé directement entre client et commerçant).
- L'unité vendue = **nombre de photos de produits** : Starter (5), Business (10), Premium (15 = maximum absolu).

**Principes directeurs du web :**
1. **Parité fonctionnelle totale** avec le mobile (cf. §20), puis enrichissement (§13).
2. **Même backend, mêmes règles** : aucun changement de schéma Firestore (sauf champs déjà prévus dans les types comme `logoUrl`).
3. **Design « wow »** : interface moderne, animée, responsive mobile-first, avec dark mode et 3 langues.
4. **La vitrine publique est désormais une vraie page web** accessible par URL (`/{slug}`) — c'est la destination du lien partagé depuis le mobile (`EXPO_PUBLIC_PUBLIC_STORE_BASE_URL`).
5. **Corriger les bugs identifiés dans le mobile** (cf. analyse) : `setDoc` du profil sans merge, déconnexion absente, push non branché, etc.

---

## 2. Stack technique détaillée

| Domaine | Choix | Notes |
|---|---|---|
| Build / dev | **Vite** | `npm create vite@latest minishop-web -- --template react-ts` |
| UI lib | **React 18 + TypeScript** | Strict mode TS activé |
| Styling | **Tailwind CSS v3** | + `tailwindcss-animate`, plugin `@tailwindcss/forms` |
| Animations | **Motion** (`motion` / framer-motion) | `import { motion, AnimatePresence } from 'motion/react'` |
| Icônes | **lucide-react** | Cohérence d'iconographie |
| i18n | **react-i18next** + `i18next-browser-languagedetector` | FR (défaut), EN, ES |
| Routing | **react-router-dom v6** | Routes publiques / protégées / admin |
| Backend SDK | **firebase v12** (web) | `firebase/app`, `/auth`, `/firestore`, `/storage` |
| Formulaires | **react-hook-form** + **zod** (`@hookform/resolvers`) | Validation typée |
| État global | **zustand** | Auth store, panier, thème, langue |
| Data fetching | **@tanstack/react-query** | Cache, revalidation, états loading/error |
| Toasts | **sonner** | Remplace les `Alert` natifs du mobile |
| Graphiques | **recharts** | Dashboard analytics |
| QR code | **qrcode.react** | QR de la boutique |
| Dates | **date-fns** (+ locales fr/en/es) | Formatage relatif des commandes |
| Composants « wow » | **MCP 21st.dev Magic** | Génération de composants animés premium |
| Lint/format | ESLint + Prettier | |

> **Note Stripe :** sur le web, on n'utilise pas `@stripe/stripe-react-native`. Le Checkout et le Billing Portal restent **redirigés via URL** (`window.location.href = url`) renvoyée par les Cloud Functions. Pas de SDK Stripe front nécessaire (Stripe Checkout hébergé).

---

## 3. Architecture du projet (arborescence)

```
minishop-web/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── .env                          # variables VITE_*
├── .env.example
├── public/
│   ├── favicon.svg
│   └── og-image.png
└── src/
    ├── main.tsx                  # bootstrap React + Router + Providers
    ├── App.tsx                   # définition des routes
    ├── index.css                 # directives Tailwind + variables CSS thème
    │
    ├── lib/
    │   ├── firebase.ts           # init Firebase web (auth/db/storage)
    │   ├── queryClient.ts        # React Query
    │   └── utils.ts              # cn(), slugify(), formatters
    │
    ├── config/
    │   ├── plans.ts              # PLANS, MAX_PHOTOS, getPhotoLimit (copie mobile)
    │   └── env.ts                # accès typé aux variables d'env
    │
    ├── types/
    │   ├── owner.ts
    │   ├── product.ts
    │   └── order.ts
    │
    ├── services/
    │   ├── authService.ts
    │   ├── productService.ts
    │   ├── orderService.ts
    │   ├── subscriptionService.ts
    │   └── analyticsService.ts   # NOUVEAU (agrégations dashboard)
    │
    ├── stores/
    │   ├── authStore.ts          # user + owner courant
    │   ├── cartStore.ts          # panier multi-produits (NOUVEAU)
    │   ├── themeStore.ts         # dark/light (NOUVEAU)
    │   └── uiStore.ts            # langue, sidebar, modales
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useOwner.ts
    │   ├── useProducts.ts
    │   ├── useOrders.ts          # temps réel (onSnapshot)
    │   └── useMediaQuery.ts
    │
    ├── i18n/
    │   ├── index.ts              # config i18next
    │   └── locales/
    │       ├── fr.json
    │       ├── en.json
    │       └── es.json
    │
    ├── components/
    │   ├── ui/                   # primitives (Button, Input, Card, Modal, …)
    │   ├── layout/               # AppShell, Sidebar, Topbar, Footer
    │   ├── marketing/            # Hero, FeatureGrid, PricingTable
    │   ├── dashboard/            # StatCard, OrdersTable, ProductForm, …
    │   ├── shop/                 # StorefrontHeader, ProductGrid, CartDrawer
    │   └── common/               # LanguageSwitcher, ThemeToggle, EmptyState, Skeletons
    │
    ├── pages/
    │   ├── public/               # Landing, Login, Signup, ResetPassword, Pricing
    │   ├── dashboard/            # Overview, Products, Orders, Profile, Share, Billing, Settings
    │   ├── shop/                 # Storefront, Checkout, Confirmation
    │   ├── admin/                # AdminDashboard
    │   └── NotFound.tsx
    │
    └── routes/
        ├── ProtectedRoute.tsx    # garde owner
        └── AdminRoute.tsx        # garde admin (custom claim)
```

---

## 4. Réutilisation du backend Firebase

**Aucune nouvelle infrastructure.** L'app web se connecte au **même projet** que le mobile.

### `src/lib/firebase.ts`

```ts
import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,        // mystore-ff354
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);   // équivaut à AsyncStorage du mobile
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**Différences mobile → web :**
- Persistance auth : `browserLocalPersistence` (au lieu de `getReactNativePersistence(AsyncStorage)`).
- Sélection d'image : `<input type="file" accept="image/*">` (au lieu de `expo-image-picker`).
- Partage : Web Share API (`navigator.share`) avec fallback copie presse-papiers (au lieu de `Share.share` natif).
- Ouverture Stripe : `window.location.href = url` (au lieu de `Linking.openURL`).
- Notifications push : optionnel — Firebase Cloud Messaging Web (au lieu d'expo-notifications). WhatsApp/Twilio reste géré côté Cloud Functions sans changement.

**Collections Firestore réutilisées telles quelles :** `owners/{ownerId}`, `products/{productId}`, `orders/{orderId}`, `subscriptions/{ownerId}`, `adminUsers/{adminId}`.

**Cloud Functions appelées telles quelles** (via `fetch` vers `VITE_FUNCTIONS_BASE_URL`) : `createCheckoutSession`, `createCustomerPortal`, `sendNewOrderNotification`, `sendOrderStatusNotification`, `stripeWebhook`. ⚠️ Voir §16 pour l'ajustement des `success_url`/`cancel_url` (actuellement en deep-link `minishop://`).

---

## 5. Modèles de données (TypeScript)

Repris **à l'identique** du mobile (`types/`), pour garantir la compatibilité Firestore.

```ts
// types/owner.ts
export type PlanId = 'starter' | 'business' | 'premium';
export type SubscriptionStatus =
  | 'trialing' | 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'inactive';
export type AccountStatus = 'active' | 'suspended' | 'disabled';

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
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  accountStatus: AccountStatus;
  createdAt: number;
  updatedAt: number;
};

// types/product.ts
export type Product = {
  productId: string;
  ownerId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;
  quantity?: number;
  createdAt: number;
  updatedAt: number;
};

// types/order.ts
export type OrderStatus =
  | 'new' | 'confirmed' | 'in_process' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';
export type OrderItem = {
  productId: string; name: string; price: number; quantity: number; imageUrl?: string;
};
export type Order = {
  orderId: string;
  ownerId: string;
  shopName: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  deliveryAddress: string;
  notes?: string;
  items: OrderItem[];
  estimatedTotal: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
};
```

`config/plans.ts` (copie exacte) :

```ts
export const PLANS = {
  starter: { id: 'starter', name: 'Starter', priceLabel: '$4.99 / month', photoLimit: 5, stripePriceId: 'price_replace_starter' },
  business:{ id: 'business', name: 'Business', priceLabel: '$9.99 / month', photoLimit: 10, stripePriceId: 'price_replace_business' },
  premium: { id: 'premium', name: 'Premium', priceLabel: '$14.99 / month', photoLimit: 15, stripePriceId: 'price_replace_premium' },
} as const;
export const MAX_PHOTOS = 15;
export const getPhotoLimit = (plan?: PlanId | null) => (plan ? PLANS[plan]?.photoLimit ?? 0 : 0);
```

---

## 6. Couche services (parité mobile + web)

Porter les services du mobile vers le SDK web. **Signatures identiques** pour faciliter la traçabilité.

### `authService.ts`
- `slugify(value)` — identique.
- `registerOwner({ fullName, email, password, shopName, whatsapp, phone? })` — `createUserWithEmailAndPassword`, `updateProfile`, crée `owners/{uid}` avec `subscriptionStatus:'inactive'`, `accountStatus:'active'`, `shopSlug` généré, `createdAtServer: serverTimestamp()`.
- `loginOwner(email, password)`, `resetPassword(email)`, `logoutOwner()`, `getCurrentOwner(uid)`.

### `productService.ts`
- `listOwnerProducts(ownerId)` — `where ownerId == X orderBy createdAt desc` (créer l'index composite, cf. §15).
- `uploadProductImage(ownerId, file: File)` — **web** : upload direct du `File`/`Blob` via `uploadBytes(ref(storage, 'products/{ownerId}/{timestamp}.{ext}'), file)`. Pas de `fetch(uri)` comme en mobile.
- `addProduct(ownerId, plan, input)` — **applique le quota** : refuse si `>= getPhotoLimit(plan)` ou `>= MAX_PHOTOS`.
- `updateProduct(productId, data)` — `setDoc(..., { merge: true })`.
- `deleteProduct(productId)` — **+ supprimer aussi l'image Storage** associée (amélioration : éviter les fichiers orphelins).
- `toggleAvailability(productId, isAvailable)` — NOUVEAU helper.

### `orderService.ts`
- `createOrder(input)` — crée la commande (`status:'new'`), puis `POST .../sendNewOrderNotification` (fire-and-forget). **Web enrichi** : supporte un **panier multi-produits** (`items: OrderItem[]`, `estimatedTotal = Σ price*qty`).
- `subscribeOwnerOrders(ownerId, cb)` — `onSnapshot`, tri `createdAt` desc.
- `updateOrderStatus(orderId, status)` — `setDoc merge` + `POST .../sendOrderStatusNotification`.
- `cancelOrder(orderId)` — NOUVEAU (statut `cancelled`).
- `findShopBySlug(slug)` — `where shopSlug == slug`.

### `subscriptionService.ts`
- `createCheckoutSession(plan)` — `POST` avec Bearer token, renvoie l'URL Checkout. **Web** : passer aussi `returnBaseUrl: window.location.origin` (cf. §16).
- `createCustomerPortal()` — idem, renvoie l'URL du portail.

### `analyticsService.ts` (NOUVEAU)
- `getOwnerStats(ownerId)` — agrège : nombre total de commandes, par statut, chiffre d'affaires estimé (Σ `estimatedTotal` des commandes `completed`), nombre de produits, panier moyen, série temporelle des commandes (par jour/semaine pour les graphiques).

---

## 7. Routing complet

`react-router-dom v6`. Trois zones.

| Route | Page | Accès | Équivalent mobile |
|---|---|---|---|
| `/` | Landing | public | `app/index.tsx` |
| `/login` | Login | public (redirige si connecté) | `app/login.tsx` |
| `/signup` | Signup | public | `app/signup.tsx` |
| `/reset-password` | ResetPassword | public | `app/reset-password.tsx` |
| `/pricing` | Pricing | public/connecté | `app/pricing.tsx` |
| `/dashboard` | Overview (stats) | **owner** | `app/dashboard/index.tsx` (enrichi) |
| `/dashboard/products` | Products | owner | `app/dashboard/products.tsx` |
| `/dashboard/orders` | Orders | owner | `app/dashboard/orders.tsx` |
| `/dashboard/orders/:orderId` | OrderDetail | owner | NOUVEAU |
| `/dashboard/profile` | Profile | owner | `app/dashboard/profile.tsx` |
| `/dashboard/share` | Share | owner | `app/dashboard/share.tsx` |
| `/dashboard/billing` | Billing | owner | `app/dashboard/billing.tsx` |
| `/dashboard/settings` | Settings | owner | NOUVEAU (langue, thème, déconnexion, danger zone) |
| `/admin` | AdminDashboard | **admin claim** | `app/admin/index.tsx` (enrichi) |
| `/:slug` | Storefront | **public** | `app/shop/[slug].tsx` |
| `/:slug/checkout` | Checkout | public | `app/shop/checkout.tsx` |
| `/:slug/confirmation` | Confirmation | public | `app/shop/confirmation.tsx` |
| `*` | NotFound | public | — |

**Gardes :**
- `ProtectedRoute` : redirige vers `/login` si non connecté (équivaut à la garde du `_layout.tsx` mobile). Mémorise l'URL d'origine pour y revenir après login.
- `AdminRoute` : vérifie `getIdTokenResult().claims.admin === true`, sinon page « Unauthorized ».
- Pages d'auth : redirigent vers `/dashboard` si déjà connecté.

> **Conflit de route à gérer** : `/:slug` est attrape-tout au premier niveau. Réserver les slugs système (`login`, `signup`, `pricing`, `dashboard`, `admin`, `reset-password`) pour qu'ils ne soient pas interprétés comme des boutiques. Définir les routes système **avant** la route `/:slug` et/ou valider que le slug existe.

---

## 8. Spécification écran par écran

> Chaque écran doit avoir : états **loading** (skeletons), **vide**, **erreur** (toast `sonner`), **succès**, et des **animations d'entrée** (Motion). Tous les textes passent par i18n.

### 8.1 Landing (`/`)
Reprend l'accueil mobile en version desktop premium :
- **Hero** plein écran sur fond bleu nuit (`#06163A`) avec dégradé animé, logo, kicker « iOS, Android & Web store platform », titre « Your Mini Store. Big Possibilities. », sous-titre, CTA **Get Started** / **Login**.
- **Feature grid** animée (🛒 Create Store, 🔗 Share Link, 📦 Receive Orders) avec apparition au scroll (Motion `whileInView`).
- **Section Pricing** (les 3 plans) avec toggle visuel.
- **Bandeau de confiance** « Secure. Simple. Reliable. ».
- Header sticky avec `LanguageSwitcher` + `ThemeToggle`. Footer.
- Mention plans par photos.

### 8.2 Login (`/login`)
Carte centrée : email, mot de passe (avec bouton afficher/masquer), bouton **Login** (état loading), lien **Forgot password?**, lien vers signup. Validation zod. Toast d'erreur. Redirection `/dashboard`.

### 8.3 Signup (`/signup`)
Formulaire : nom du propriétaire, nom de la boutique (affiche un **aperçu live du slug** : `monboutique` → `votredomaine/mon-boutique`), email, WhatsApp, mot de passe (indicateur de force). Validation zod. Après succès → `/pricing`.

### 8.4 ResetPassword (`/reset-password`)
Champ email, bouton **Send Reset Link**, message de confirmation (toast + état « email envoyé »).

### 8.5 Pricing (`/pricing`)
Les 3 `PricingCard` (Starter/Business/Premium), Business mis en avant (« Most Popular »), Premium marqué « (MAX) ». Chaque carte liste les bénéfices. Clic → `createCheckoutSession` → redirection Stripe. Gérer le retour `?success=true` / `?cancel=true` (toast + refresh de l'owner).

### 8.6 Dashboard Overview (`/dashboard`) — ENRICHI
Au lieu d'un simple menu :
- **Cartes statistiques** (StatCard animées) : commandes totales, commandes nouvelles/en cours, CA estimé, produits (X/limite).
- **Graphique** des commandes dans le temps (recharts, area chart).
- **Répartition par statut** (donut).
- **Dernières commandes** (mini-table) + lien « voir tout ».
- **Alerte de quota** si proche de la limite de photos.
- **Bandeau d'abonnement** si `subscriptionStatus !== 'active'` (CTA vers billing).
- Layout avec **Sidebar** (Overview, Products, Orders, Share, Billing, Settings) + **Topbar** (nom boutique, avatar/logo, langue, thème, menu déconnexion).

### 8.7 Products (`/dashboard/products`)
- En-tête : titre + compteur « X/limite photos used. Max 15. » avec **barre de progression**.
- Bouton **+ Add Product** ouvrant un **modal/drawer** avec formulaire (nom, prix, description, catégorie, disponibilité toggle, **upload image avec aperçu + recadrage/preview**).
- **Grille** de `ProductCard` (responsive) avec actions Edit / Delete / toggle disponibilité.
- **Recherche + filtres** (par catégorie, par disponibilité) — NOUVEAU.
- Quota appliqué : bouton d'ajout désactivé + message si limite atteinte.
- Confirmation de suppression via modal (pas `window.confirm`).

### 8.8 Orders (`/dashboard/orders`)
- **Temps réel** (`onSnapshot`).
- **Table/Liste** filtrable par statut (onglets : Toutes / New / En cours / Terminées / Annulées).
- Chaque ligne : numéro court, client, total, statut (badge coloré), date relative.
- Clic → **OrderDetail** (`/dashboard/orders/:orderId`) : détail client, articles, total, **timeline de statut** animée, boutons de transition (`nextStatuses`), bouton **Annuler**, bouton **Contacter le client sur WhatsApp** (`https://wa.me/<numéro>`).
- Notifications Twilio déclenchées à chaque transition (via service).
- **Badge temps réel** + son/toast à l'arrivée d'une nouvelle commande (NOUVEAU).

### 8.9 Profile (`/dashboard/profile`)
- Formulaire : nom boutique, WhatsApp, téléphone, description, catégorie, adresse, infos de livraison, instructions de commande, **upload logo** (`logoUrl`).
- ⚠️ **Corriger le bug mobile** : utiliser `updateDoc` / `setDoc(..., { merge: true })` pour ne pas écraser les champs Stripe/abonnement.
- Aperçu live de la fiche boutique.

### 8.10 Share (`/dashboard/share`)
- Affiche l'URL publique (`window.location.origin/{shopSlug}`) dans une carte.
- Boutons : **Copier**, **Partager** (Web Share API), **WhatsApp**, **Facebook**, **X/Twitter**, **Email**.
- **QR code** téléchargeable (PNG) — NOUVEAU.
- Aperçu de la carte de partage (Open Graph mock).

### 8.11 Billing (`/dashboard/billing`)
- Carte de l'abonnement courant (plan, statut, prochaine échéance si dispo).
- Bouton **Choose / Upgrade Plan** → `/pricing`.
- Bouton **Manage Billing** → portail Stripe.
- Historique/état d'abonnement.

### 8.12 Settings (`/dashboard/settings`) — NOUVEAU
- Sélecteur de **langue** (FR/EN/ES).
- Bascule **thème** (clair/sombre/système).
- **Déconnexion** (bouton présent — absent du mobile).
- **Danger zone** : suppression de compte (avec confirmation).

### 8.13 Storefront public (`/:slug`)
- Charge la boutique via `findShopBySlug`. Si introuvable → 404 boutique. Si `subscriptionStatus !== 'active'` → page « Store unavailable » élégante.
- **En-tête boutique** : logo, nom, description, badge de confiance.
- **Bandeau** : « Payment handled directly with the business owner outside MiniShop ».
- **Grille produits** disponibles (`isAvailable == true`), avec recherche/filtre par catégorie.
- **Panier multi-produits** (NOUVEAU) : ajout, quantités, drawer panier, total live. Persisté en `localStorage` par slug.
- Bouton **Checkout**.
- Responsive, animations d'apparition produit.

### 8.14 Checkout (`/:slug/checkout`)
- Récap du panier (articles, quantités, total estimé), modifiable.
- Bandeau vert « MiniShop does not collect product payments… ».
- Formulaire client : nom, téléphone, WhatsApp, adresse de livraison, notes. Validation zod.
- Bouton **Submit Order** → `createOrder` → `/:slug/confirmation`. Vide le panier.

### 8.15 Confirmation (`/:slug/confirmation`)
- Animation de succès (checkmark animé).
- Numéro de commande, nom boutique, message « le commerçant vous contactera ».
- Bouton **Continue shopping** (retour `/:slug`) et **Done** (retour `/`).

### 8.16 Admin (`/admin`) — ENRICHI
- Garde `admin` claim.
- **Stats globales** : nombre de commerçants, actifs/inactifs, répartition par plan.
- **Table** des commerçants (recherche, tri, filtre par statut/plan) : nom, email, statut, plan, date de création.
- Clic → détail commerçant (produits, commandes) — lecture seule.

---

## 9. Système de design (tokens, thème, dark mode)

### Palette (reprise du mobile + variantes dark)

```ts
// tailwind.config.ts — extend.colors
const colors = {
  primary:     '#FF6B00',   // orange (accent principal)
  primaryDark: '#06163A',   // bleu nuit (fond hero/splash)
  navy:        '#0B1F4D',
  blue:        '#0F3B82',
  secondary:   '#16A34A',   // vert (succès, plan premium)
  accent:      '#FFB703',   // jaune
  danger:      '#DC2626',
  // neutres clairs
  bg:    '#F7F9FC',
  card:  '#FFFFFF',
  ink:   '#071633',         // texte
  muted: '#68748A',
  border:'#E5EAF2',
};
```

- **Dark mode** : Tailwind `darkMode: 'class'`. Définir les variables CSS pour `bg`, `card`, `ink`, `muted`, `border` en clair et sombre (ex. dark bg `#0A1124`, card `#111A33`). Le `ThemeToggle` ajoute/retire `.dark` sur `<html>` et persiste le choix (`themeStore` + `localStorage`, défaut « système »).
- **Typo** : police moderne (ex. Inter ou Plus Jakarta Sans via `@fontsource`). Titres en `font-extrabold`/`font-black`, comme le mobile (`fontWeight 900`).
- **Rayons** : généreux (`rounded-2xl` à `rounded-[34px]` pour le hero), cohérents avec le mobile.
- **Ombres** : douces sur les cartes (`shadow-sm`/`shadow-md`), élévation au hover.
- **Bandeaux contextuels** : jaune (`#FEF3C7`/`#92400E`) pour avertissements vitrine, vert (`#ECFDF5`/`#065F46`) pour le checkout — repris du mobile.

### Tailwind config (extrait)

```ts
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { /* … */ }, borderRadius: { xl: '1rem', '2xl': '1.25rem' } } },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/forms')],
};
```

---

## 10. Animations et micro-interactions (Motion)

Utiliser **Motion** (`motion/react`) partout pour un rendu « wow ». Recommandations :

- **Transitions de page** : `AnimatePresence` + variants fade/slide entre routes.
- **Apparition au scroll** : `whileInView` avec `staggerChildren` pour les grilles (features, produits, pricing).
- **Hover/tap** : `whileHover={{ y: -4, scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}` sur cartes et boutons.
- **Hero** : dégradé/blobs animés en arrière-plan (boucle douce), texte en `staggered reveal`.
- **StatCards** : compteurs animés (count-up) + entrée en `spring`.
- **Timeline de commande** : progression animée du statut.
- **Confirmation** : checkmark SVG animé (path draw).
- **Skeletons** : shimmer pendant le chargement.
- **Toasts** : `sonner` (slide-in).
- **Cart drawer** : slide latéral avec backdrop fade.
- **Respecter `prefers-reduced-motion`** : désactiver/atténuer les animations si l'utilisateur le demande.

> Pour les composants premium (hero, pricing animé, navbars, cards 3D, marquees, etc.), **utiliser le MCP 21st.dev Magic** afin de générer des composants animés de qualité production, puis les adapter aux tokens MiniShop.

---

## 11. Internationalisation (FR/EN/ES)

- **react-i18next** + `i18next-browser-languagedetector`. Langue par défaut **FR**, fallback **EN**.
- Détection : `localStorage` → `navigator.language`. Persistance du choix (`uiStore`).
- **Aucune chaîne en dur** : tout passe par des clés. Organiser les namespaces (`common`, `auth`, `dashboard`, `shop`, `pricing`, `orders`, `admin`, `errors`).
- **Pluriels et interpolations** (ex. `"{{count}}/{{limit}} photos used"`).
- **Formats localisés** : prix (`Intl.NumberFormat`), dates (`date-fns` locales `fr`/`enUS`/`es`).
- `LanguageSwitcher` accessible dans le header public, la topbar dashboard et les settings.
- Structure d'un fichier locale (extrait `fr.json`) :

```json
{
  "common": { "getStarted": "Commencer", "login": "Connexion", "logout": "Déconnexion", "save": "Enregistrer" },
  "auth": { "welcomeBack": "Bon retour", "createShop": "Créez votre MiniShop", "forgotPassword": "Mot de passe oublié ?" },
  "dashboard": { "title": "Tableau de bord", "products": "Produits", "orders": "Commandes", "billing": "Facturation" },
  "products": { "photosUsed": "{{count}}/{{limit}} photos utilisées", "addProduct": "Ajouter un produit", "maxReached": "Limite de photos atteinte" },
  "orders": { "status": { "new": "Nouvelle", "confirmed": "Confirmée", "in_process": "En préparation", "ready": "Prête", "out_for_delivery": "En livraison", "completed": "Terminée", "cancelled": "Annulée" } },
  "shop": { "paymentNotice": "Le paiement se fait directement avec le commerçant, hors MiniShop.", "addToCart": "Ajouter au panier", "checkout": "Commander" }
}
```

Fournir les 3 fichiers complets (`fr.json`, `en.json`, `es.json`) couvrant **toutes** les chaînes.

---

## 12. Bibliothèque de composants UI

Construire `components/ui/` (primitives réutilisables, accessibles, themables) :

| Composant | Variantes / props clés |
|---|---|
| `Button` | `primary`, `secondary`, `outline`, `danger`, `ghost` ; `loading`, `size`, `icon` |
| `Input` / `Textarea` | label, erreur, hint, icône ; intégrés react-hook-form |
| `Select` | natif stylé + recherche |
| `Card` | variantes élévation |
| `Modal` / `Drawer` | accessibles (focus trap, Esc), animés Motion |
| `Badge` | statuts colorés (commande, abonnement) |
| `Tabs` | filtres de commandes |
| `Toast` | via `sonner` |
| `Avatar` | logo boutique / initiales |
| `ProgressBar` | quota photos |
| `Skeleton` | shimmer |
| `EmptyState` | illustration + CTA |
| `Tooltip` | |
| `Switch` | disponibilité produit, thème |
| `LanguageSwitcher`, `ThemeToggle` | |
| `StatCard` | valeur + delta + icône + count-up |
| `PricingCard` | repris du mobile (badge popular, MAX) |
| `ProductCard` | image/placeholder, prix, actions contextuelles |
| `OrderStatusTimeline` | étapes animées |
| `QRCodeCard` | génération + téléchargement |

Tous **typés**, **dark-mode ready**, **i18n ready**, **animés**.

---

## 13. Fonctionnalités web enrichies

Au-delà de la parité mobile, ajouter :

1. **Panier multi-produits** (storefront) avec quantités, persistance `localStorage` par boutique, drawer animé, total live.
2. **Dashboard analytics** : stats, graphiques (recharts), CA estimé, répartition par statut, tendances.
3. **Dark mode** complet (clair/sombre/système, persistant).
4. **Recherche et filtres** : produits (dashboard + vitrine), commandes (par statut), commerçants (admin).
5. **QR code** de la boutique téléchargeable + multi-partage (WhatsApp/Facebook/X/Email/Web Share).
6. **Gestion du logo** de boutique (`logoUrl`, déjà dans le modèle).
7. **Détail de commande** avec timeline de statut + bouton « Contacter sur WhatsApp » (`wa.me`).
8. **Déconnexion** (absente du mobile) + page **Settings**.
9. **Toasts** modernes en remplacement des `Alert`.
10. **États vides / skeletons / erreurs** soignés partout.
11. **Annulation de commande** (statut `cancelled`).
12. **Toggle de disponibilité** produit en un clic.
13. **Indicateur temps réel** + notification visuelle à la nouvelle commande.
14. **Validation de formulaires** robuste (react-hook-form + zod) avec messages localisés.
15. **Aperçu live** du slug et de la fiche boutique pendant l'édition.
16. **PWA (optionnel)** : installable, manifest + service worker (offline shell), proche d'une app.
17. **Suppression d'image Storage** à la suppression de produit (anti-orphelins).
18. **Open Graph dynamique** par boutique (titre/desc/logo) pour des partages riches (voir §17).
19. **(Optionnel) FCM Web** pour notifier le commerçant dans le navigateur à la nouvelle commande, en complément du WhatsApp.

---

## 14. Gestion d'état

- **`authStore` (zustand)** : `user` (Firebase), `owner` (doc Firestore), `loading`, `isAdmin`. Initialisé via `onAuthStateChanged` au boot. Expose `logout()`.
- **`cartStore` (zustand + persist)** : panier par `slug`, ajout/retrait/quantité, total, `clear()`.
- **`themeStore`** : `theme` (`light`/`dark`/`system`), applique la classe sur `<html>`.
- **`uiStore`** : langue courante, état sidebar (mobile), modales.
- **React Query** : lecture des produits, owner, stats (cache + revalidation). Les **commandes** restent en `onSnapshot` temps réel (hook `useOrders`).

---

## 15. Sécurité et variables d'environnement

### `.env.example` (web)

```
VITE_FIREBASE_API_KEY=AIzaSy...votre-cle-firebase
VITE_FIREBASE_AUTH_DOMAIN=mystore-ff354.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mystore-ff354
VITE_FIREBASE_STORAGE_BUCKET=mystore-ff354.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=585521747876
VITE_FIREBASE_APP_ID=1:585521747876:web:824723e1c29e5cc6c61331
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_FUNCTIONS_BASE_URL=https://us-central1-mystore-ff354.cloudfunctions.net
VITE_PUBLIC_STORE_BASE_URL=https://votre-domaine-web.com
```

> Les valeurs Firebase ci-dessus proviennent du projet mobile et sont des **clés publiques web** (sécurisées par les règles, pas des secrets). Ne jamais exposer côté front les secrets Stripe/Twilio (ils restent dans les Cloud Functions).

### Sécurité Firestore / Storage
- **Réutiliser `firebase.rules`** (les vraies règles par rôle) — **ne pas** déployer `firestore.rules` (règles de test ouvertes jusqu'au 12/07/2026). Vérifier `firebase.json`.
- **Créer l'index composite** pour `products` (`ownerId` ASC + `createdAt` DESC) requis par `listOwnerProducts`. Idem pour toute requête `where + orderBy`.
- **Activer Firebase App Check** (reCAPTCHA v3 web) — recommandé, car `orders` autorise `create: if true` (clients anonymes) ; App Check + rate-limiting limite le spam.
- **Web App authorisée** : ajouter le domaine web dans Firebase Auth (Authorized domains) et dans la config OAuth.

---

## 16. Ajustements requis côté Cloud Functions

Le backend mobile renvoie des `success_url`/`cancel_url` et `return_url` en **deep-link `minishop://`**, qui ne fonctionnent pas sur le web. Deux options :

**Option A (recommandée, minimale) — rendre les URLs dynamiques :**
- `createCheckoutSession` : lire `returnBaseUrl` depuis le body (envoyé par le client web = `window.location.origin`) et construire `success_url = ${base}/dashboard/billing?success=true`, `cancel_url = ${base}/pricing?cancel=true`. Si absent, garder le fallback `minishop://` (mobile).
- `createCustomerPortal` : idem pour `return_url`.

**Option B — endpoints web dédiés** (`createCheckoutSessionWeb`, etc.) avec URLs web. Plus de code, mais isole mobile/web.

> Le reste (webhook Stripe, notifications Twilio) **ne change pas**. Documenter ce point comme **prérequis backend** pour que le paiement web boucle correctement.

---

## 17. Accessibilité, performance, SEO

- **A11y** : HTML sémantique, labels de formulaires, focus visibles, navigation clavier, `aria-*` sur modales/drawers, contrastes AA, `prefers-reduced-motion`.
- **Performance** : code-splitting par route (`React.lazy`/`Suspense`), lazy-loading des images (`loading="lazy"`), compression des uploads (redimensionner avant upload Storage), `@tanstack/react-query` pour le cache.
- **SEO vitrine (SPA)** : comme on est en Vite SPA, ajouter `react-helmet-async` pour titres/meta/OG dynamiques par boutique. Pour des aperçus de partage fiables (WhatsApp/Facebook), prévoir soit un **pré-rendu** des pages `/:slug` (ex. `vite-plugin-ssg`/prerender, ou une Cloud Function qui sert les balises OG aux bots), soit accepter le SEO limité du SPA. **Documenter** ce compromis (le choix Vite a été acté).

---

## 18. Tests et qualité

- **TypeScript strict** (`strict: true`), zéro `any` non justifié.
- **ESLint + Prettier**.
- **Tests unitaires** (Vitest) sur services (slugify, quota produits, calcul total panier, `nextStatuses`).
- **Tests composants** (React Testing Library) sur formulaires clés (signup, checkout).
- **Vérification manuelle** : parcours commerçant complet (signup → plan → produit → partage → commande → statut) et parcours client (vitrine → panier → checkout → confirmation).
- **Build de prod** sans erreurs TS ni warnings critiques.

---

## 19. Déploiement

- **Firebase Hosting** (cohérent avec le projet) : `firebase init hosting`, build `vite build` → `dist/`, rewrites SPA (`** → /index.html`).
- Ajouter le domaine de prod dans **Auth → Authorized domains**.
- Configurer **les variables Stripe price IDs réelles** (remplacer `price_replace_*`) côté plans et Stripe.
- Déployer **`firebase.rules`** (pas le fichier de test) + **les index Firestore**.
- Déployer les **Cloud Functions ajustées** (§16).
- Variables d'env de prod renseignées (`VITE_*`).

---

## 20. Checklist de parité fonctionnelle

Le web doit couvrir **au minimum** tout ce que fait le mobile :

**Auth** : inscription owner (nom, boutique, email, WhatsApp, mot de passe) ✔ · login ✔ · reset password ✔ · persistance de session ✔ · garde de routes ✔ · **+ déconnexion** (nouveau).

**Abonnement** : choix de plan ✔ · Stripe Checkout ✔ · Billing Portal ✔ · gating vitrine si non `active` ✔ · synchro webhook (backend inchangé) ✔.

**Produits** : liste ✔ · ajout avec upload photo ✔ · édition ✔ · suppression (confirmée) ✔ · **quota par plan + max 15** ✔ · compteur ✔.

**Profil** : édition nom/WhatsApp/description/livraison ✔ · **+ logo, catégorie, adresse, instructions** (nouveau) · **bug merge corrigé**.

**Commandes** : temps réel ✔ · détail client + articles + total ✔ · transitions de statut (`new→…→completed`, `cancelled`) ✔ · notifications WhatsApp (backend) ✔.

**Partage** : URL publique ✔ · partage natif ✔ · **+ QR, multi-réseaux** (nouveau).

**Vitrine publique** : accès par slug ✔ · gating abonnement ✔ · produits disponibles ✔ · bandeau « paiement hors plateforme » ✔ · **panier multi-produits** (nouveau).

**Checkout/Confirmation** : formulaire client ✔ · création commande ✔ · confirmation avec n° ✔.

**Admin** : garde claim ✔ · liste des commerçants ✔ · **+ stats & filtres** (nouveau).

---

## 21. Plan d'implémentation par phases

1. **Bootstrap** : Vite+TS, Tailwind, Motion, lucide, i18n, router, Firebase, zustand, react-query, sonner. Tokens & thème (dark mode). Layouts (AppShell public + dashboard).
2. **Auth & gardes** : firebase.ts, authStore, services auth, pages login/signup/reset, ProtectedRoute/AdminRoute.
3. **Composants UI** : primitives `ui/` + i18n de base.
4. **Dashboard owner** : Overview (stats), Products (CRUD + upload + quota), Profile (bug corrigé + logo), Settings.
5. **Commandes** : useOrders temps réel, liste + détail + timeline + transitions + WhatsApp.
6. **Abonnement** : Pricing, Billing, subscriptionService (+ ajustement Functions §16).
7. **Vitrine publique** : Storefront, panier multi-produits, Checkout, Confirmation.
8. **Partage** : Share (QR + multi-réseaux).
9. **Admin** : stats + table filtrable.
10. **Enrichissements** : analytics avancés, recherche/filtres, états vides/skeletons, animations « wow » (21st.dev Magic), PWA optionnelle.
11. **i18n complet** (FR/EN/ES) — toutes les chaînes.
12. **A11y, perf, tests, build prod, déploiement.**

---

*Fin de la spécification. Référence : analyse complète de l'app mobile dans `ANALYSE_MINISHOP.md`.*

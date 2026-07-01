# Analyse technique exhaustive — MiniShop (React Native / Expo)

> Document d'analyse du code source de l'application mobile MiniShop.
> Périmètre : application Expo (`app/`, `components/`, `services/`, `types/`, `constants/`), backend Firebase Cloud Functions (`functions/`), règles de sécurité Firestore / Storage, et configuration projet.

---

## Table des matières

1. [Présentation générale](#1-présentation-générale)
2. [Stack technique et dépendances](#2-stack-technique-et-dépendances)
3. [Architecture globale](#3-architecture-globale)
4. [Les types d'utilisateurs](#4-les-types-dutilisateurs)
5. [Cartographie complète des écrans (routes)](#5-cartographie-complète-des-écrans-routes)
6. [Les composants UI réutilisables](#6-les-composants-ui-réutilisables)
7. [La couche services (logique métier)](#7-la-couche-services-logique-métier)
8. [Le modèle de données Firestore](#8-le-modèle-de-données-firestore)
9. [Le système d'abonnement et de facturation](#9-le-système-dabonnement-et-de-facturation)
10. [Le cycle de vie d'une commande](#10-le-cycle-de-vie-dune-commande)
11. [Le backend — Cloud Functions](#11-le-backend--cloud-functions)
12. [Les notifications](#12-les-notifications)
13. [Sécurité (règles Firestore / Storage)](#13-sécurité-règles-firestore--storage)
14. [Le système de design](#14-le-système-de-design)
15. [Navigation, deep links et redirections](#15-navigation-deep-links-et-redirections)
16. [Configuration et variables d'environnement](#16-configuration-et-variables-denvironnement)
17. [Inventaire complet des actions par utilisateur](#17-inventaire-complet-des-actions-par-utilisateur)
18. [Lacunes, risques et recommandations](#18-lacunes-risques-et-recommandations)
19. [Annexe — Récapitulatif fichier par fichier](#19-annexe--récapitulatif-fichier-par-fichier)

---

## 1. Présentation générale

**MiniShop** est une application mobile permettant à de petits commerçants de créer une mini-boutique depuis leur téléphone. Le pitch produit (extrait du README) : *« MiniShop lets small business owners create a mobile store, upload product photos based on subscription plan, share a store link, receive orders, and manage order status. »*

Le modèle économique repose sur **deux flux financiers distincts et volontairement séparés** :

- **L'abonnement du commerçant** est payé via **Stripe** (récurrent mensuel). C'est la seule chose que MiniShop encaisse.
- **Le paiement des produits par le client final** est **hors application** : il se règle directement entre le client et le commerçant (en personne, mobile money, espèces, etc.). L'app le rappelle explicitement à plusieurs endroits via des bandeaux d'avertissement.

L'unité de valeur vendue n'est pas un volume de ventes mais un **nombre de photos de produits** autorisées, qui dépend du plan : Starter (5), Business (10), Premium (15, qui est aussi le plafond absolu de la plateforme).

Identité applicative :

| Élément | Valeur |
|---|---|
| Nom | MiniShop |
| Slug Expo | `minishop-mobile` |
| Scheme (deep link) | `minishop://` |
| Version | 1.0.0 |
| Orientation | Portrait |
| Thème | Clair (`userInterfaceStyle: light`) |
| Bundle iOS | `com.christian.minishop` |
| Package Android | `com.kameltechsolutions.minishop` |
| Projet Firebase | `mystore-ff354` |

---

## 2. Stack technique et dépendances

### Application mobile (`package.json`)

| Domaine | Technologie | Version |
|---|---|---|
| Framework | Expo | ~54.0.0 |
| Runtime | React Native | 0.81.5 |
| UI | React | 19.1.0 |
| Navigation | expo-router | ~6.0.24 (typedRoutes activés) |
| Backend SDK | firebase | ^12.14.0 |
| Paiement | @stripe/stripe-react-native | ^0.50.3 |
| Images | expo-image-picker | ~17.0.0 |
| Notifications | expo-notifications | ~0.32.0 |
| Stockage sécurisé | expo-secure-store | ~15.0.0 |
| Persistance auth | @react-native-async-storage/async-storage | 2.2.0 |
| Liens | expo-linking | ~8.0.0 |
| Zones sûres | react-native-safe-area-context | ~5.6.0 |
| Écrans natifs | react-native-screens | ~4.16.0 |
| Icônes | @expo/vector-icons | ^15.0.2 |
| Web | react-native-web / react-dom | ^0.21.0 / 19.1.0 |
| Langage | TypeScript | ~5.9.2 |

Scripts npm : `start` (expo start), `android`, `ios`, `web`, `lint` (eslint .ts/.tsx), `typecheck` (tsc --noEmit). Point d'entrée : `expo-router/entry`.

### Backend (`functions/package.json`)

| Domaine | Technologie | Version |
|---|---|---|
| Runtime | Node | 20 |
| Functions | firebase-functions | ^6.0.0 (API v2) |
| Admin SDK | firebase-admin | ^13.0.0 |
| Paiement | stripe | ^17.0.0 (apiVersion `2024-12-18.acacia`) |
| SMS/WhatsApp | twilio | ^5.0.0 |
| CORS | cors | ^2.8.5 |

### Plugins Expo (`app.json`)

`expo-router`, `expo-secure-store`, `expo-image-picker`, `expo-notifications`.

---

## 3. Architecture globale

L'architecture est un classique **client mobile + BaaS Firebase + Cloud Functions** pour les opérations sensibles (Stripe, Twilio).

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION EXPO (RN)                     │
│                                                              │
│  app/ (écrans, Expo Router)                                  │
│   ├── auth (index, login, signup, reset-password, pricing)   │
│   ├── dashboard/ (commerçant connecté)                       │
│   ├── shop/ (vitrine publique client)                        │
│   └── admin/ (super admin)                                   │
│                                                              │
│  components/  →  UI réutilisable                             │
│  services/    →  logique métier + accès Firebase             │
│  types/ constants/  →  modèles & config                     │
└───────────┬─────────────────────────────────┬───────────────┘
            │ SDK client Firebase             │ fetch() HTTP
            ▼                                  ▼
┌──────────────────────┐         ┌───────────────────────────────┐
│   FIREBASE (BaaS)    │         │   CLOUD FUNCTIONS (Node 20)   │
│  • Auth (email/pwd)  │◄────────│  • createCheckoutSession      │
│  • Firestore         │  admin  │  • createCustomerPortal       │
│  • Storage (photos)  │  SDK    │  • stripeWebhook              │
└──────────────────────┘         │  • sendNewOrderNotification   │
                                 │  • sendOrderStatusNotification│
                                 └──────────┬─────────┬──────────┘
                                            ▼         ▼
                                       ┌────────┐ ┌────────┐
                                       │ Stripe │ │ Twilio │
                                       └────────┘ │WhatsApp│
                                                  └────────┘
```

Points d'architecture notables :

- **Accès direct au SDK Firestore depuis le client** pour la majorité des opérations (produits, commandes, profil, lecture des boutiques). La sécurité repose donc *entièrement* sur les règles Firestore.
- **Les Cloud Functions ne sont utilisées que pour ce qui exige un secret serveur** : créer des sessions Stripe (clé secrète), traiter le webhook Stripe, et envoyer des messages WhatsApp (identifiants Twilio).
- **Le client communique avec les Functions par `fetch()` HTTP** vers `EXPO_PUBLIC_FUNCTIONS_BASE_URL`, avec un token d'identité Firebase en `Authorization: Bearer`.
- **Configuration Firebase codée en dur** dans `services/firebase.ts` (et non lue depuis le `.env`, qui existe pourtant en exemple).

---

## 4. Les types d'utilisateurs

L'application distingue **trois rôles**, dont un seul s'authentifie réellement dans le dashboard.

### 4.1 Le Commerçant (Owner) — utilisateur principal

C'est l'utilisateur cible. Il s'inscrit avec email + mot de passe (Firebase Auth) et gère intégralement sa boutique. Modélisé par le type `Owner` et stocké dans `owners/{ownerId}` où `ownerId === uid` Firebase.

Il possède **deux statuts indépendants** :

- `subscriptionStatus` : `trialing` | `active` | `past_due` | `unpaid` | `canceled` | `incomplete` | `inactive`. Conditionne l'accès au dashboard et la **visibilité publique** de la boutique (la vitrine n'est servie que si `active`).
- `accountStatus` : `active` | `suspended` | `disabled`. Statut administratif du compte (modération). Présent dans le modèle mais non encore exploité dans l'UI.

À l'inscription : `subscriptionStatus = 'inactive'`, `accountStatus = 'active'`.

### 4.2 Le Client (Customer) — non authentifié

Le client final **ne crée aucun compte**. Il accède à une boutique via le lien public `/shop/[slug]`, parcourt les produits disponibles, ajoute un article et remplit un formulaire de commande (nom, téléphone, WhatsApp, adresse, notes). Il n'existe pas d'entité `Customer` en base : ses informations sont **dénormalisées dans le document `order`**. L'écran d'accueil le formule ainsi : *« Customers order without creating accounts. »*

### 4.3 Le Super Admin

Identifié par un **custom claim Firebase** (`token.admin === true`), vérifié à la fois côté client (écran `/admin`) et côté règles Firestore (`isAdmin()`). Aujourd'hui son interface se limite à **lister tous les commerçants** (nom, email, statut d'abonnement, plan) en lecture seule. Les règles lui octroient toutefois des droits étendus (mise à jour/suppression d'owners, lecture/maj des commandes, gestion de `subscriptions` et `adminUsers`).

> Note : il n'y a pas, dans le code fourni, de mécanisme d'attribution du claim `admin` (à faire via Admin SDK / console). Le README le liste comme tâche de production : *« Add admin custom claims for Super Admin. »*

---

## 5. Cartographie complète des écrans (routes)

L'application utilise **Expo Router** (routage par système de fichiers). `typedRoutes` est activé. En-têtes masqués par défaut (`headerShown: false`), sauf dans le dashboard.

### 5.1 `app/_layout.tsx` — Layout racine (garde d'authentification)

Le cœur de l'orchestration. Il :

1. Enveloppe l'app dans `SafeAreaProvider` et `StripeProvider` (clé publishable depuis `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
2. Observe l'état d'authentification via `onAuthStateChanged`. Tant que `user === undefined`, affiche un spinner plein écran (`ActivityIndicator`).
3. Applique la **garde de navigation** :
   - Si **non connecté** et dans une zone protégée (`dashboard` ou `admin`) → redirige vers `/login`.
   - Si **connecté** et sur une page d'auth (`''`, `login`, `signup`, `reset-password`) → redirige vers `/dashboard`.
4. Rend une pile `Stack` sans en-tête.

### 5.2 Zone publique / authentification

#### `app/index.tsx` — Accueil (Welcome)

Page marketing. Contient :
- Logo (`assets/minishop-logo.png`), kicker « iOS & Android store platform », titre « Your Mini Store. Big Possibilities. », sous-titre, et mention de confiance « Secure. Simple. Reliable. ».
- Deux boutons : **Get Started** (→ `/signup`) et **Login** (→ `/login`, variante outline).
- Une grille de 3 cartes pédagogiques : 🛒 Create Store, 🔗 Share Link, 📦 Receive Orders.
- Une carte rappelant les plans : « Starter: 5 photos • Business: 10 photos • Premium: 15 photos maximum ».
- Fond bleu nuit (`Colors.primaryDark = #06163A`).

#### `app/login.tsx` — Connexion

Formulaire compact : email (sans capitalisation auto), mot de passe (masqué). Bouton **Login** (avec état `loading`) appelant `loginOwner`, puis `router.replace('/dashboard')`. Bouton **Forgot password?** → `/reset-password`. Gestion d'erreur via `Alert.alert('Login failed', ...)`.

#### `app/signup.tsx` — Inscription

Cinq champs : **nom du propriétaire**, **nom de la boutique**, **email**, **numéro WhatsApp**, **mot de passe**. Bouton **Create Account** appelant `registerOwner(...)` puis redirection vers `/pricing` (l'utilisateur doit choisir un plan juste après s'être inscrit). Gestion d'erreur via Alert.

#### `app/reset-password.tsx` — Mot de passe oublié

Un champ email + bouton **Send Reset Link** appelant `resetPassword(email)` (envoi d'email Firebase), puis Alert de confirmation « Check your email for the reset link. ».

#### `app/pricing.tsx` — Choix du plan

Titre « Choose your plan » + sous-titre rappelant que 15 photos est le maximum. Affiche trois `PricingCard` (starter, business, premium). Le choix d'un plan appelle `createCheckoutSession(plan)` puis ouvre l'URL Stripe Checkout retournée via `Linking.openURL(url)` (navigateur externe). Erreurs via `Alert.alert('Billing error', ...)`.

### 5.3 Dashboard du commerçant (`app/dashboard/`)

#### `app/dashboard/_layout.tsx` — Layout du dashboard

Une pile `Stack` avec en-tête visible et titre « MiniShop » (`headerShown: true`).

#### `app/dashboard/index.tsx` — Tableau de bord

Écran d'accueil connecté. Carte « Your MiniShop is ready » + 5 boutons de navigation : **Shop Profile**, **Products** (secondary), **Orders**, **Share Store Link** (outline), **Billing** (outline).

#### `app/dashboard/profile.tsx` — Profil de la boutique

Charge à l'ouverture le document `owners/{uid}` et pré-remplit les champs. Permet d'éditer : **nom de boutique**, **numéro WhatsApp**, **description de l'activité** (multiline), **informations de livraison** (multiline). Bouton **Save Profile** qui fait un `setDoc(... , {merge implicite via setDoc complet})` sur `owners/{uid}` avec `shopName`, `businessDescription`, `deliveryInfo`, `whatsapp`, `updatedAt`. (À noter : ce `setDoc` n'utilise pas `{ merge: true }` — voir §18.)

#### `app/dashboard/products.tsx` — Gestion des produits (écran le plus riche)

Logique :
- Au montage, `load()` récupère le plan du commerçant (`getCurrentOwner`) et la liste de ses produits (`listOwnerProducts`).
- Affiche un compteur « X/limite photos used. MiniShop maximum is 15. ».
- Formulaire : nom, prix (clavier décimal), description, et bouton **Choose Photo** ouvrant la galerie via `ImagePicker.launchImageLibraryAsync` (qualité 0.75).
- Bouton **Add Product** / **Save Changes** (mode édition). Si une image locale est sélectionnée (URI ne commençant pas par `http`), elle est d'abord uploadée via `uploadProductImage`, puis `addProduct` ou `updateProduct`.
- Chaque produit listé via `ProductCard` avec deux boutons : **Edit** (charge le produit dans le formulaire) et **Delete** (avec confirmation `Alert` destructive).
- En mode édition, un bouton **Cancel Edit** réinitialise le formulaire.

#### `app/dashboard/orders.tsx` — Commandes (temps réel)

S'abonne aux commandes du commerçant via `subscribeOwnerOrders(uid, setOrders)` (`onSnapshot`, mise à jour live). Pour chaque commande affiche : numéro court (`#` + 6 premiers caractères), nom client, téléphone, adresse, total estimé formaté, statut (souligné lisiblement avec `replaceAll('_',' ')`), et la liste des articles (`quantité x nom`). Sous chaque commande, des boutons **Mark <statut suivant>** générés dynamiquement par `nextStatuses(current)`. Le clic appelle `updateOrderStatus(orderId, s)`.

#### `app/dashboard/profile.tsx`, `billing.tsx`, `share.tsx`

- **`billing.tsx`** : texte explicatif + bouton **Choose / Upgrade Plan** (→ `/pricing`) et bouton **Manage Billing** appelant `createCustomerPortal()` puis ouvrant le portail client Stripe via `Linking.openURL`.
- **`share.tsx`** : construit l'URL publique de la boutique. Base URL résolue par ordre de priorité : `EXPO_PUBLIC_PUBLIC_STORE_BASE_URL` → `EXPO_PUBLIC_STORE_BASE_URL` → fallback `https://strandprotx.com`. Slug = `owner.shopSlug` ou, à défaut, l'uid. Boutons **Share Link** (partage natif `Share.share` avec message « Shop with us on MiniShop: <url> ») et **Copy manually** (affiche l'URL dans une Alert). Gère les états de chargement et d'erreur (« Please sign in first. », « Could not load store link. »).

### 5.4 Boutique publique (`app/shop/`) — côté client

#### `app/shop/[slug].tsx` — Vitrine publique

Route dynamique paramétrée par le `slug`. Logique :
- `findShopBySlug(slug)` récupère la boutique (document owner).
- Si la boutique est introuvable → « Store not found. ».
- **Si `subscriptionStatus !== 'active'`** → écran « Store unavailable » (la boutique n'est visible publiquement que si l'abonnement est actif). C'est le levier qui désactive automatiquement les boutiques non payées.
- Sinon, charge les produits **disponibles** : `query(products where ownerId == shop.ownerId and isAvailable == true)`.
- Affiche le nom de la boutique, sa description, un bandeau jaune d'avertissement « Payment will be handled directly with the business owner outside MiniShop. », puis chaque produit en `ProductCard` avec bouton **Add to Cart**.
- L'ajout au panier navigue vers `/shop/checkout` en passant l'article sérialisé en JSON dans les params (panier mono-article).

#### `app/shop/checkout.tsx` — Commande

Reçoit `ownerId`, `shopName`, `item` (JSON) en params. Bandeau vert rappelant que MiniShop ne collecte pas les paiements. Formulaire client : **nom complet**, **téléphone**, **WhatsApp**, **adresse de livraison**, **notes spéciales**. Bouton **Submit Order** appelant `createOrder({...})` avec `estimatedTotal = item.price * item.quantity`, puis redirection vers `/shop/confirmation`.

#### `app/shop/confirmation.tsx` — Confirmation

Écran de remerciement : « Order submitted », nom de la boutique, numéro de commande (`#` + 8 premiers caractères), message indiquant que le commerçant recontactera le client pour paiement et livraison. Bouton **Done** → retour à l'accueil `/`.

### 5.5 Administration (`app/admin/index.tsx`) — Super Admin

À l'ouverture, observe l'auth, récupère `getIdTokenResult()` et vérifie `claims.admin === true`. Trois états : `null` (« Checking access… »), non autorisé (« Unauthorized. Admin access required. »), autorisé. Si autorisé, charge **tous** les documents `owners` et les liste en `Card` (nom, email, `subscriptionStatus • plan`).

---

## 6. Les composants UI réutilisables

| Composant | Rôle | Détails |
|---|---|---|
| `Button` | Bouton standard | 4 variantes : `primary` (orange), `secondary` (vert), `outline` (bordure orange), `danger` (rouge). Prop `loading` affiche un `ActivityIndicator`, désactive le bouton. Coins arrondis 18, texte gras 900. |
| `Input` | Champ texte | Encapsule `TextInput`, transmet toutes les `TextInputProps`. Placeholder gris `#9CA3AF`, bordure `Colors.border`, fond blanc. |
| `Card` | Conteneur carte | Fond blanc, coins arrondis 22, ombre légère, bordure. Accepte un `style` additionnel. |
| `Screen` | Wrapper d'écran | Gère la safe area (`useSafeAreaInsets`) et le scroll optionnel (`scroll` par défaut `true`). Padding 20, gap 16, fond `Colors.bg`. |
| `ProductCard` | Carte produit | Affiche image (ou placeholder « Photo »), nom, description, prix formaté `$X.XX`. Bouton **Add to Cart** optionnel (prop `onAdd`) — n'apparaît que côté client. |
| `PricingCard` | Carte tarifaire | Lit `PLANS[planId]`. Affiche nom, prix, limite de photos (« (MAX) » si 15), 5 bénéfices à coche, badge « Most Popular » pour Business. Bouton **Choose Plan**. |

---

## 7. La couche services (logique métier)

### 7.1 `services/firebase.ts` — Initialisation

Initialise l'app Firebase avec une config **codée en dur** (projet `mystore-ff354`). Exporte :
- `auth` : `initializeAuth` avec persistance `getReactNativePersistence(AsyncStorage)` (la session survit aux redémarrages).
- `db` : `getFirestore`.
- `storage` : `getStorage`.

### 7.2 `services/authService.ts` — Authentification

| Fonction | Rôle |
|---|---|
| `slugify(value)` | Transforme un nom en slug URL (minuscules, tirets, sans caractères spéciaux). |
| `registerOwner(input)` | Crée le compte Auth (`createUserWithEmailAndPassword`), met à jour le `displayName`, construit l'objet `Owner` complet (avec `shopSlug` généré, `subscriptionStatus: 'inactive'`, `accountStatus: 'active'`) et le persiste dans `owners/{uid}` (+ `createdAtServer: serverTimestamp()`). |
| `loginOwner(email, password)` | `signInWithEmailAndPassword`. |
| `resetPassword(email)` | `sendPasswordResetEmail`. |
| `logoutOwner()` | `signOut`. |
| `getCurrentOwner(ownerId)` | Lit `owners/{ownerId}`, renvoie l'`Owner` ou `null`. |

### 7.3 `services/productService.ts` — Produits

| Fonction | Rôle |
|---|---|
| `listOwnerProducts(ownerId)` | Requête `products where ownerId == X orderBy createdAt desc`. |
| `uploadProductImage(ownerId, localUri)` | `fetch` l'URI locale → `blob` → upload vers Storage `products/{ownerId}/{timestamp}.jpg` (content-type `image/jpeg`) → renvoie l'URL de téléchargement. Validation des paramètres. |
| `addProduct(ownerId, plan, input)` | **Applique le quota** : compte les produits existants, refuse si `>= getPhotoLimit(plan)` ou si `>= MAX_PHOTOS (15)`. Sinon `addDoc` avec `createdAt`/`updatedAt`. |
| `updateProduct(productId, data)` | `setDoc(..., { merge: true })` + `updatedAt`. |
| `deleteProduct(productId)` | `deleteDoc`. |

### 7.4 `services/orderService.ts` — Commandes

| Fonction | Rôle |
|---|---|
| `createOrder(input)` | Crée la commande (`status: 'new'`, timestamps), puis **déclenche en fire-and-forget** `POST .../sendNewOrderNotification` (les erreurs réseau sont ignorées via `.catch(() => undefined)`). Renvoie l'ID. |
| `subscribeOwnerOrders(ownerId, cb)` | `onSnapshot` sur `orders where ownerId == X`, tri côté client par `createdAt` décroissant. Retourne la fonction de désabonnement. Log les erreurs. |
| `updateOrderStatus(orderId, status)` | `setDoc merge` du statut + `updatedAt`, puis `POST .../sendOrderStatusNotification`. |
| `findShopBySlug(slug)` | `query owners where shopSlug == slug`, renvoie le premier document ou `null`. |

### 7.5 `services/subscriptionService.ts` — Abonnements

| Fonction | Rôle |
|---|---|
| `createCheckoutSession(plan)` | Récupère l'`idToken`, `POST .../createCheckoutSession` avec `{ plan, priceId }`. Renvoie `data.url` (URL Stripe Checkout). |
| `createCustomerPortal()` | `POST .../createCustomerPortal` avec le token. Renvoie l'URL du portail client Stripe. |

Les deux exigent un utilisateur connecté (sinon « You must be logged in. ») et propagent les erreurs serveur.

### 7.6 `services/notificationService.ts` — Push notifications

`registerForPushNotifications()` : demande la permission, récupère un **Expo Push Token** (`getExpoPushTokenAsync` avec `projectId` issu de `Constants.expoConfig.extra.eas.projectId`), configure un canal Android `default` à importance MAX. **Cette fonction n'est appelée nulle part dans le code fourni** (voir §18) — l'infrastructure de push existe mais n'est pas branchée.

---

## 8. Le modèle de données Firestore

### 8.1 `owners/{ownerId}` (type `Owner`)

```ts
{
  ownerId: string;            // === uid Firebase
  fullName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  shopName: string;
  shopSlug: string;           // généré par slugify(shopName)
  logoUrl?: string;
  businessDescription?: string;
  businessCategory?: string;
  address?: string;
  deliveryInfo?: string;
  orderInstructions?: string;
  plan?: 'starter' | 'business' | 'premium';
  subscriptionStatus: 'trialing'|'active'|'past_due'|'unpaid'|'canceled'|'incomplete'|'inactive';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  accountStatus: 'active' | 'suspended' | 'disabled';
  createdAt: number;          // Date.now()
  updatedAt: number;
}
```

### 8.2 `products/{productId}` (type `Product`)

```ts
{
  productId: string;
  ownerId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;       // filtre de la vitrine publique
  quantity?: number;
  createdAt: number;
  updatedAt: number;
}
```

### 8.3 `orders/{orderId}` (type `Order`)

```ts
{
  orderId: string;
  ownerId: string;
  shopName: string;           // dénormalisé
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  deliveryAddress: string;
  notes?: string;
  items: OrderItem[];         // { productId, name, price, quantity, imageUrl? }
  estimatedTotal: number;
  status: 'new'|'confirmed'|'in_process'|'ready'|'out_for_delivery'|'completed'|'cancelled';
  createdAt: number;
  updatedAt: number;
}
```

### 8.4 Autres collections (référencées dans les règles / README)

- `subscriptions/{ownerId}` — déclarée dans les règles et le README, mais aucune écriture/lecture dans le code client (la synchro d'abonnement écrit en réalité dans `owners`).
- `adminUsers/{adminId}` — déclarée dans les règles ; mécanisme d'admin réel basé sur le custom claim.

### 8.5 Indexes

`firestore.indexes.json` ne contient **aucun index personnalisé** (uniquement des exemples commentés). Or `listOwnerProducts` fait un `where + orderBy` sur des champs distincts (`ownerId` + `createdAt`), ce qui nécessitera en principe un **index composite** à créer côté Firebase (voir §18).

---

## 9. Le système d'abonnement et de facturation

Défini dans `constants/plans.ts` :

| Plan | Prix affiché | Photos | Stripe Price ID |
|---|---|---|---|
| **Starter** | 4,99 $/mois | 5 | `price_replace_starter` *(placeholder)* |
| **Business** | 9,99 $/mois | 10 | `price_replace_business` *(placeholder)* |
| **Premium** | 14,99 $/mois | 15 (MAX) | `price_replace_premium` *(placeholder)* |

- `MAX_PHOTOS = 15` : plafond absolu appliqué dans `addProduct` en plus de la limite du plan.
- `getPhotoLimit(plan)` : renvoie la limite, ou `0` si pas de plan (un commerçant sans plan ne peut donc ajouter aucun produit).
- Business porte le badge « Most Popular ».

**Flux d'abonnement complet :**

1. Le commerçant choisit un plan sur `/pricing` (ou `/billing` → `/pricing`).
2. `createCheckoutSession` (Function) crée/réutilise un **client Stripe** (`stripeCustomerId` stocké dans `owners`), puis une **session Checkout** en mode `subscription` avec redirections deep-link `minishop://dashboard/billing?success=true` / `minishop://pricing?cancel=true`.
3. L'app ouvre l'URL Stripe dans le navigateur.
4. À la fin du paiement, **le webhook Stripe** (`stripeWebhook`) reçoit `checkout.session.completed` → met à jour `owners/{ownerId}` avec `plan`, `subscriptionStatus: 'active'`, `stripeSubscriptionId`.
5. Les événements `customer.subscription.*` ultérieurs (renouvellement, échec, annulation) mettent à jour `subscriptionStatus` en miroir du statut Stripe.
6. **Gestion** ultérieure via le **Billing Portal** Stripe (`createCustomerPortal`).

Conséquence directe : la **vitrine publique n'est servie que si `subscriptionStatus === 'active'`** — un défaut de paiement rend automatiquement la boutique « unavailable ».

---

## 10. Le cycle de vie d'une commande

Statuts ordonnés (`STATUS_ORDER` dans `orders.tsx`) :

```
new → confirmed → in_process → ready → out_for_delivery → completed
                                                    ↘ cancelled (état terminal)
```

- À la création (`createOrder`), statut initial = `new`.
- `nextStatuses(current)` ne propose que les statuts **postérieurs** dans l'ordre ; `completed` et `cancelled` sont terminaux (aucun bouton suivant).
- Chaque transition appelle `updateOrderStatus`, qui notifie le client par WhatsApp (si numéro fourni).

**Parcours client de bout en bout :**

```
/shop/[slug]  →  (Add to Cart)  →  /shop/checkout  →  (Submit Order)  →  /shop/confirmation
   vitrine          panier            formulaire          createOrder        remerciement
                  (1 article)        client + livraison   + notif WhatsApp
```

> Le panier est **mono-article** : « Add to Cart » navigue directement au checkout avec un seul `OrderItem` (quantité fixée à 1). Il n'y a pas de panier multi-produits persistant.

---

## 11. Le backend — Cloud Functions

Fichier `functions/src/index.ts`. Toutes les fonctions sont des **HTTP onRequest (API v2)**. CORS ouvert (`origin: true`). Helper `getUidFromAuthHeader` : extrait et vérifie le Bearer token via `admin.auth().verifyIdToken`.

| Fonction | Auth | Rôle |
|---|---|---|
| `createCheckoutSession` | Bearer token | Valide le plan, récupère l'owner, crée/réutilise le client Stripe, crée la session Checkout d'abonnement, renvoie l'URL. |
| `createCustomerPortal` | Bearer token | Crée une session Billing Portal pour `stripeCustomerId`, renvoie l'URL. |
| `stripeWebhook` | Signature Stripe | Vérifie la signature (`STRIPE_WEBHOOK_SECRET`), traite `checkout.session.completed` et `customer.subscription.*`, met à jour `owners`. |
| `sendNewOrderNotification` | Aucune (publique) | Lit la commande + l'owner, envoie un message **WhatsApp** détaillé (via Twilio) au commerçant. Skip si pas de numéro WhatsApp. |
| `sendOrderStatusNotification` | Aucune (publique) | Notifie le **client** par WhatsApp du nouveau statut. Skip si pas de `customerWhatsapp`. |

`buildOrderMessage(order)` formate le message WhatsApp envoyé au commerçant (boutique, client, téléphone, livraison, lignes d'articles, total estimé, notes).

> Les deux fonctions de notification sont **publiques et non signées** : elles n'attendent qu'un `orderId`. Cela permet l'appel fire-and-forget depuis le client, mais expose un risque d'abus (voir §18).

---

## 12. Les notifications

Deux canaux, dont un seul réellement opérationnel :

1. **WhatsApp via Twilio (opérationnel)** — déclenché par les Cloud Functions. Commerçant notifié à chaque nouvelle commande ; client notifié à chaque changement de statut. Nécessite `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`.
2. **Push Expo (non branché)** — `notificationService.ts` sait obtenir un Expo Push Token et configurer le canal Android, mais la fonction n'est jamais appelée et aucun token n'est stocké côté serveur. Infrastructure présente mais inactive.

---

## 13. Sécurité (règles Firestore / Storage)

### 13.1 Deux fichiers de règles Firestore — **contradictoires**

- **`firestore.rules`** : mode « test » par défaut, **ouvre tout en lecture/écriture** jusqu'au **12 juillet 2026** (`allow read, write: if request.time < timestamp.date(2026, 7, 12)`). C'est dangereux en production.
- **`firebase.rules`** : les **vraies** règles par rôle (voir ci-dessous).

Il faut impérativement déployer `firebase.rules` (et non le fichier de test) — voir §18.

### 13.2 Règles métier (`firebase.rules`)

Fonctions : `signedIn()`, `isOwner(ownerId)`, `isAdmin()` (claim `admin`).

| Collection | read | create | update | delete |
|---|---|---|---|---|
| `owners/{ownerId}` | public (`true`) | propriétaire | propriétaire **ou** admin | admin |
| `products/{productId}` | public (`true`) | connecté + ownerId == uid | propriétaire | propriétaire |
| `orders/{orderId}` | propriétaire/admin | **public (`true`)** | propriétaire/admin | admin |
| `subscriptions/{ownerId}` | propriétaire/admin | — | admin (write) | admin |
| `adminUsers/{adminId}` | admin | — | admin | admin |

Lecture publique des `owners` et `products` : nécessaire pour la vitrine publique non authentifiée. Création publique des `orders` : nécessaire pour permettre aux clients de commander sans compte (mais ouvre la porte au spam).

### 13.3 Règles Storage (`storage.rules`)

```
match /products/{ownerId}/{allPaths=**} {
  allow read: if true;                                  // images publiques
  allow write: if request.auth != null && request.auth.uid == ownerId;
}
```

Lecture publique (affichage des photos en vitrine), écriture réservée au propriétaire du dossier.

---

## 14. Le système de design

Palette centralisée dans `constants/colors.ts` :

| Token | Hex | Usage |
|---|---|---|
| `primary` / `orange` | `#FF6B00` | Couleur d'accent principale (boutons, prix) |
| `primaryDark` | `#06163A` | Fond bleu nuit (accueil, splash) |
| `navy` | `#0B1F4D` | Carte héro |
| `blue` | `#0F3B82` | Bleu secondaire |
| `secondary` / `success` | `#16A34A` | Vert (plan premium, badge populaire) |
| `accent` | `#FFB703` | Jaune (kicker) |
| `bg` | `#F7F9FC` | Fond d'écran |
| `card` | `#FFFFFF` | Cartes |
| `text` | `#071633` | Texte principal |
| `muted` | `#68748A` | Texte secondaire |
| `danger` | `#DC2626` | Suppression / erreurs |
| `border` | `#E5EAF2` | Bordures |

Caractéristiques visuelles : coins très arrondis (18–34px), titres en `fontWeight: '900'`, ombres légères sur les cartes, bandeaux colorés contextuels (jaune `#FEF3C7` pour l'avertissement vitrine, vert `#ECFDF5` pour le checkout). Splash et icône adaptative sur fond `#06163A`.

---

## 15. Navigation, deep links et redirections

- **Scheme deep link** : `minishop://`. Utilisé par Stripe pour revenir dans l'app après paiement (`minishop://dashboard/billing?success=true`, `minishop://pricing?cancel=true`, `minishop://dashboard/billing`).
- **Garde d'auth** centralisée dans `app/_layout.tsx` (voir §5.1).
- **Redirections clés** : signup → `/pricing` ; login → `/dashboard` ; reset → reste sur place avec Alert ; checkout → `/shop/confirmation` ; confirmation « Done » → `/`.
- **typedRoutes** activé : les chemins de navigation sont typés à la compilation.

---

## 16. Configuration et variables d'environnement

`.env.example` attend :

```
EXPO_PUBLIC_FIREBASE_API_KEY / AUTH_DOMAIN / PROJECT_ID / STORAGE_BUCKET / MESSAGING_SENDER_ID / APP_ID
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
EXPO_PUBLIC_FUNCTIONS_BASE_URL          # ex: https://us-central1-<project>.cloudfunctions.net
EXPO_PUBLIC_PUBLIC_STORE_BASE_URL       # domaine de la vitrine publique web
```

Côté Cloud Functions (à configurer en variables d'environnement / secrets) : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`.

> Incohérence notable : les variables Firebase `EXPO_PUBLIC_FIREBASE_*` du `.env.example` ne sont **pas** utilisées — `services/firebase.ts` contient la config en dur. Seuls `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_FUNCTIONS_BASE_URL` et les URL de store le sont réellement.

---

## 17. Inventaire complet des actions par utilisateur

### Commerçant (Owner)
- Créer un compte (nom, boutique, email, WhatsApp, mot de passe)
- Se connecter / se déconnecter / réinitialiser son mot de passe
- Choisir et payer un abonnement (Starter / Business / Premium)
- Gérer son abonnement (upgrade, portail de facturation Stripe)
- Éditer le profil boutique (nom, WhatsApp, description, livraison)
- Ajouter un produit (nom, prix, description, photo depuis la galerie)
- Modifier un produit existant
- Supprimer un produit (avec confirmation)
- Voir le compteur de photos utilisées vs limite du plan
- Consulter ses commandes en temps réel
- Faire avancer le statut d'une commande
- Partager le lien public de sa boutique (partage natif / copie)
- Recevoir une notification WhatsApp à chaque nouvelle commande

### Client (Customer, non authentifié)
- Ouvrir une boutique via son lien public
- Parcourir les produits disponibles
- Ajouter un produit au panier (mono-article)
- Passer commande (nom, téléphone, WhatsApp, adresse, notes)
- Recevoir une confirmation avec numéro de commande
- Recevoir des notifications WhatsApp de suivi de statut

### Super Admin
- Vérifier son accès (custom claim `admin`)
- Lister tous les commerçants (nom, email, statut d'abonnement, plan)
- *(Droits étendus en base : modifier/supprimer owners, lire/maj commandes, gérer subscriptions et adminUsers — non exposés dans l'UI)*

---

## 18. Lacunes, risques et recommandations

**Sécurité — priorité haute**

1. **Règles Firestore de test ouvertes à tous** (`firestore.rules`, jusqu'au 12/07/2026). Risque critique en production. → Déployer `firebase.rules` (les vraies règles) et supprimer/écraser le fichier de test. Vérifier quel fichier `firebase.json` désigne réellement.
2. **`createOrder` et les fonctions de notification sont publiques.** N'importe qui peut créer des commandes (`allow create: if true`) et appeler `sendNewOrderNotification`/`sendOrderStatusNotification` avec un `orderId`. → Ajouter rate-limiting, App Check, et/ou une validation serveur (par ex. créer la commande **dans** la Function plutôt que côté client).
3. **Config Firebase en dur** dans `services/firebase.ts`. Acceptable pour les clés publiques, mais incohérent avec le `.env.example`. → Centraliser via les variables `EXPO_PUBLIC_FIREBASE_*` et activer **Firebase App Check**.
4. **Validation Cloud Functions faible** (le README le note). → Vérifier la propriété des ressources, valider les corps de requête, restreindre CORS aux origines connues.

**Fonctionnel — à compléter**

5. **Push notifications non branchées** : `registerForPushNotifications` n'est jamais appelé et aucun token n'est persisté. → Appeler au login, stocker le token sur l'owner, envoyer les push depuis les Functions.
6. **Price IDs Stripe placeholders** (`price_replace_*`) et **identifiants Twilio** à configurer. Sans cela, paiement et notifications ne fonctionnent pas.
7. **Index Firestore manquant** : `listOwnerProducts` (`where ownerId` + `orderBy createdAt`) requiert un index composite. `firestore.indexes.json` est vide. → Créer l'index (ou laisser Firestore le proposer au premier appel).
8. **Panier mono-article** : impossible de commander plusieurs produits en une fois. → Implémenter un vrai panier si besoin métier.
9. **`profile.tsx` utilise `setDoc` sans `{ merge: true }`** : la sauvegarde du profil n'écrit que 5 champs et **risque d'écraser** le reste du document owner (ex. `email`, `plan`, `stripeCustomerId`, `subscriptionStatus`, etc.). → **Bug à corriger en priorité** : utiliser `updateDoc` ou `setDoc(..., { merge: true })`.
10. **`accountStatus`** (`suspended`/`disabled`) n'est lu/appliqué nulle part dans l'UI ou les règles. → Le brancher (par ex. bloquer le dashboard si `suspended`).
11. **Collection `subscriptions`** déclarée mais inutilisée (la synchro écrit dans `owners`). → Clarifier ou supprimer.

**Robustesse / qualité**

12. **Pas de fonction de déconnexion exposée dans l'UI** : `logoutOwner` existe dans le service mais aucun bouton « Logout » n'est présent dans le dashboard. → Ajouter un bouton de déconnexion.
13. **`logoUrl`, `businessCategory`, `address`, `orderInstructions`, `quantity` produit** : champs prévus dans les types mais non éditables dans l'UI. → Compléter les formulaires si ces données sont attendues.
14. **Gestion d'erreurs minimaliste** (Alerts génériques). → Messages plus spécifiques, états vides (« aucune commande », « aucun produit »).
15. **Fallback d'URL de store** codé en dur (`https://strandprotx.com`). → Le rendre cohérent avec le vrai domaine de production.

---

## 19. Annexe — Récapitulatif fichier par fichier

| Fichier | Lignes | Rôle |
|---|---|---|
| `app/_layout.tsx` | 46 | Layout racine, garde d'auth, StripeProvider |
| `app/index.tsx` | 63 | Écran d'accueil marketing |
| `app/login.tsx` | 15 | Connexion |
| `app/signup.tsx` | 15 | Inscription |
| `app/reset-password.tsx` | 9 | Réinitialisation mot de passe |
| `app/pricing.tsx` | 8 | Choix du plan + Checkout Stripe |
| `app/dashboard/_layout.tsx` | 2 | Layout du dashboard (header) |
| `app/dashboard/index.tsx` | 8 | Tableau de bord (navigation) |
| `app/dashboard/profile.tsx` | 10 | Profil boutique |
| `app/dashboard/products.tsx` | 111 | CRUD produits + upload photo + quota |
| `app/dashboard/orders.tsx` | 54 | Commandes temps réel + transitions de statut |
| `app/dashboard/share.tsx` | 91 | Génération + partage du lien public |
| `app/dashboard/billing.tsx` | 8 | Facturation / portail Stripe |
| `app/shop/[slug].tsx` | 13 | Vitrine publique |
| `app/shop/checkout.tsx` | 11 | Formulaire de commande |
| `app/shop/confirmation.tsx` | 7 | Confirmation de commande |
| `app/admin/index.tsx` | 50 | Super Admin (liste owners) |
| `components/Button.tsx` | 28 | Bouton (4 variantes) |
| `components/Input.tsx` | 4 | Champ texte |
| `components/Card.tsx` | 5 | Carte conteneur |
| `components/Screen.tsx` | 21 | Wrapper safe-area + scroll |
| `components/ProductCard.tsx` | 15 | Carte produit |
| `components/PricingCard.tsx` | 21 | Carte tarifaire |
| `services/firebase.ts` | 25 | Init Firebase (auth/db/storage) |
| `services/authService.ts` | 46 | Auth + création owner |
| `services/productService.ts` | 119 | Produits + upload + quota |
| `services/orderService.ts` | 95 | Commandes + notifications |
| `services/subscriptionService.ts` | 29 | Sessions Stripe |
| `services/notificationService.ts` | 22 | Push Expo (non branché) |
| `types/Owner.ts` | 27 | Modèle Owner |
| `types/Product.ts` | 13 | Modèle Product |
| `types/Order.ts` | 25 | Modèle Order + OrderItem |
| `constants/plans.ts` | 32 | Plans + quotas |
| `constants/colors.ts` | 17 | Palette de couleurs |
| `functions/src/index.ts` | — | 5 Cloud Functions (Stripe + Twilio) |
| `firebase.rules` | — | Règles Firestore par rôle (à déployer) |
| `firestore.rules` | — | Règles de test ouvertes (à NE PAS déployer) |
| `storage.rules` | — | Règles Storage (photos produits) |

---

*Fin de l'analyse.*

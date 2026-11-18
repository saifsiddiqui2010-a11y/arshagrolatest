# Arsh Agro Admin mobile app

Cross-platform Expo source for the private Arsh Agro store administrator app. The first release target is Android/Google Play; the app configuration also includes iOS identifiers.

## What it manages

- Dashboard metrics
- Orders, fulfillment status, courier, and tracking number
- Product details and inventory
- Customer profiles
- Wholesale inquiries
- Public store settings

The app signs in with Firebase Authentication and authorizes only the store administrator email addresses. Firestore Security Rules must also authorize each request; the app UI is not a security boundary.

## Current integration status

The app reads and manages the live Firestore collections `orders`, `products`, `users`, `inquiries`, and `settings/store`. New-order alerts use Expo push tokens saved to `admin_devices/{adminUid}`. The app source is not a published or installed mobile app yet; push delivery will not begin until the Functions, rules, EAS project, and native push credentials are configured and deployed.

The storefront creates orders through Firebase callable functions. The server recalculates prices and stock, verifies Razorpay payments, and creates orders; client-side order writes are blocked by Firestore Rules. The former local JSON server and payment simulator are not used by checkout.

### Firebase backend setup

Cloud Functions deployment requires the Firebase project to be on the Blaze plan and may incur usage charges. Once billing is enabled and the Firebase CLI is authenticated to the correct project:

```sh
npm install --prefix functions
firebase functions:secrets:set RAZORPAY_KEY_ID
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase deploy --only functions,firestore:rules,storage,hosting
```

Enter the Razorpay credentials only into the Firebase CLI secret prompts. Never put the secret in the website, Firestore, or this app. If online payments are not configured, Cash on Delivery can still be enabled after Functions are deployed.

Pending checkouts and rate-limit records carry an `expiresAt` timestamp. Enable Firestore TTL for both collection groups in the configured Firestore database so abandoned checkout address data and rate-limit records are automatically removed.

### Website image uploads

The website admin uploads product and page-content images to Firebase Storage. Uploads are limited to JPG, PNG, WebP, or GIF files up to 5 MB; only the configured admin email accounts can upload, while published images are publicly readable. Enable the project's Storage bucket and deploy `storage.rules` before using the upload controls:

```sh
firebase deploy --only storage
```

### Delhivery shipment booking

The Functions can submit new COD and paid orders to Delhivery and save the returned waybill to the order. Before enabling it:

1. Confirm with Delhivery that the account has API access and that the shipment-creation endpoint is enabled for it.
2. Set `DELHIVERY_API_TOKEN` using the Firebase CLI secret prompt; never put the token in Firestore, the website, or this app:

   ```sh
   firebase functions:secrets:set DELHIVERY_API_TOKEN
   ```

3. If Delhivery provides a staging environment for the account, configure `DELHIVERY_API_BASE_URL` to its approved Delhivery host. The default is `https://track.delhivery.com`.
4. In the website Admin Settings, enter the pickup-location name exactly as registered with Delhivery, then enable Delhivery.
5. In Inventory, set each product's packed shipping weight in grams. Orders lacking a valid pickup location, product weight, or address are not booked and show a configuration status in Orders.
6. Deploy Functions, Firestore Rules, and Hosting together. Verify with a Delhivery-approved test order before accepting real orders.

The integration creates the shipment/waybill; it does not schedule a physical warehouse pickup. Check the Delhivery dashboard for `review_required` results before retrying, because an inconclusive response may have created a shipment already. Older orders can be submitted from the Orders admin screen after configuration.

### Push setup

1. Create/link the app to an Expo EAS project and set `EXPO_PUBLIC_EAS_PROJECT_ID` to that project's ID for the app build.
2. Configure Android FCM credentials in EAS (and APNs credentials if publishing for iOS).
3. Build and install the app on a physical device. Sign in with an authorized admin account and allow notifications.
4. Deploy the Firebase Functions and rules. The Functions send a push when a new order document is created.

The device must have the EAS/FCM/APNs credentials configured before Expo can deliver push notifications. The app displays a setup warning if it has no EAS project ID.

## Run locally

From this directory:

```sh
npm install
npm start
```

The app gets Firebase project configuration from the root `firebase-applet-config.json` through `app.config.js`. Do not add service-account keys or other server credentials to this app.

Email/password sign-in can be used if the administrator Firebase account has a password. For native Google sign-in, create Android and iOS OAuth client IDs for the application package/bundle ID `com.arshagroindustry.admin`, then provide:

- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

Use the existing Firebase project's web OAuth client ID for the web client. Do not commit local `.env` files.

## Build

After setting up EAS, the Firebase backend, push credentials, and the required developer accounts:

```sh
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

The production Android profile creates an Android App Bundle for Google Play. App Store publishing and Play Store submission require the owner's developer accounts and review.

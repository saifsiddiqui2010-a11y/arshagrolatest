# Firebase deployment

The static frontend is deployed to Firebase Hosting. The API is not deployed
yet, so API-backed features such as products, sign-in, and checkout will not
work until the Cloud Run backend is deployed and the `/api/**` rewrite is added.

## Deploy the static frontend

From the project directory:

```sh
npm run build
firebase deploy --only hosting --project gen-lang-client-0993911775
```

## Add the API later

Link an active billing account to project `gen-lang-client-0993911775` and
enable Cloud Run and Cloud Build. Cloud Run requires billing even if usage
stays within its free tier. Deploy the API:

```sh
gcloud run deploy arshagro-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --project gen-lang-client-0993911775
```

Then add the `/api/**` Cloud Run rewrite for `arshagro-api` in `firebase.json`,
build, and redeploy Hosting.

Configure production `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as Cloud Run
secrets before accepting payments.

## Production data warning

The API currently reads and writes `data/db.json`. Cloud Run's container
filesystem is temporary and each instance has its own copy, so data changes
can be lost on restart or differ between instances. The deployment is suitable
for preview/testing only until the API's data store is migrated to persistent,
shared storage such as Firestore.

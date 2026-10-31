# Market Arena - what I changed and what you must do

Project name and file names are NOT changed.

## How to use this folder
1. Copy everything in this folder into your project and say YES to overwrite.
   Your own `.env` is not inside, so keep your own `.env` file.
2. Open your `.env` and add one new line (only needed for Boost payments):
   `VITE_FLUTTERWAVE_PUBLIC_KEY=pk_test_xxxxxxxx`
   (see `.env.example`). Use the PUBLIC key only, never the secret key.
3. Run `npm run dev`. Stop and start it again after changing `.env`.
4. Firebase Console -> Firestore Database -> Rules -> paste everything from `firestore.rules` -> Publish.
5. Before you go live: Firebase -> Authentication -> Settings -> Authorized domains -> add your Vercel/Netlify domain.
   Also add all `.env` values inside Vercel/Netlify settings.

## Fixed
- WhatsApp code was `235` (Chad) in ProductCard. Now `234`, one helper for all pages (`utils/phone.js`).
- Photos are shrunk before saving (about 50KB each), so posting no longer fails. No paid Firebase Storage needed.
- Real `pages/Home.jsx` added: feed, search, location filter, category filter, boosted items first, "Load more".
- Sold items no longer show on Home. Item page shows SOLD and hides the contact buttons.
- Google users: default location is now UNICAL, and WhatsApp is asked when they post.
- Profile has "Edit Profile" (name, WhatsApp, area).
- Login: forgot password, number check, better error messages, hint for WhatsApp/Facebook in-app browsers.
- Post Item: login check at start, WhatsApp field, price check, photo checks.
- My Listings: newest first, error messages, click item to open it, Boost button.
- 404 page, scroll to top, spinner while the app starts, `no-scrollbar` fix, page title and description.
- Firebase Storage code and the API key `console.log` removed. `.env` added to `.gitignore`.
- Firestore security rules added (`firestore.rules`).

## New: Boost (Paystack)
My Listings -> Boost -> pay N500 (3 days) or N1,000 (7 days). The item is pinned to the top with a FEATURED badge, and the payment is saved in `transactions`.
Test with a `pk_test_` key first.

## Still not done
- Verified Seller badge (N1,000) and vendor subscription: not built yet.
- Boost is confirmed from the browser. To stop cheating, later verify the payment on a server (Vercel serverless function + Paystack secret key).
- Terms, Privacy and Contact pages (Paystack will ask for them before live keys).
- Edit listing, report listing, real favicon/logo.
- Not tested on a real phone yet. I could not run `npm install` or `npm run build` here (no internet), so run the app once and tell me any error.

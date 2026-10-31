import { doc, updateDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const BRAND_PLANS = [
  { id: 'free', label: 'Free Trial', price: 0, days: 7, postLimit: 1, description: '1 listing limit for 7 days' },
  { id: 'weekly', label: '1 Week Pass', price: 1500, days: 7, postLimit: 'unlimited', description: 'Unlimited posts for 7 days' },
  { id: 'monthly', label: '1 Month Membership', price: 5000, days: 30, postLimit: 'unlimited', description: 'Unlimited posts + Priority' }
];

export const startBrandSubscription = async ({ brandData, plan, email, userId, onSuccess, onError, onClose }) => {
  const durationMs = plan.days * 24 * 60 * 60 * 1000;
  const subscriptionExpiresAt = Date.now() + durationMs;

  const activateBrandInDb = async (reference = 'FREE_PLAN') => {
    try {
      // 1. Save or Update Brand Profile in Firestore
      const brandRef = doc(db, 'brands', userId);
      await setDoc(brandRef, {
        ...brandData,
        ownerId: userId,
        subscriptionStatus: 'active',
        subscriptionPlan: plan.id,
        postLimit: plan.postLimit,
        postCount: 0, // Track posts under current free plan
        subscriptionExpiresAt,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Mark User profile as a Brand Owner
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBrandOwner: true,
        brandId: userId
      });

      // 3. Record Payment Transaction
      await addDoc(collection(db, 'transactions'), {
        userId,
        amount: plan.price,
        type: 'brand_subscription',
        planId: plan.id,
        flutterwaveReference: reference,
        status: 'success',
        createdAt: serverTimestamp()
      });

      onSuccess?.();
    } catch (err) {
      console.error('Error activating brand:', err);
      onError?.(`Failed to save brand profile. Error: ${err.message}`);
    }
  };

  // IF FREE PLAN: Skip Flutterwave checkout entirely
  if (plan.id === 'free' || plan.price === 0) {
    await activateBrandInDb('FREE_TRIAL_ACTIVATED');
    return;
  }

  // PAID PLANS: Launch Flutterwave
  const public_key = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
  if (!public_key) {
    onError?.('Payment key missing. Check VITE_FLUTTERWAVE_PUBLIC_KEY in .env');
    return;
  }

  let paid = false;

  window.FlutterwaveCheckout({
    public_key,
    tx_ref: `BRAND-${userId.slice(0, 5)}-${Date.now()}`,
    amount: plan.price,
    currency: 'NGN',
    payment_options: 'card, banktransfer, ussd',
    customer: {
      email: email || 'vendor@marketarena.ng',
      name: brandData.brandName || 'Market Arena Brand Owner'
    },
    customizations: {
      title: 'Market Arena',
      description: `Brand Storefront Subscription (${plan.label})`,
      logo: '/logo.png'
    },
    callback: function (response) {
      if (response.status === 'successful' || response.status === 'completed') {
        paid = true;
        const ref = response.transaction_id || response.tx_ref;
        activateBrandInDb(ref);
      } else {
        onError?.('Payment was not completed.');
      }
    },
    onclose: function () {
      if (!paid) onClose?.();
    }
  });
};
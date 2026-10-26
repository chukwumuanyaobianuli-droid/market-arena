import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Opens the Paystack window, then pins the listing to the top.
// Used on the Post Item page. (My Listings has its own copy that still works.)
export const startBoostPayment = ({ listing, plan, email, userId, onSuccess, onError, onClose }) => {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  if (!key) {
    onError?.('Boost is not ready. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file and restart.');
    return;
  }
  if (!window.PaystackPop) {
    onError?.('Payment window did not load. Check your network and try again.');
    return;
  }

  let paid = false;

  const activate = async (reference) => {
    try {
      const featuredUntil = Date.now() + plan.days * 24 * 60 * 60 * 1000;
      await updateDoc(doc(db, 'listings', listing.id), { isFeatured: true, featuredUntil });
      await addDoc(collection(db, 'transactions'), {
        userId,
        listingId: listing.id,
        amount: plan.price,
        type: 'featured_boost',
        paystackReference: reference,
        status: 'success',
        createdAt: serverTimestamp()
      });
      onSuccess?.();
    } catch (err) {
      console.error('Boost save error:', err);
      onError?.(`Payment received but we could not feature the item. Save this reference and contact support: ${reference}`);
    }
  };

  const handler = window.PaystackPop.setup({
    key,
    email,
    amount: plan.price * 100, // Paystack uses kobo
    currency: 'NGN',
    ref: `MA-${listing.id.slice(0, 6)}-${Date.now()}`,
    metadata: { listingId: listing.id, plan: plan.id },
    // Paystack wants a normal function here, not an async one
    callback: function (response) {
      paid = true;
      activate(response.reference);
    },
    onClose: function () {
      if (!paid) onClose?.();
    }
  });
  handler.openIframe();
};

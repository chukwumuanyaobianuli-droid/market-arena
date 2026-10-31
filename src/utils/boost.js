import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Opens the Flutterwave window, then pins the listing ONLY AFTER verified payment.
export const startBoostPayment = ({ listing, plan, email, userId, onSuccess, onError, onClose }) => {
  const public_key = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
  if (!public_key) {
    onError?.('Boost is not ready. Add VITE_FLUTTERWAVE_PUBLIC_KEY to your .env file and restart.');
    return;
  }
  if (typeof window.FlutterwaveCheckout === 'undefined') {
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
        flutterwaveReference: reference,
        status: 'success',
        createdAt: serverTimestamp()
      });
      onSuccess?.();
    } catch (err) {
      console.error('Boost save error:', err);
      onError?.(`Payment received but we could not feature the item. Save this reference and contact support: ${reference}`);
    }
  };

  window.FlutterwaveCheckout({
    public_key,
    tx_ref: `MA-${listing.id.slice(0, 6)}-${Date.now()}`,
    amount: plan.price,
    currency: 'NGN',
    payment_options: 'card, banktransfer, ussd',
    customer: {
      email: email || 'user@marketarena.ng',
      name: 'Market Arena Vendor'
    },
    customizations: {
      title: 'Market Arena',
      description: `Featured Listing Boost (${plan.label})`,
      logo: '/logo.png'
    },
    callback: function (response) {
      // 🔒 VERIFY PAYMENT SUCCESS BEFORE ACTIVATING BOOST
      if (response.status === 'successful' || response.status === 'completed') {
        paid = true;
        const ref = response.transaction_id || response.tx_ref;
        activate(ref);
      } else {
        onError?.('Payment was not completed. Please try again.');
      }
    },
    onclose: function () {
      if (!paid) onClose?.();
    }
  });
};
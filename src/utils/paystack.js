import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const handlePaystackBoost = ({
  item,
  userEmail,
  amountInNaira = 500, // Default ₦500 boost fee
  durationDays = 7,     // Boosted for 7 days
  onSuccess,
  onCancel,
}) => {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_sample_key';

  if (!window.PaystackPop) {
    alert('Paystack SDK failed to load. Please check your internet connection.');
    return;
  }

  const handler = window.PaystackPop.setup({
    key: publicKey,
    email: userEmail || 'vendor@marketarena.ng',
    amount: amountInNaira * 100, // Paystack expects amount in Kobo
    currency: 'NGN',
    ref: `boost_${item.id}_${Date.now()}`,
    metadata: {
      itemId: item.id,
      itemTitle: item.title,
      custom_fields: [
        {
          display_name: "Item Title",
          variable_name: "item_title",
          value: item.title
        }
      ]
    },
    callback: async function (response) {
      // Payment successful - update Firestore document
      try {
        const boostExpiresAt = new Date();
        boostExpiresAt.setDate(boostExpiresAt.getDate() + durationDays);

        const itemRef = doc(db, 'items', item.id);
        await updateDoc(itemRef, {
          isBoosted: true,
          boostedAt: serverTimestamp(),
          boostExpiresAt: boostExpiresAt.toISOString(),
          paystackRef: response.reference,
        });

        if (onSuccess) onSuccess(response);
      } catch (error) {
        console.error('Error updating boosted status:', error);
        alert('Payment succeeded, but failed to activate boost. Please contact support.');
      }
    },
    onClose: function () {
      if (onCancel) onCancel();
    },
  });

  handler.openIframe();
};
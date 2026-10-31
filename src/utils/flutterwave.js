export const handleFlutterwavePayment = ({
  amount,
  email,
  name,
  phone,
  onSuccess,
  onClose
}) => {
  // Check if Flutterwave script loaded
  if (typeof window.FlutterwaveCheckout === 'undefined') {
    alert('Flutterwave SDK failed to load. Check your internet connection.');
    return;
  }

  window.FlutterwaveCheckout({
    public_key: 'FLWPUBK-cce5d4a3408d812380f927ab74fce201-X', // 👈 Replace with your actual Flutterwave Public Key (FLWPUBK_TEST-...)
    tx_ref: `market_arena_${Date.now()}`,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card, banktransfer, ussd',
    customer: {
      email: email,
      phone_number: phone || '08000000000',
      name: name || 'Market Arena User',
    },
    customizations: {
      title: 'Market Arena',
      description: 'Payment for services/boosting',
      logo: 'https://yourdomain.com/logo.png', // Optional logo URL
    },
    callback: function (data) {
      // Called when payment is successful
      console.log('Payment complete: ', data);
      if (onSuccess) onSuccess(data);
      // Close modal
      closePaymentModal();
    },
    onclose: function () {
      if (onClose) onClose();
    },
  });
};
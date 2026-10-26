// Turn any Nigerian number into 234XXXXXXXXXX (10 digits after 234).
// Works for: 08012345678, 8012345678, +2348012345678, 234 801 234 5678
export const toIntlPhone = (value = '') => {
  let digits = String(value).replace(/\D/g, '');
  if (digits.startsWith('234')) digits = digits.slice(3);
  digits = digits.replace(/^0+/, '');
  return digits.length === 10 ? `234${digits}` : '';
};

export const isValidNgPhone = (value) => toIntlPhone(value) !== '';

// Returns '' when the number is not valid, so the page can hide the button
export const whatsappLink = (value, message = '') => {
  const phone = toIntlPhone(value);
  if (!phone) return '';
  return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

export const telLink = (value) => {
  const phone = toIntlPhone(value);
  return phone ? `tel:+${phone}` : '';
};

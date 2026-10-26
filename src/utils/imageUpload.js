// Firebase Storage needs payment, so photos are saved inside Firestore as Base64.
// A Firestore document can only be about 1MB, so every photo is shrunk first.
// A normal phone photo becomes about 40-90KB after this.
const MAX_WIDTH = 700;
const QUALITY = 0.55;

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the photo. Try another one.'));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This photo type is not supported. Use a JPG or PNG photo.'));
    img.src = src;
  });

// Same name as before, now it also compresses the image
export const convertImageToBase64 = async (file) => {
  const original = await readFile(file);
  const img = await loadImage(original);

  const scale = Math.min(1, MAX_WIDTH / img.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // PNG with see-through parts becomes white, not black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', QUALITY);
};

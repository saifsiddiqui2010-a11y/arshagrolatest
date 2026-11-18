import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { app, auth } from './firebase';

const storage = getStorage(app);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedImageTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function uploadAdminImage(file: File, folder: 'products' | 'website'): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sign in as an administrator before uploading images.');
  }

  const extension = allowedImageTypes[file.type];
  if (!extension) {
    throw new Error('Choose a JPG, PNG, WebP, or GIF image.');
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image size must be between 1 byte and 5 MB.');
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const imageRef = ref(storage, `admin-uploads/${user.uid}/${folder}/${filename}`);
  const uploadedImage = await uploadBytes(imageRef, file, {
    contentType: file.type,
    cacheControl: 'public,max-age=31536000,immutable',
  });
  return getDownloadURL(uploadedImage.ref);
}

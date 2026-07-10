const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('Cloudinary not configured. Falling back to local storage and mock URLs.');
}

const uploadImage = async (file) => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'fixmycity',
      });
      // Delete local temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      throw err;
    }
  } else {
    // If not configured, we simulate storage and return a placeholder data-url or local route.
    // For local fallback, we will just return a mock URL using the file name or inline placeholder.
    // Let's create a simulated public URL or read file to base64.
    try {
      const base64Data = fs.readFileSync(file.path, { encoding: 'base64' });
      const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return dataUrl;
    } catch (error) {
      console.error('Local fallback read error:', error);
      return 'https://images.unsplash.com/photo-1597089548599-19794be58428?w=800'; // Fallback street light image
    }
  }
};

module.exports = { cloudinary, uploadImage };

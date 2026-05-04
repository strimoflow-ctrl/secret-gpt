import axios from 'axios';

const IMGBB_API_KEY = "4c0c2a2c16a284fcd18ea8ef0cf199ed"; // Apni key yaha daalo

/**
 * Image ko ImgBB pe upload karta hai
 * @param {File|string} imageFile - Binay data ya Base64 string
 */
export const uploadImageToImgBB = async (imageFile) => {
  // ImgBB ko Form Data chahiye hota hai
  const formData = new FormData();
  
  if (typeof imageFile === 'string' && imageFile.startsWith('data:image')) {
    // Strip the data:image/jpeg;base64, prefix for ImgBB
    const base64Data = imageFile.split(',')[1];
    formData.append('image', base64Data);
  } else {
    // Handle File object directly from the file picker
    formData.append('image', imageFile);
  }

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );

    if (response.data.success) {
      // Humein image ka direct URL mil jayega
      return response.data.data.url;
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    // Throw error so it can be handled and show a Toast/Error in UI
    throw error;
  }
};
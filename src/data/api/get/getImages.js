// data/api/get/getImages.js
import axios from 'axios';

const API_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api'; // Coincide con tus otras APIs

export const getAvailableImagesApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/Products/images`);
    return response;
  } catch (error) {
    console.error('Error fetching available images:', error);
    throw error;
  }
};
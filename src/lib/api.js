// Campus Buddy Frontend API Client
// Set VITE_API_URL in .env to point to your deployed Railway/cloud backend URL.
// Falls back to LAN IP for native (Android) or localhost for browser dev.
import { Capacitor } from '@capacitor/core';

const getApiBaseUrl = () => {
  // If a production/deployed URL is configured, always use it (works on any network)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // On a real Android device, 'localhost' means the phone itself — must use LAN IP
  if (Capacitor.isNativePlatform()) {
    return 'http://10.207.19.187:5000/api';
  }
  // Web browser (dev mode)
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper to get stored auth token
export const getAuthToken = () => localStorage.getItem('cb_token');

// Helper to save full session
export const saveAuthSession = (token, user) => {
  if (token) localStorage.setItem('cb_token', token);
  if (user) localStorage.setItem('cb_user', JSON.stringify(user));
};

// Helper to get stored user
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('cb_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// Helper to clear session on logout
export const logoutAuthSession = () => {
  localStorage.removeItem('cb_token');
  localStorage.removeItem('cb_user');
};

// Sign Up
export async function registerUser({ username, email, password, fullName, universityName }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, fullName, universityName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.token && data.user) saveAuthSession(data.token, data.user);
    return data;
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes('fetch')) {
      throw new Error('Could not connect to backend server. Make sure node server.js is running.');
    }
    throw err;
  }
}

// Sign In / Login
export async function loginUser({ username, password }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token && data.user) saveAuthSession(data.token, data.user);
    return data;
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes('fetch')) {
      throw new Error('Could not connect to backend server. Make sure node server.js is running.');
    }
    throw err;
  }
}

// Fetch Current User Profile
export async function fetchUserProfile() {
  const token = getAuthToken();
  if (!token) return getStoredUser();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return getStoredUser();
    const user = await res.json();
    saveAuthSession(token, user);
    return user;
  } catch (err) {
    return getStoredUser();
  }
}

// Fetch All Campus Products from MongoDB
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (err) {
    return [];
  }
}

// Upload Product Image to Cloudinary via Backend
export async function uploadProductImage(imageFile) {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(`${API_BASE_URL}/products/upload-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Image upload failed');
  return data.imageUrl;
}

// Create New Product Listing in MongoDB
export async function createProductListing(productData) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to post product');
  return data;
}

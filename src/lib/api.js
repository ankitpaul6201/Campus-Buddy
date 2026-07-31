// Campus Buddy Frontend API Client
// Auth is handled by Clerk. Use getToken() from useAuth() for protected calls.
// Set VITE_API_URL in .env to point to your deployed Railway/cloud backend.
import { Capacitor } from '@capacitor/core';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (Capacitor.isNativePlatform()) {
    return 'http://10.207.19.187:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// ─── Public (no auth needed) ───────────────────────────────────────────────

// Fetch all active campus product listings
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch {
    return [];
  }
}

// ─── Authenticated (requires Clerk token) ──────────────────────────────────

// Upload product image to Cloudinary via backend
// Pass getToken from useAuth() e.g: const { getToken } = useAuth()
export async function uploadProductImage(imageFile, getToken) {
  const token = await getToken();
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(`${API_BASE_URL}/products/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Image upload failed');
  return data.imageUrl;
}

// Create a new product listing
export async function createProductListing(productData, getToken) {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to post product');
  return data;
}

// Fetch the current user's profile from backend (synced with Clerk)
export async function fetchUserProfile(getToken) {
  const token = await getToken();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

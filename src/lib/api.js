// Campus Buddy Frontend API Client
// Traditional JWT Authentication directly with MongoDB Atlas
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

// ─── Token Helpers ─────────────────────────────────────────────────────────

export const getAuthToken = () => localStorage.getItem('campus_jwt_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('campus_jwt_token', token);
  else localStorage.removeItem('campus_jwt_token');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('campus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Authentication API (MongoDB Atlas) ───────────────────────────────────

// Register a new user in MongoDB Atlas
export async function apiSignup(userData) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');

  if (data.token) {
    setAuthToken(data.token);
    localStorage.setItem('campus_user', JSON.stringify(data.user));
  }
  return data;
}

// Log in an existing user from MongoDB Atlas
export async function apiLogin(credentials) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');

  if (data.token) {
    setAuthToken(data.token);
    localStorage.setItem('campus_user', JSON.stringify(data.user));
  }
  return data;
}

// Fetch the current logged-in user directly from MongoDB Atlas
export async function apiGetMe() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        apiLogout();
      }
      return null;
    }

    const user = await res.json();
    localStorage.setItem('campus_user', JSON.stringify(user));
    return user;
  } catch {
    return getStoredUser();
  }
}

// Update profile directly in MongoDB Atlas
export async function apiUpdateProfile(profileData) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/auth/me/university`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update failed');

  if (data.user) {
    localStorage.setItem('campus_user', JSON.stringify(data.user));
  }
  return data;
}

// Update password for logged in user
export async function apiUpdatePassword({ currentPassword, newPassword }) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/auth/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Password update failed');
  return data;
}

// Reset password with email
export async function apiResetPassword({ email, newPassword }) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Password reset failed');
  return data;
}

// Log out user
export function apiLogout() {
  localStorage.removeItem('campus_jwt_token');
  localStorage.removeItem('campus_user');
  localStorage.removeItem('user_custom_avatar');
  localStorage.removeItem('user_custom_fullname');
  localStorage.removeItem('user_dob');
  localStorage.removeItem('user_course');
  localStorage.removeItem('user_year');
  localStorage.removeItem('user_id_verified');
  localStorage.removeItem('user_student_id_url');
}

// ─── Public Endpoints ──────────────────────────────────────────────────────

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

// Upload Student ID card to Cloudinary (folder: campus_buddy_verification)
export async function uploadStudentId(file) {
  const formData = new FormData();
  formData.append('studentId', file);

  const res = await fetch(`${API_BASE_URL}/auth/upload-id`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload student ID');
  return data.url;
}

// ─── Authenticated Product Operations ──────────────────────────────────────

// Upload product image to Cloudinary via backend
export async function uploadProductImage(imageFile, explicitToken) {
  const token = explicitToken || getAuthToken();
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
export async function createProductListing(productData, explicitToken) {
  const token = explicitToken || getAuthToken();
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

// Legacy fetchUserProfile alias
export async function fetchUserProfile() {
  return apiGetMe();
}

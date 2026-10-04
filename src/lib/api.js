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

// Fetch all active campus product listings, optionally filtered by university
export async function fetchProducts(university) {
  try {
    const url = university 
      ? `${API_BASE_URL}/products?university=${encodeURIComponent(university)}` 
      : `${API_BASE_URL}/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    if (Array.isArray(data)) {
      // Sync to local cache
      const existingCached = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
      const mergedMap = new Map();
      existingCached.forEach(p => mergedMap.set(p._id || p.id, p));
      data.forEach(p => mergedMap.set(p._id || p.id, p));
      localStorage.setItem('campus_products_cache', JSON.stringify(Array.from(mergedMap.values())));
      return data;
    }
    return [];
  } catch (err) {
    console.warn('Backend fetchProducts unavailable, using local cache:', err);
    try {
      const cached = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
      if (university && university.trim()) {
        const u = university.toLowerCase().trim();
        return cached.filter(p => 
          (p.campusName && p.campusName.toLowerCase().includes(u)) ||
          (p.universityName && p.universityName.toLowerCase().includes(u)) ||
          (p.seller?.universityName && p.seller.universityName.toLowerCase().includes(u))
        );
      }
      return cached;
    } catch {
      return [];
    }
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
  let createdProduct = null;

  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (res.ok) {
      createdProduct = await res.json();
    }
  } catch (err) {
    console.warn('Backend product creation offline, storing locally:', err);
  }

  // If backend was unreachable or returned product, ensure it's safely stored locally
  if (!createdProduct) {
    const storedUser = getStoredUser();
    createdProduct = {
      _id: 'prod_' + Date.now(),
      ...productData,
      status: 'active',
      createdAt: new Date().toISOString(),
      seller: {
        _id: storedUser?.id || storedUser?._id || 'user_me',
        fullName: storedUser?.fullName || storedUser?.name || 'Student Seller',
        avatar: storedUser?.avatar || '/avatar.svg',
        universityName: productData.universityName || storedUser?.universityName || 'Campus Member',
        isVerified: Boolean(storedUser?.isVerified)
      }
    };
  }

  // Sync to local user ads and products cache
  try {
    const userAds = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
    const updatedUserAds = [createdProduct, ...userAds.filter(a => (a._id || a.id) !== (createdProduct._id || createdProduct.id))];
    localStorage.setItem('campus_user_ads', JSON.stringify(updatedUserAds));

    const allProducts = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
    const updatedAll = [createdProduct, ...allProducts.filter(a => (a._id || a.id) !== (createdProduct._id || createdProduct.id))];
    localStorage.setItem('campus_products_cache', JSON.stringify(updatedAll));
  } catch (e) {
    console.warn('Failed to sync product to localStorage:', e);
  }

  return createdProduct;
}

// Fetch all listings for the logged-in user
export async function fetchMyAds() {
  const token = getAuthToken();
  try {
    if (token) {
      const res = await fetch(`${API_BASE_URL}/products/my-ads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem('campus_user_ads', JSON.stringify(data));
          return data;
        }
      }
    }
  } catch (err) {
    console.warn('Backend my-ads unavailable, using local cache:', err);
  }

  try {
    return JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
  } catch {
    return [];
  }
}

// Update status of product (active / sold)
export async function updateProductStatus(productId, status) {
  const token = getAuthToken();
  try {
    if (token) {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        // Update local storage
        syncLocalProductStatus(productId, status);
        return updated;
      }
    }
  } catch (err) {
    console.warn('Failed to patch product status on backend:', err);
  }

  syncLocalProductStatus(productId, status);
  return { _id: productId, status };
}

function syncLocalProductStatus(id, status) {
  try {
    const userAds = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
    const updated = userAds.map(ad => (ad._id === id || ad.id === id) ? { ...ad, status } : ad);
    localStorage.setItem('campus_user_ads', JSON.stringify(updated));

    const cached = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
    const updatedCached = cached.map(ad => (ad._id === id || ad.id === id) ? { ...ad, status } : ad);
    localStorage.setItem('campus_products_cache', JSON.stringify(updatedCached));
  } catch {}
}

// Delete product listing
export async function deleteProductListing(productId) {
  const token = getAuthToken();
  try {
    if (token) {
      await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (err) {
    console.warn('Failed to delete on backend:', err);
  }

  try {
    const userAds = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
    localStorage.setItem('campus_user_ads', JSON.stringify(userAds.filter(ad => (ad._id || ad.id) !== productId)));

    const cached = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
    localStorage.setItem('campus_products_cache', JSON.stringify(cached.filter(ad => (ad._id || ad.id) !== productId)));
  } catch {}
}

// ─── Real Chat Operations ──────────────────────────────────────────────────

// Fetch all active conversations for current user
export async function fetchConversations() {
  const token = getAuthToken();
  try {
    if (token) {
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem('campus_conversations_cache', JSON.stringify(data));
          return data;
        }
      }
    }
  } catch (err) {
    console.warn('Backend chat fetch offline, reading cache:', err);
  }

  try {
    return JSON.parse(localStorage.getItem('campus_conversations_cache') || '[]');
  } catch {
    return [];
  }
}

// Start or get an existing conversation for a product
export async function startConversation({ sellerId, productId, initialMessage }) {
  const token = getAuthToken();
  let conversation = null;
  try {
    if (token) {
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sellerId, productId, initialMessage })
      });
      if (res.ok) {
        conversation = await res.json();
      }
    }
  } catch (err) {
    console.warn('Backend start conversation offline, creating local:', err);
  }

  if (!conversation) {
    const currentUser = getStoredUser();
    const convId = 'conv_' + (productId || 'p') + '_' + (sellerId || 's');
    conversation = {
      _id: convId,
      id: convId,
      participants: [
        { _id: currentUser?.id || currentUser?._id || 'me', fullName: currentUser?.fullName || 'Me' },
        { _id: sellerId, fullName: 'Seller' }
      ],
      product: { _id: productId },
      lastMessage: initialMessage || 'Conversation started',
      lastMessageAt: new Date().toISOString(),
      messages: initialMessage ? [
        {
          _id: 'msg_' + Date.now(),
          sender: currentUser?.id || currentUser?._id || 'me',
          text: initialMessage,
          createdAt: new Date().toISOString(),
          read: true
        }
      ] : []
    };
  }

  try {
    const convs = JSON.parse(localStorage.getItem('campus_conversations_cache') || '[]');
    const updated = [conversation, ...convs.filter(c => (c._id || c.id) !== (conversation._id || conversation.id))];
    localStorage.setItem('campus_conversations_cache', JSON.stringify(updated));
  } catch {}

  return conversation;
}

// Fetch messages for a conversation
export async function fetchMessages(conversationId) {
  const token = getAuthToken();
  try {
    if (token) {
      const res = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (err) {
    console.warn('Backend fetch messages offline:', err);
  }

  try {
    const convs = JSON.parse(localStorage.getItem('campus_conversations_cache') || '[]');
    const target = convs.find(c => (c._id || c.id) === conversationId);
    return target?.messages || [];
  } catch {
    return [];
  }
}

// Send a message in a conversation
export async function sendMessage(conversationId, text) {
  const token = getAuthToken();
  let message = null;
  try {
    if (token) {
      const res = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        message = await res.json();
      }
    }
  } catch (err) {
    console.warn('Backend send message offline, saving locally:', err);
  }

  if (!message) {
    const currentUser = getStoredUser();
    message = {
      _id: 'msg_' + Date.now(),
      sender: currentUser?.id || currentUser?._id || 'me',
      text,
      createdAt: new Date().toISOString(),
      read: true
    };
  }

  try {
    const convs = JSON.parse(localStorage.getItem('campus_conversations_cache') || '[]');
    const updated = convs.map(c => {
      if ((c._id || c.id) === conversationId) {
        return {
          ...c,
          lastMessage: text,
          lastMessageAt: new Date().toISOString(),
          messages: [...(c.messages || []), message]
        };
      }
      return c;
    });
    localStorage.setItem('campus_conversations_cache', JSON.stringify(updated));
  } catch {}

  return message;
}

// Legacy fetchUserProfile alias
export async function fetchUserProfile() {
  return apiGetMe();
}

// Utility: Format price consistently in Indian Rupees (₹)
export function formatRupeePrice(p) {
  if (p === null || p === undefined || p === '') return '₹0';
  if (typeof p === 'number') return `₹${p.toLocaleString('en-IN')}`;
  const str = String(p).trim();
  if (str.startsWith('$')) {
    const num = parseFloat(str.slice(1).replace(/,/g, ''));
    return isNaN(num) ? `₹${str.slice(1)}` : `₹${num.toLocaleString('en-IN')}`;
  }
  if (str.startsWith('₹')) return str;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? `₹${str}` : `₹${num.toLocaleString('en-IN')}`;
}


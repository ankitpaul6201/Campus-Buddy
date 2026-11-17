// Campus Buddy Frontend API Client
// Traditional JWT Authentication directly with MongoDB Atlas
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://52.62.63.200:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// ─── Native HTTP Bridge ───────────────────────────────────────────────────
// Routes requests via Android Native OkHttp on devices to bypass WebView restrictions
const customFetch = async (url, options = {}) => {
  if (Capacitor.isNativePlatform()) {
    try {
      const method = (options.method || 'GET').toUpperCase();
      let data = undefined;
      if (options.body) {
        if (typeof options.body === 'string') {
          try {
            data = JSON.parse(options.body);
          } catch {
            data = options.body;
          }
        } else {
          data = options.body;
        }
      }

      const res = await CapacitorHttp.request({
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        data,
      });

      return {
        ok: res.status >= 200 && res.status < 300,
        status: res.status,
        statusText: String(res.status),
        json: async () => (typeof res.data === 'string' ? JSON.parse(res.data) : res.data),
        text: async () => (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)),
        headers: {
          get: (h) => (res.headers ? res.headers[h.toLowerCase()] || res.headers[h] : null),
        },
      };
    } catch (nativeErr) {
      console.warn('[Native HTTP Error, trying web fetch]:', nativeErr);
    }
  }
  return window.fetch(url, options);
};

const fetch = customFetch;

// ─── Token Helpers ─────────────────────────────────────────────────────────

export const getAuthToken = () => localStorage.getItem('campus_jwt_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('campus_jwt_token', token);
  else localStorage.removeItem('campus_jwt_token');
  // Wipe legacy shared user ads cache to prevent cross-account leak
  localStorage.removeItem('campus_user_ads');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('campus_user');
    const user = raw ? JSON.parse(raw) : null;
    if (user && !user.phone) {
      const storedPhone = localStorage.getItem('user_phone');
      if (storedPhone) user.phone = storedPhone;
    }
    return user;
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
    const userToStore = {
      ...(data.user || {}),
      phone: data.user?.phone || userData.phone || userData.phoneNumber || ''
    };
    localStorage.setItem('campus_user', JSON.stringify(userToStore));
    if (userToStore.phone) {
      localStorage.setItem('user_phone', userToStore.phone);
    }
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

// Update profile directly in MongoDB Atlas (with offline cache resilience)
export async function apiUpdateProfile(profileData) {
  const token = getAuthToken();
  let updatedUser = null;

  if (token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me/university`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          updatedUser = data.user;
          localStorage.setItem('campus_user', JSON.stringify(data.user));
          if (data.user.avatar) localStorage.setItem('user_custom_avatar', data.user.avatar);
          if (data.user.fullName) localStorage.setItem('user_custom_fullname', data.user.fullName);
          if (data.user.phone) {
            localStorage.setItem('user_phone', data.user.phone);
            // Synchronize updated phone number across local ad caches immediately
            const newPhone = data.user.phone;
            const uid = String(data.user._id || data.user.id || '');
            const updateAdPhone = (ad) => {
              if (!ad) return ad;
              const sellerId = typeof ad.seller === 'object' ? String(ad.seller?._id || ad.seller?.id || '') : String(ad.seller || '');
              if (sellerId === uid || !sellerId) {
                return {
                  ...ad,
                  phone: newPhone,
                  contactNumber: newPhone,
                  seller: typeof ad.seller === 'object' ? { ...ad.seller, phone: newPhone } : ad.seller
                };
              }
              return ad;
            };

            try {
              if (uid) {
                const uKey = `campus_user_ads_${uid}`;
                const uAds = JSON.parse(localStorage.getItem(uKey) || '[]');
                if (Array.isArray(uAds)) {
                  localStorage.setItem(uKey, JSON.stringify(uAds.map(updateAdPhone)));
                }
              }
              const generalAds = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
              if (Array.isArray(generalAds)) {
                localStorage.setItem('campus_user_ads', JSON.stringify(generalAds.map(updateAdPhone)));
              }
              const prodCache = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
              if (Array.isArray(prodCache)) {
                localStorage.setItem('campus_products_cache', JSON.stringify(prodCache.map(updateAdPhone)));
              }
            } catch (syncErr) {
              console.warn('Local ad phone sync warning:', syncErr);
            }
          }
        }
        return data;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server update failed (${res.status})`);
      }
    } catch (err) {
      console.warn('Backend update profile failed:', err);
      throw err;
    }
  }

  // Fallback: merge and update local user cache
  const currentUser = getStoredUser() || {};
  const mergedUser = {
    ...currentUser,
    ...profileData,
    ...(updatedUser || {})
  };
  localStorage.setItem('campus_user', JSON.stringify(mergedUser));
  if (mergedUser.phone) {
    localStorage.setItem('user_phone', mergedUser.phone);
  }
  return { user: mergedUser };
}

// Fetch single product listing by ID with fresh seller contact info from MongoDB
export async function fetchProductById(productId) {
  if (!productId) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('fetchProductById unavailable:', err);
  }
  return null;
}

// Upload avatar directly to Cloudinary and persist to user profile
export async function apiUploadAvatar(fileOrBase64) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  let body;
  let headers = { Authorization: `Bearer ${token}` };

  if (typeof fileOrBase64 === 'string') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ avatar: fileOrBase64 });
  } else {
    const formData = new FormData();
    formData.append('avatar', fileOrBase64);
    body = formData;
  }

  const res = await fetch(`${API_BASE_URL}/auth/me/avatar`, {
    method: 'POST',
    headers,
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload profile picture');

  if (data.user) {
    localStorage.setItem('campus_user', JSON.stringify(data.user));
    if (data.user.avatar) {
      localStorage.setItem('user_custom_avatar', data.user.avatar);
    }
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

// Request forgot password verification code
export async function apiForgotPassword({ email }) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to request verification code');
  return data;
}

// Verify forgot password code before entering new password
export async function apiVerifyResetCode({ email, code }) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid verification code');
  return data;
}

// Reset password with email & verification code
export async function apiResetPassword({ email, code, newPassword }) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Password reset failed');

  if (data.token) {
    setAuthToken(data.token);
    localStorage.setItem('campus_user', JSON.stringify(data.user));
  }
  return data;
}

// Delete account & all associated student listings/messages
export async function apiDeleteAccount() {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Account deletion failed');
  apiLogout();
  return data;
}

// Report inappropriate listing or prohibited content
export async function apiReportProduct(productId, { reason, details }) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/products/${productId}/report`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason, details }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit report');
  return data;
}

// Log out user
export function apiLogout() {
  try {
    const storedUser = getStoredUser();
    const currentUserId = String(storedUser?._id || storedUser?.id || '');
    if (currentUserId) {
      localStorage.removeItem(`campus_user_ads_${currentUserId}`);
    }
  } catch {}
  localStorage.removeItem('campus_products_cache');
  localStorage.removeItem('campus_user_ads');
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('campus_products_cache')) {
        localStorage.removeItem(key);
      }
    });
  } catch {}
  localStorage.removeItem('campus_jwt_token');
  localStorage.removeItem('campus_user');
  localStorage.removeItem('user_custom_avatar');
  localStorage.removeItem('user_custom_fullname');
  localStorage.removeItem('user_dob');
  localStorage.removeItem('user_course');
  localStorage.removeItem('user_year');
  localStorage.removeItem('user_id_verified');
  localStorage.removeItem('user_student_id_url');
  localStorage.removeItem('pending_email');
  localStorage.removeItem('pending_uni');
}

// ─── Public Endpoints ──────────────────────────────────────────────────────

// In-flight request deduplication map to prevent simultaneous duplicate network requests
const inFlightRequests = new Map();

/**
 * Cloudinary responsive image delivery helper
 * Injects automatic WebP formatting, quality tuning, and max width resizing
 */
export function getOptimizedImageUrl(url, width = 400) {
  if (!url || typeof url !== 'string') return url || '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('/c_') || url.includes('/w_')) return url;
    return url.replace('/upload/', `/upload/c_limit,w_${width},q_auto,f_auto/`);
  }
  return url;
}

// Fetch aggregated marketplace home screen data (listings, categories, campus metadata)
export async function fetchMarketplaceHome(university) {
  try {
    const url = university
      ? `${API_BASE_URL}/marketplace/home?university=${encodeURIComponent(university)}`
      : `${API_BASE_URL}/marketplace/home`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch marketplace home');
    return await res.json();
  } catch (err) {
    console.warn('Marketplace home unavailable, falling back to fetchProducts:', err);
    const products = await fetchProducts(university);
    return { success: true, products };
  }
}

// Fetch all active campus product listings strictly within the target university
export async function fetchProducts(university) {
  const cacheKey = (university || 'all').toLowerCase().trim();
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const promise = (async () => {
    try {
      const url = university 
        ? `${API_BASE_URL}/products?university=${encodeURIComponent(university)}` 
        : `${API_BASE_URL}/products`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      if (Array.isArray(data)) {
        const uniClean = (university || '').toLowerCase().trim();
        // Strictly verify that every returned product belongs to the requested university
        const filteredData = uniClean
          ? data.filter(p => {
              if (!p) return false;
              const pCampus = (p.campusName || '').toLowerCase().trim();
              const pUni = (p.universityName || '').toLowerCase().trim();
              const sUni = (p.seller?.universityName || '').toLowerCase().trim();
              return (
                (pCampus && (pCampus.includes(uniClean) || uniClean.includes(pCampus))) ||
                (pUni && (pUni.includes(uniClean) || uniClean.includes(pUni))) ||
                (sUni && (sUni.includes(uniClean) || uniClean.includes(sUni)))
              );
            })
          : data;

        // Cache exclusively the university's own listings
        try {
          localStorage.setItem(`campus_products_cache_${cacheKey}`, JSON.stringify(filteredData));
          localStorage.setItem('campus_products_cache', JSON.stringify(filteredData));
        } catch {}

        return filteredData;
      }
      return [];
    } catch (err) {
      console.warn('Backend fetchProducts unavailable, using local cache:', err);
      try {
        const uniClean = (university || '').toLowerCase().trim();
        const cached = JSON.parse(localStorage.getItem(`campus_products_cache_${cacheKey}`) || localStorage.getItem('campus_products_cache') || '[]');
        if (uniClean && Array.isArray(cached)) {
          return cached.filter(p => {
            if (!p) return false;
            const pCampus = (p.campusName || '').toLowerCase().trim();
            const pUni = (p.universityName || '').toLowerCase().trim();
            const sUni = (p.seller?.universityName || '').toLowerCase().trim();
            return (
              (pCampus && (pCampus.includes(uniClean) || uniClean.includes(pCampus))) ||
              (pUni && (pUni.includes(uniClean) || uniClean.includes(pUni))) ||
              (sUni && (sUni.includes(uniClean) || uniClean.includes(sUni)))
            );
          });
        }
        return Array.isArray(cached) ? cached : [];
      } catch {
        return [];
      }
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
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
  const storedUser = getStoredUser();
  const cleanPhone = (productData.phone || productData.contactNumber || (typeof window !== 'undefined' ? localStorage.getItem('user_phone') : '') || storedUser?.phone || '').toString().replace(/\D/g, '').slice(-10);
  let createdProduct = null;

  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...productData,
        phone: cleanPhone,
        contactNumber: cleanPhone
      }),
    });

    if (res.ok) {
      createdProduct = await res.json();
    } else {
      const errPayload = await res.json().catch(() => ({}));
      console.warn(`Backend rejected product creation (Status ${res.status}):`, errPayload.error || errPayload);
    }
  } catch (err) {
    console.warn('Backend product creation offline, storing locally:', err);
  }

  // If backend was unreachable or returned product, ensure it's safely stored locally
  if (!createdProduct) {
    const customAvatar = typeof window !== 'undefined' ? localStorage.getItem('user_custom_avatar') : null;
    const customName = typeof window !== 'undefined' ? localStorage.getItem('user_custom_fullname') : null;
    createdProduct = {
      _id: 'prod_' + Date.now(),
      ...productData,
      phone: cleanPhone,
      contactNumber: cleanPhone,
      status: 'active',
      createdAt: new Date().toISOString(),
      seller: {
        _id: storedUser?.id || storedUser?._id || 'user_me',
        email: storedUser?.email || '',
        fullName: customName || storedUser?.fullName || storedUser?.name || 'Student Seller',
        avatar: customAvatar || storedUser?.avatar || '/avatar-blue-2.svg',
        universityName: productData.universityName || storedUser?.universityName || 'Campus Member',
        isVerified: Boolean(storedUser?.isVerified),
        phone: cleanPhone
      }
    };
  } else {
    if (!createdProduct.phone) createdProduct.phone = cleanPhone;
    if (!createdProduct.contactNumber) createdProduct.contactNumber = cleanPhone;
    if (createdProduct.seller && typeof createdProduct.seller === 'object' && !createdProduct.seller.phone) {
      createdProduct.seller.phone = cleanPhone;
    }
  }

  // Sync to user-scoped ads and products cache
  try {
    const userAdsKey = getUserAdsStorageKey(storedUser);
    if (userAdsKey) {
      const userAds = JSON.parse(localStorage.getItem(userAdsKey) || '[]');
      const updatedUserAds = [createdProduct, ...userAds.filter(a => (a._id || a.id) !== (createdProduct._id || createdProduct.id))];
      localStorage.setItem(userAdsKey, JSON.stringify(updatedUserAds));
    }

    const allProducts = JSON.parse(localStorage.getItem('campus_products_cache') || '[]');
    const updatedAll = [createdProduct, ...allProducts.filter(a => (a._id || a.id) !== (createdProduct._id || createdProduct.id))];
    localStorage.setItem('campus_products_cache', JSON.stringify(updatedAll));
  } catch (e) {
    console.warn('Failed to sync product to localStorage:', e);
  }

  return createdProduct;
}

// Helper to get user-specific ads storage key
export function getUserAdsStorageKey(user = getStoredUser()) {
  const uid = user?._id || user?.id;
  return uid ? `campus_user_ads_${uid}` : null;
}

// Helper to get user-specific favorites storage key
export function getUserFavoritesStorageKey(user = getStoredUser()) {
  const uid = user?._id || user?.id;
  return uid ? `campus_favorites_${uid}` : null;
}

// Read favorites strictly for the active user
export function getStoredFavorites(user = getStoredUser()) {
  try {
    const key = getUserFavoritesStorageKey(user);
    if (!key) return [];
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    // Filter out invalid or corrupted IDs
    return parsed.filter(id => {
      if (!id) return false;
      const str = String(id).trim();
      return str !== '' && str !== 'null' && str !== 'undefined' && str !== 'card-1' && str !== 'card-2' && str !== '1';
    });
  } catch {
    return [];
  }
}

// Persist favorites strictly for the active user
export function saveStoredFavorites(favorites, user = getStoredUser()) {
  try {
    const key = getUserFavoritesStorageKey(user);
    if (key) {
      localStorage.setItem(key, JSON.stringify(Array.isArray(favorites) ? favorites : []));
    }
  } catch {}
}

// Strict check: verify an ad actually belongs to the specified user
export function isAdOwnedByUser(ad, user = getStoredUser()) {
  if (!ad || !user) return false;
  const currentUserId = String(user._id || user.id || '');
  const currentUserEmail = (user.email || '').toLowerCase().trim();
  const seller = ad.seller;
  if (!seller) return false;
  const sellerId = typeof seller === 'object' ? String(seller._id || seller.id || '') : String(seller);
  if (currentUserId && sellerId && sellerId === currentUserId) return true;
  const sellerEmail = (typeof seller === 'object' ? (seller.email || '') : '').toLowerCase().trim();
  if (currentUserEmail && sellerEmail && sellerEmail === currentUserEmail) return true;
  return false;
}

// Universal helper to resolve all ads for a student from memory, local cache, and backend
export function resolveAllUserAds(user = getStoredUser(), incomingList = null) {
  try {
    if (!user || (!user._id && !user.id && !user.email)) {
      return [];
    }

    const userAdsKey = getUserAdsStorageKey(user);

    // If incomingList is passed (e.g. from backend /products/my-ads), it is authoritative
    if (Array.isArray(incomingList)) {
      const owned = incomingList.filter(ad => isAdOwnedByUser(ad, user));
      if (userAdsKey) {
        try {
          localStorage.setItem(userAdsKey, JSON.stringify(owned));
        } catch {}
      }
      return owned;
    }

    // Otherwise, load from user-specific cache
    if (userAdsKey) {
      try {
        const local = JSON.parse(localStorage.getItem(userAdsKey) || '[]');
        if (Array.isArray(local)) {
          return local.filter(ad => isAdOwnedByUser(ad, user));
        }
      } catch {}
    }

    return [];
  } catch {
    return [];
  }
}

// Fetch all listings for the logged-in user
export async function fetchMyAds() {
  const token = getAuthToken();
  const user = getStoredUser();
  if (!token || !user) {
    return [];
  }

  const userAdsKey = getUserAdsStorageKey(user);

  try {
    const res = await fetch(`${API_BASE_URL}/products/my-ads`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      return resolveAllUserAds(user, Array.isArray(data) ? data : []);
    }
  } catch (err) {
    console.warn('Backend my-ads unavailable, using local cache:', err);
  }

  return resolveAllUserAds(user, null);
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
    const storedUser = getStoredUser();
    const userAdsKey = getUserAdsStorageKey(storedUser);
    if (userAdsKey) {
      const userAds = JSON.parse(localStorage.getItem(userAdsKey) || '[]');
      const updated = userAds.map(ad => (ad._id === id || ad.id === id) ? { ...ad, status } : ad);
      localStorage.setItem(userAdsKey, JSON.stringify(updated));
    }

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
    const storedUser = getStoredUser();
    const userAdsKey = getUserAdsStorageKey(storedUser);
    if (userAdsKey) {
      const userAds = JSON.parse(localStorage.getItem(userAdsKey) || '[]');
      localStorage.setItem(userAdsKey, JSON.stringify(userAds.filter(ad => (ad._id || ad.id) !== productId)));
    }

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

const inFlightConversations = new Map();

// Start or get an existing conversation for a product
export async function startConversation({ sellerId, productId, initialMessage }) {
  const reqKey = `${sellerId}_${productId || 'none'}`;
  if (inFlightConversations.has(reqKey)) {
    return inFlightConversations.get(reqKey);
  }

  const promise = (async () => {
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
  })();

  inFlightConversations.set(reqKey, promise);
  try {
    return await promise;
  } finally {
    setTimeout(() => inFlightConversations.delete(reqKey), 1500);
  }
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
        const data = await res.json();
        if (Array.isArray(data)) {
          try {
            localStorage.setItem(`campus_messages_cache_${conversationId}`, JSON.stringify(data));
          } catch {}
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend fetch messages offline:', err);
  }

  try {
    const cached = JSON.parse(localStorage.getItem(`campus_messages_cache_${conversationId}`) || '[]');
    if (Array.isArray(cached) && cached.length > 0) return cached;
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

// ─── Ad Engagement & Analytics Tracking (Views, Likes, Chats) ────────────────

export function initAnalyticsCleanup() {
  try {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('campus_analytics_cleaned_v2')) {
      // Clean legacy inflated self-clicks from previous testing
      localStorage.removeItem('campus_ad_views');
      localStorage.removeItem('campus_ad_views_v2');

      // Reseed campus_ad_likes strictly based on actual current favorites
      const favs = getStoredFavorites();
      const likesMap = {};
      if (Array.isArray(favs)) {
        favs.forEach(id => {
          if (id) likesMap[String(id)] = 1;
        });
      }
      localStorage.setItem('campus_ad_likes', JSON.stringify(likesMap));
      localStorage.setItem('campus_analytics_cleaned_v2', 'true');
    }

    // Purge legacy fake dummy reviews from seller ratings
    if (!localStorage.getItem('campus_seller_ratings_cleaned_v2')) {
      const storedMap = JSON.parse(localStorage.getItem('campus_seller_ratings') || '{}');
      let changed = false;
      Object.keys(storedMap).forEach(key => {
        const item = storedMap[key];
        if (item && Array.isArray(item.reviews)) {
          const realOnly = item.reviews.filter(r => 
            !['rev_1', 'rev_2', 'rev_3'].includes(r.id) &&
            r.name !== 'Sarah Jenkins' &&
            r.name !== 'Rahul K.' &&
            r.name !== 'Maya Lin'
          );
          if (realOnly.length !== item.reviews.length) {
            changed = true;
            if (realOnly.length > 0) {
              const total = realOnly.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
              storedMap[key] = {
                average: Number((total / realOnly.length).toFixed(1)),
                count: realOnly.length,
                reviews: realOnly
              };
            } else {
              delete storedMap[key];
            }
          }
        }
      });
      if (changed) {
        localStorage.setItem('campus_seller_ratings', JSON.stringify(storedMap));
      }
      localStorage.setItem('campus_seller_ratings_cleaned_v2', 'true');
    }
  } catch {}
}

// Auto-run cleanup on module evaluation
if (typeof window !== 'undefined') {
  initAnalyticsCleanup();
}

export function getAdViews(adId, baseViews = 0) {
  if (!adId) return baseViews;
  const key = String(adId);
  try {
    const mapV2 = JSON.parse(localStorage.getItem('campus_ad_views_v2') || '{}');
    if (mapV2[key] && typeof mapV2[key].count === 'number') {
      return Math.max(mapV2[key].count, baseViews);
    }
    return baseViews;
  } catch {
    return baseViews;
  }
}

export function incrementAdViews(adId, viewerId = null, sellerId = null) {
  if (!adId) return 0;
  const key = String(adId);

  const currentUserId = viewerId || getStoredUser()?.id || getStoredUser()?._id;
  const vId = currentUserId ? String(currentUserId) : 'guest';
  const sId = sellerId ? String(sellerId) : null;

  // View count only rises when DIFFERENT users click the product.
  // The seller / owner clicking their own ad NEVER increments views.
  if (sId && vId && sId === vId) {
    return getAdViews(key);
  }

  try {
    const map = JSON.parse(localStorage.getItem('campus_ad_views_v2') || '{}');
    const entry = map[key] || { count: 0, viewers: [] };
    if (!Array.isArray(entry.viewers)) {
      entry.viewers = [];
    }

    // Only count each distinct viewer/user once per ad
    if (!entry.viewers.includes(vId)) {
      entry.viewers.push(vId);
      entry.count = (entry.count || 0) + 1;
    }

    map[key] = entry;
    localStorage.setItem('campus_ad_views_v2', JSON.stringify(map));
    return entry.count;
  } catch {
    return 1;
  }
}

export function updateAdLikes(adId, isLiked) {
  if (!adId) return;
  const key = String(adId);
  try {
    const map = JSON.parse(localStorage.getItem('campus_ad_likes') || '{}');
    if (isLiked) {
      map[key] = 1;
    } else {
      map[key] = 0;
    }
    localStorage.setItem('campus_ad_likes', JSON.stringify(map));
  } catch {}

  // Sync like event to backend to trigger real-time seller notification
  const token = getAuthToken();
  if (token && /^[0-9a-fA-F]{24}$/.test(key)) {
    fetch(`${API_BASE_URL}/products/${key}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isLiked: Boolean(isLiked) })
    }).catch(() => {});
  }
}

export function getAdLikes(adId, isFav = false, baseLikes = 0) {
  if (!adId) return baseLikes;
  const key = String(adId);
  try {
    const map = JSON.parse(localStorage.getItem('campus_ad_likes') || '{}');

    // If item is not in user's favorites/wishlist, reset local like to 0
    if (!isFav) {
      if (map[key] && map[key] > 0) {
        map[key] = 0;
        localStorage.setItem('campus_ad_likes', JSON.stringify(map));
      }
      return baseLikes;
    }

    // If item is in user's favorites/wishlist, user like is 1
    map[key] = Math.max(1, baseLikes);
    localStorage.setItem('campus_ad_likes', JSON.stringify(map));
    return Math.max(1, baseLikes);
  } catch {
    return isFav ? Math.max(1, baseLikes) : baseLikes;
  }
}

export function getAdChatsCount(adId, baseChats = 0, currentUserId = null) {
  if (!adId) return baseChats;
  const key = String(adId);
  const myId = String(currentUserId || getStoredUser()?.id || getStoredUser()?._id || '');
  try {
    const convs = JSON.parse(localStorage.getItem('campus_conversations_cache') || '[]');
    const matches = convs.filter(c => {
      const pid = String(c.productId || c.product?._id || c.product?.id || c.product || '');
      if (pid !== key) return false;

      // Must have actual messages or conversation interaction
      const hasRealMessages = Array.isArray(c.messages) && c.messages.length > 0;
      const hasRealLastMsg = c.lastMessage && c.lastMessage !== 'Conversation started' && c.lastMessage.trim() !== '';
      if (!hasRealMessages && !hasRealLastMsg) return false;

      // Filter out self-chats where the seller is the sole participant
      if (myId && Array.isArray(c.participants) && c.participants.length > 0) {
        const otherParticipants = c.participants.filter(p => {
          const pId = String(p?._id || p?.id || p || '');
          return pId && pId !== myId && pId !== 'me';
        });
        if (otherParticipants.length === 0) return false;
      }

      return true;
    });
    return Math.max(matches.length, baseChats);
  } catch {
    return baseChats;
  }
}

export function getAdStats(ad, favorites = [], currentUserId = null) {
  if (!ad) return { views: 0, likes: 0, chats: 0 };
  const adId = String(ad._id || ad.id || '');
  const isFav = (favorites || []).some(f => String(f) === adId);
  const userId = currentUserId || getStoredUser()?.id || getStoredUser()?._id;

  const views = getAdViews(adId, ad.views || 0);
  const likes = getAdLikes(adId, isFav, ad.likes || ad.saves || 0);
  const chats = getAdChatsCount(adId, ad.activeChats || ad.chats || 0, userId);

  return { views, likes, chats };
}

// ─── Student Profile & Seller Information API ──────────────────────────────

/**
 * Fetch public student information (phone number, course, year, dob) directly from student section API
 */
export async function fetchStudentProfile(studentId) {
  if (!studentId) return null;
  const key = String(studentId);

  // If requesting current user's profile, return stored user
  const storedUser = getStoredUser();
  const myId = String(storedUser?._id || storedUser?.id || '');
  if (myId && (key === myId || key === 'me')) {
    return {
      _id: myId,
      id: myId,
      fullName: (typeof window !== 'undefined' ? localStorage.getItem('user_custom_fullname') : null) || storedUser?.fullName || storedUser?.name,
      phone: (typeof window !== 'undefined' ? localStorage.getItem('user_phone') : null) || storedUser?.phone || '',
      universityName: storedUser?.universityName || 'Campus Member',
      avatar: (typeof window !== 'undefined' ? localStorage.getItem('user_custom_avatar') : null) || storedUser?.avatar,
      isVerified: Boolean(storedUser?.isVerified),
      course: (typeof window !== 'undefined' ? localStorage.getItem('user_course') : null) || storedUser?.course || '',
      year: (typeof window !== 'undefined' ? localStorage.getItem('user_year') : null) || storedUser?.year || '',
      dob: (typeof window !== 'undefined' ? localStorage.getItem('user_dob') : null) || storedUser?.dob || ''
    };
  }

  const cacheKey = `student_profile_${key}`;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/student/${key}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {}
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend student profile fetch offline:', err);
  }

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  return null;
}

// ─── Student Seller Ratings & Reviews System ──────────────────────────────

export const RATING_DESCRIPTION_MAP = {
  5: 'Outstanding Experience (5/5)',
  4: 'Very Good & Reliable (4/5)',
  3: 'Good & As Described (3/5)',
  2: 'Fair / Minor Issues (2/5)',
  1: 'Needs Improvement (1/5)'
};

export function getRatingLabel(rating) {
  return RATING_DESCRIPTION_MAP[Math.round(Number(rating))] || `${rating}/5 Stars`;
}

export function hasUserRatedSeller(sellerId, userId, sellerRatingsData = null) {
  if (!sellerId) return false;
  const key = String(sellerId);
  const storedUser = getStoredUser();
  const uId = String(userId || storedUser?._id || storedUser?.id || '').trim();
  const uEmail = String(storedUser?.email || '').trim().toLowerCase();
  const uName = String(storedUser?.fullName || storedUser?.name || (typeof window !== 'undefined' ? localStorage.getItem('user_custom_fullname') : '') || '').trim().toLowerCase();

  try {
    // 1. Check in seller reviews data (from API or local cache)
    const data = sellerRatingsData || getSellerRatings(sellerId);
    if (data && Array.isArray(data.reviews)) {
      const match = data.reviews.some(r => {
        const rRevId = String(r.reviewerId || (r.reviewer ? (r.reviewer._id || r.reviewer) : '') || '').trim();
        const rEmail = String(r.reviewerEmail || (r.reviewer && r.reviewer.email) || '').trim().toLowerCase();
        const rName = String(r.name || r.reviewerName || '').trim().toLowerCase();

        if (uId && rRevId && rRevId === uId) return true;
        if (uEmail && rEmail && rEmail === uEmail) return true;
        if (uName && rName && (rName === uName || uName.includes(rName) || rName.includes(uName))) return true;
        return false;
      });
      if (match) return true;
    }

    // 2. Check persistent map of rated sellers in localStorage
    const ratedMap = JSON.parse(localStorage.getItem('campus_rated_sellers') || '{}');
    if (uId && ratedMap[`${uId}_${key}`]) return true;
    if (uEmail && ratedMap[`${uEmail}_${key}`]) return true;
    if (ratedMap[`guest_${key}`]) return true;
  } catch {}

  return false;
}

export function getUserReviewForSeller(sellerId, userId, sellerRatingsData = null) {
  if (!sellerId) return null;
  const key = String(sellerId);
  const storedUser = getStoredUser();
  const uId = String(userId || storedUser?._id || storedUser?.id || '').trim();
  const uEmail = String(storedUser?.email || '').trim().toLowerCase();
  const uName = String(storedUser?.fullName || storedUser?.name || (typeof window !== 'undefined' ? localStorage.getItem('user_custom_fullname') : '') || '').trim().toLowerCase();

  try {
    const data = sellerRatingsData || getSellerRatings(sellerId);
    if (data && Array.isArray(data.reviews)) {
      const match = data.reviews.find(r => {
        const rRevId = String(r.reviewerId || (r.reviewer ? (r.reviewer._id || r.reviewer) : '') || '').trim();
        const rEmail = String(r.reviewerEmail || (r.reviewer && r.reviewer.email) || '').trim().toLowerCase();
        const rName = String(r.name || r.reviewerName || '').trim().toLowerCase();

        if (uId && rRevId && rRevId === uId) return true;
        if (uEmail && rEmail && rEmail === uEmail) return true;
        if (uName && rName && (rName === uName || uName.includes(rName) || rName.includes(uName))) return true;
        return false;
      });
      if (match) {
        return {
          ...match,
          rating: Number(match.rating) || 5,
          ratingDescription: match.ratingDescription || getRatingLabel(match.rating),
          comment: match.comment || '',
          date: match.date || 'Your Previous Rating'
        };
      }
    }

    const ratedMap = JSON.parse(localStorage.getItem('campus_rated_sellers') || '{}');
    const local = (uId && ratedMap[`${uId}_${key}`]) ||
                  (uEmail && ratedMap[`${uEmail}_${key}`]) ||
                  ratedMap[`guest_${key}`];
    if (local) {
      return {
        ...local,
        rating: Number(local.rating) || 5,
        ratingDescription: local.ratingDescription || getRatingLabel(local.rating),
        comment: local.comment || '',
        date: local.date ? 'Your Previous Rating' : 'Recently'
      };
    }
  } catch {}

  return null;
}

export function getSellerRatings(sellerId) {
  if (!sellerId) {
    return { average: 0, count: 0, reviews: [] };
  }

  const key = String(sellerId);
  try {
    const map = JSON.parse(localStorage.getItem('campus_seller_ratings') || '{}');
    if (map[key] && Array.isArray(map[key].reviews)) {
      // 1. Filter out legacy dummy reviews
      const realOnly = map[key].reviews.filter(r => 
        !['rev_1', 'rev_2', 'rev_3'].includes(r.id) &&
        r.name !== 'Sarah Jenkins' &&
        r.name !== 'Rahul K.' &&
        r.name !== 'Maya Lin'
      ).map(r => ({
        ...r,
        reviewerId: r.reviewerId || (r.reviewer ? String(r.reviewer) : null),
        ratingDescription: r.ratingDescription || getRatingLabel(r.rating)
      }));

      // 2. Deduplicate reviews so each reviewer has at most 1 review
      const seenReviewers = new Set();
      const dedupedReviews = [];
      for (const r of realOnly) {
        const revKey = String(r.reviewerId || r.reviewer || r.reviewerEmail || r.name || '').trim().toLowerCase();
        if (revKey && revKey !== 'verified student' && revKey !== 'student') {
          if (seenReviewers.has(revKey)) continue; // Skip duplicate!
          seenReviewers.add(revKey);
        }
        dedupedReviews.push(r);
      }

      if (dedupedReviews.length > 0) {
        const totalStars = dedupedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
        const avg = Number((totalStars / dedupedReviews.length).toFixed(1));
        return { average: avg, count: dedupedReviews.length, reviews: dedupedReviews };
      }
    }
  } catch {}

  return { average: 0, count: 0, reviews: [] };
}

export async function fetchSellerRatingsFromApi(sellerId) {
  if (!sellerId) return { average: 0, count: 0, reviews: [] };
  const key = String(sellerId);

  if (/^[0-9a-fA-F]{24}$/.test(key)) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/seller/${key}/ratings`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.reviews)) {
          // Normalize and deduplicate reviews
          const seenReviewers = new Set();
          const cleanReviews = [];

          for (const r of data.reviews) {
            const revKey = String(r.reviewerId || (r.reviewer ? (r.reviewer._id || r.reviewer) : '') || r.reviewerEmail || r.name || '').trim().toLowerCase();
            if (revKey && revKey !== 'verified student' && revKey !== 'student') {
              if (seenReviewers.has(revKey)) continue;
              seenReviewers.add(revKey);
            }
            cleanReviews.push({
              id: String(r.id || r._id || ('rev_' + Math.random())),
              reviewerId: r.reviewerId || (r.reviewer ? String(r.reviewer._id || r.reviewer) : null),
              reviewerEmail: r.reviewerEmail || (r.reviewer && r.reviewer.email ? String(r.reviewer.email) : null),
              name: r.name || r.reviewerName || 'Verified Student',
              rating: Number(r.rating) || 5,
              ratingDescription: r.ratingDescription || getRatingLabel(r.rating),
              comment: r.comment || '',
              date: r.date || 'Recently'
            });
          }

          const totalStars = cleanReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
          const avg = cleanReviews.length > 0 ? Number((totalStars / cleanReviews.length).toFixed(1)) : 0;
          const cleanData = {
            average: avg,
            count: cleanReviews.length,
            reviews: cleanReviews
          };

          try {
            const map = JSON.parse(localStorage.getItem('campus_seller_ratings') || '{}');
            map[key] = cleanData;
            localStorage.setItem('campus_seller_ratings', JSON.stringify(map));

            // Sync user's review into local campus_rated_sellers map
            const storedUser = getStoredUser();
            const uId = String(storedUser?._id || storedUser?.id || '').trim();
            const uEmail = String(storedUser?.email || '').trim().toLowerCase();
            const uName = String(storedUser?.fullName || storedUser?.name || '').trim().toLowerCase();

            const myRev = cleanReviews.find(r => {
              if (uId && r.reviewerId && r.reviewerId === uId) return true;
              if (uEmail && r.reviewerEmail && r.reviewerEmail === uEmail) return true;
              if (uName && r.name && r.name.toLowerCase() === uName) return true;
              return false;
            });

            if (myRev) {
              const ratedMap = JSON.parse(localStorage.getItem('campus_rated_sellers') || '{}');
              const trackingKey = (uId || uEmail || 'guest') + '_' + key;
              ratedMap[trackingKey] = {
                rating: myRev.rating,
                ratingDescription: myRev.ratingDescription,
                comment: myRev.comment,
                date: myRev.date
              };
              localStorage.setItem('campus_rated_sellers', JSON.stringify(ratedMap));
            }
          } catch {}

          return cleanData;
        }
      }
    } catch (err) {
      console.warn('Backend fetch ratings offline, using local store:', err);
    }
  }

  return getSellerRatings(sellerId);
}

export async function submitSellerRating(sellerId, { rating, comment, reviewerName, ratingDescription, reviewerId, reviewerEmail }) {
  if (!sellerId || !rating) return null;
  const key = String(sellerId);
  const storedUser = getStoredUser();
  const currentReviewerId = String(reviewerId || storedUser?._id || storedUser?.id || '').trim();
  const currentReviewerEmail = String(reviewerEmail || storedUser?.email || '').trim().toLowerCase();

  const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const desc = ratingDescription || getRatingLabel(numericRating);
  const reviewComment = (comment && comment.trim()) || desc;

  try {
    const map = JSON.parse(localStorage.getItem('campus_seller_ratings') || '{}');
    const existing = getSellerRatings(sellerId);

    const newRev = {
      id: 'rev_' + Date.now(),
      reviewerId: currentReviewerId || null,
      reviewerEmail: currentReviewerEmail || null,
      name: (reviewerName || storedUser?.fullName || 'Verified Student').trim(),
      rating: numericRating,
      ratingDescription: desc,
      comment: reviewComment,
      date: 'Just now'
    };

    // Filter out any prior review from the same reviewer so duplicates are NEVER created!
    const filteredReviews = (existing.reviews || []).filter(r => {
      const rRevId = String(r.reviewerId || (r.reviewer ? (r.reviewer._id || r.reviewer) : '') || '').trim();
      const rEmail = String(r.reviewerEmail || '').trim().toLowerCase();
      const rName = String(r.name || r.reviewerName || '').trim().toLowerCase();

      if (currentReviewerId && rRevId && rRevId === currentReviewerId) return false;
      if (currentReviewerEmail && rEmail && rEmail === currentReviewerEmail) return false;
      if (newRev.name && rName && rName === newRev.name.toLowerCase()) return false;
      return true;
    });

    const updatedReviews = [newRev, ...filteredReviews];
    const totalStars = updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const avg = Number((totalStars / updatedReviews.length).toFixed(1));

    const updatedData = {
      average: avg,
      count: updatedReviews.length,
      reviews: updatedReviews
    };

    map[key] = updatedData;
    localStorage.setItem('campus_seller_ratings', JSON.stringify(map));

    // Record that this buyer has rated this seller
    try {
      const ratedMap = JSON.parse(localStorage.getItem('campus_rated_sellers') || '{}');
      const trackingKey = (currentReviewerId || currentReviewerEmail || 'guest') + '_' + key;
      ratedMap[trackingKey] = {
        rating: numericRating,
        ratingDescription: desc,
        comment: reviewComment,
        date: new Date().toISOString()
      };
      localStorage.setItem('campus_rated_sellers', JSON.stringify(ratedMap));
    } catch {}

    // Persist to backend MongoDB if sellerId is a valid ObjectId and token exists
    const token = getAuthToken();
    if (token && /^[0-9a-fA-F]{24}$/.test(key)) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/seller/${key}/rating`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rating: numericRating,
            ratingDescription: desc,
            comment: reviewComment,
            reviewerName: newRev.name
          })
        });

        if (res.ok) {
          const serverData = await res.json();
          if (serverData && Array.isArray(serverData.reviews)) {
            map[key] = {
              average: serverData.average || avg,
              count: serverData.count || updatedReviews.length,
              reviews: serverData.reviews
            };
            localStorage.setItem('campus_seller_ratings', JSON.stringify(map));
          }
        }
      } catch (err) {
        console.warn('Backend rating sync error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('seller-rating-updated', { detail: { sellerId: key, data: updatedData } }));
    }

    return updatedData;
  } catch {
    return null;
  }
}

// ─── Real-Time Notifications API (MongoDB + Socket.io) ───────────────────

/**
 * Fetch list of notifications for authenticated student
 */
export async function fetchNotifications({ page = 1, limit = 50, unread = false } = {}) {
  const token = getAuthToken();
  if (!token) return { notifications: [], total: 0, unreadCount: 0 };

  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(unread ? { unread: 'true' } : {})
    });

    const res = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) return { notifications: [], total: 0, unreadCount: 0 };
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch notifications:', err);
    return { notifications: [], total: 0, unreadCount: 0 };
  }
}

/**
 * Get quick unread count for bell icon badge
 */
export async function fetchUnreadNotificationsCount() {
  const token = getAuthToken();
  if (!token) return 0;

  try {
    const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data.unreadCount) || 0;
  } catch {
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id) {
  const token = getAuthToken();
  if (!token || !id) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/**
 * Delete a specific notification
 */
export async function deleteNotificationApi(id) {
  const token = getAuthToken();
  if (!token || !id) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/**
 * Clear all notifications for current student
 */
export async function clearAllNotificationsApi() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/**
 * Signal intent to buy to the seller with real-time notification
 */
export async function sendBuyIntentApi(productId, message = '') {
  const token = getAuthToken();
  if (!token || !productId) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/buy-intent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.warn('Failed to send buy intent:', err);
    return null;
  }
}



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
        }
        return data;
      }
    } catch (err) {
      console.warn('Backend update profile offline, caching locally:', err);
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
  return { user: mergedUser };
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

// Fetch all active campus product listings with in-flight deduplication
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
    } else {
      const errPayload = await res.json().catch(() => ({}));
      console.warn(`Backend rejected product creation (Status ${res.status}):`, errPayload.error || errPayload);
    }
  } catch (err) {
    console.warn('Backend product creation offline, storing locally:', err);
  }

  // If backend was unreachable or returned product, ensure it's safely stored locally
  if (!createdProduct) {
    const storedUser = getStoredUser();
    const customAvatar = typeof window !== 'undefined' ? localStorage.getItem('user_custom_avatar') : null;
    const customName = typeof window !== 'undefined' ? localStorage.getItem('user_custom_fullname') : null;
    createdProduct = {
      _id: 'prod_' + Date.now(),
      ...productData,
      status: 'active',
      createdAt: new Date().toISOString(),
      seller: {
        _id: storedUser?.id || storedUser?._id || 'user_me',
        email: storedUser?.email || '',
        fullName: customName || storedUser?.fullName || storedUser?.name || 'Student Seller',
        avatar: customAvatar || storedUser?.avatar || '/avatar-blue-2.svg',
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
          // Merge backend ads with any locally saved ads to prevent accidental data loss
          const localAds = JSON.parse(localStorage.getItem('campus_user_ads') || '[]');
          const merged = new Map();
          localAds.forEach(a => a && (a._id || a.id) && merged.set(String(a._id || a.id), a));
          data.forEach(a => a && (a._id || a.id) && merged.set(String(a._id || a.id), a));
          const result = Array.from(merged.values());
          localStorage.setItem('campus_user_ads', JSON.stringify(result));
          return result;
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

// ─── Ad Engagement & Analytics Tracking (Views, Likes, Chats) ────────────────

export function initAnalyticsCleanup() {
  try {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('campus_analytics_cleaned_v2')) {
      // Clean legacy inflated self-clicks from previous testing
      localStorage.removeItem('campus_ad_views');
      localStorage.removeItem('campus_ad_views_v2');

      // Reseed campus_ad_likes strictly based on actual current favorites
      const favs = JSON.parse(localStorage.getItem('campus_favorites') || '[]');
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

// ─── Student Seller Ratings & Reviews System ──────────────────────────────

export function getSellerRatings(sellerId) {
  if (!sellerId) {
    return { average: 0, count: 0, reviews: [] };
  }

  const key = String(sellerId);
  try {
    const map = JSON.parse(localStorage.getItem('campus_seller_ratings') || '{}');
    if (map[key] && Array.isArray(map[key].reviews)) {
      // Filter out any legacy dummy reviews (Sarah Jenkins, Rahul K., Maya Lin)
      const realOnly = map[key].reviews.filter(r => 
        !['rev_1', 'rev_2', 'rev_3'].includes(r.id) &&
        r.name !== 'Sarah Jenkins' &&
        r.name !== 'Rahul K.' &&
        r.name !== 'Maya Lin'
      );
      if (realOnly.length > 0) {
        const totalStars = realOnly.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
        const avg = Number((totalStars / realOnly.length).toFixed(1));
        return { average: avg, count: realOnly.length, reviews: realOnly };
      }
    }
  } catch {}

  return { average: 0, count: 0, reviews: [] };
}

export function submitSellerRating(sellerId, { rating, comment, reviewerName }) {
  if (!sellerId || !rating) return null;
  const key = String(sellerId);

  try {
    const map = JSON.parse(localStorage.getItem('campus_seller_ratings') || '{}');
    const existing = getSellerRatings(sellerId);

    const newRev = {
      id: 'rev_' + Date.now(),
      name: (reviewerName || 'Verified Student').trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      comment: (comment || 'Recommended student seller! Genuine item and great communication.').trim(),
      date: 'Just now'
    };

    const updatedReviews = [newRev, ...(existing.reviews || [])];
    const totalStars = updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const avg = Number((totalStars / updatedReviews.length).toFixed(1));

    const updatedData = {
      average: avg,
      count: updatedReviews.length,
      reviews: updatedReviews
    };

    map[key] = updatedData;
    localStorage.setItem('campus_seller_ratings', JSON.stringify(map));
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



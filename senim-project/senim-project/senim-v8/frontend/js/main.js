/* ===========================
   SENIM FURNITURE - MAIN JS
   Version 2.0 — with Auth
   =========================== */

const API_BASE = 'http://localhost:8081/api';

// ===========================
// AUTH MANAGEMENT
// ===========================
const Auth = {
  TOKEN_KEY: 'senim_token',
  USER_KEY:  'senim_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'ADMIN';
  },

  save(authResponse) {
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      id:        authResponse.userId,
      email:     authResponse.email,
      firstName: authResponse.firstName,
      lastName:  authResponse.lastName,
      role:      authResponse.role
    }));
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    const isInPages = window.location.pathname.includes('/pages/');
    window.location.href = isInPages ? '../index.html' : 'index.html';
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        this.save(data);
        return { success: true, user: this.getUser() };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: 'Cannot reach server. Is the backend running?' };
    }
  },

  async register(payload) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        this.save(data);
        return { success: true, user: this.getUser() };
      }
      // Validation errors come as object { field: message }
      if (typeof data === 'object' && !data.message) {
        const msgs = Object.values(data).join(', ');
        return { success: false, message: msgs };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Cannot reach server. Is the backend running?' };
    }
  }
};

// ===========================
// CART MANAGEMENT
// ===========================
const Cart = {
  // Key is per-user so carts never bleed between accounts
  _key() {
    const user = Auth.getUser();
    return user ? `senim_cart_${user.id}` : 'senim_cart_guest';
  },

  getItems() {
    return JSON.parse(localStorage.getItem(this._key()) || '[]');
  },

  saveItems(items) {
    localStorage.setItem(this._key(), JSON.stringify(items));
    Cart.updateBadge();
    Cart.dispatchChange();
  },

  addItem(product) {
    const items = Cart.getItems();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      items.push({ ...product, quantity: 1 });
    }
    Cart.saveItems(items);
    Toast.show(`${product.name} added to cart`, 'success');
  },

  removeItem(productId) {
    const items = Cart.getItems().filter(i => i.id !== productId);
    Cart.saveItems(items);
  },

  updateQuantity(productId, qty) {
    const items = Cart.getItems();
    const item = items.find(i => i.id === productId);
    if (item) {
      item.quantity = Math.max(1, qty);
      Cart.saveItems(items);
    }
  },

  getTotal() {
    return Cart.getItems().reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
  },

  getCount() {
    return Cart.getItems().reduce((sum, i) => sum + (i.quantity || 1), 0);
  },

  clear() {
    Cart.saveItems([]);
  },

  updateBadge() {
    const count = Cart.getCount();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.classList.toggle('show', count > 0);
    });
  },

  dispatchChange() {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
};

// ===========================
// API CLIENT (with JWT)
// ===========================
const API = {
  _headers(withAuth = false) {
    const h = { 'Content-Type': 'application/json' };
    if (withAuth) {
      const token = Auth.getToken();
      if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  },

  async get(endpoint, requireAuth = false) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: this._headers(requireAuth)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API GET ${endpoint} failed:`, err.message);
      return null;
    }
  },

  async post(endpoint, data, requireAuth = false) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: this._headers(requireAuth),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API POST ${endpoint} failed:`, err.message);
      return null;
    }
  },

  async put(endpoint, data, requireAuth = false) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: this._headers(requireAuth),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API PUT ${endpoint} failed:`, err.message);
      return null;
    }
  },

  async delete(endpoint, requireAuth = false) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: this._headers(requireAuth)
      });
      return res.ok;
    } catch (err) {
      console.warn(`API DELETE ${endpoint} failed:`, err.message);
      return false;
    }
  }
};

// ===========================
// TOAST NOTIFICATIONS
// ===========================
const Toast = {
  container: null,

  init() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'success', duration = 3000) {
    if (!this.container) this.init();
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="font-size:1rem">${icons[type]||'•'}</span> ${message}`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ===========================
// ORDERS NAV HELPERS
// ===========================
function getActiveOrderCount() {
  const user = Auth.getUser();
  const key = user ? `senim_orders_${user.id}` : 'senim_orders_guest';
  const orders = JSON.parse(localStorage.getItem(key) || '[]');
  return orders.filter(o => {
    const delivery = new Date(o.deliveryDate + 'T23:59:59');
    return delivery > new Date();
  }).length;
}

function goOrders() {
  const isInPages = window.location.pathname.includes('/pages/');
  window.location.href = isInPages ? 'orders.html' : 'pages/orders.html';
}

// ===========================
// SIGN OUT HANDLER
// ===========================
function handleSignOut(btn) {
  btn.textContent = 'Signing out…';
  btn.disabled = true;
  setTimeout(() => {
    Auth.logout();
  }, 400);
}

// ===========================
// PATH HELPER (works from
// both root and /pages/)
// ===========================
function determinePath(page) {
  const isInPages = window.location.pathname.includes('/pages/');
  return isInPages ? `../${page}` : `pages/${page}`;
}

// ===========================
// NAVBAR (with auth state)
// ===========================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Inject auth button into nav-actions
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    const authBtnArea = document.createElement('div');
    authBtnArea.style.cssText = 'display:flex;align-items:center;gap:8px';

    if (Auth.isLoggedIn()) {
      const user = Auth.getUser();
      const activeOrders = getActiveOrderCount();
      authBtnArea.innerHTML = `
        <span style="font-size:.82rem;color:var(--gray);display:none" class="user-greeting">Hi, ${user.firstName}</span>
        <div style="position:relative;display:inline-block">
          <button class="btn btn-outline" style="padding:7px 14px;font-size:.8rem;display:flex;align-items:center;gap:6px" onclick="goOrders()" id="orders-nav-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
            Orders${activeOrders > 0 ? ` <span style="background:var(--green);color:white;border-radius:10px;padding:1px 7px;font-size:.72rem;font-weight:700">${activeOrders}</span>` : ''}
          </button>
        </div>
        <button class="btn btn-outline" style="padding:7px 16px;font-size:.8rem" id="signout-btn" onclick="handleSignOut(this)">
          Sign Out
        </button>
      `;
      // Show greeting on wider screens
      const greeting = authBtnArea.querySelector('.user-greeting');
      if (window.innerWidth > 768) greeting.style.display = '';
    } else {
      const isInPages = window.location.pathname.includes('/pages/');
      const authUrl   = isInPages ? 'auth.html' : 'pages/auth.html';
      authBtnArea.innerHTML = `
        <a href="${authUrl}" class="btn btn-outline" style="padding:7px 16px;font-size:.8rem">
          Sign In
        </a>
      `;
    }

    navActions.prepend(authBtnArea);
  }

  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === currentPage || href.includes(currentPage))) {
      a.classList.add('active');
    }
  });

  Cart.updateBadge();
}

// ===========================
// FORMAT PRICE
// ===========================
function formatPrice(price) {
  return new Intl.NumberFormat('kk-KZ', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(price) + ' ₸';
}

// ===========================
// PRODUCT CARD TEMPLATE
// ===========================
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  // Determine path prefix (root vs /pages/)
  const isInPages = window.location.pathname.includes('/pages/');
  const detailUrl = isInPages
    ? `product-detail.html?id=${product.id}`
    : `pages/product-detail.html?id=${product.id}`;

  card.innerHTML = `
    <div class="product-card-image">
      <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}" loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'">
      ${product.stock <= 5 && product.stock > 0 ? '<span class="product-badge">Low Stock</span>' : ''}
      ${product.stock === 0 ? '<span class="product-badge" style="background:#e53e3e">Out of Stock</span>' : ''}
      <div class="product-actions-overlay">
        <button class="overlay-btn" onclick="event.stopPropagation(); window.location.href='${detailUrl}'" title="View Details">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>
    <div class="product-card-body">
      <div class="product-category-tag">${product.category || ''}</div>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-desc">${product.description || ''}</p>
      <div class="product-footer">
        <div>
          <span class="product-price">${formatPrice(product.price)}</span>
        </div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); Cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                ${product.stock === 0 ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''} title="Add to Cart">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  card.addEventListener('click', (e) => {
    if (!e.target.closest('button')) {
      window.location.href = detailUrl;
    }
  });
  return card;
}

// ===========================
// SAMPLE DATA (fallback)
// ===========================
const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Brown Sofa', category: 'Sofas', description: 'Luxurious brown leather sofa with deep cushions.', price: 699000, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', color: 'Brown', material: 'Leather', stock: 8 },
  { id: 2, name: 'Green Armchair', category: 'Armchairs', description: 'Elegant green velvet armchair.', price: 249000, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', color: 'Green', material: 'Velvet', stock: 12 },
  { id: 3, name: 'Red Curtain Set', category: 'Curtains', description: 'Rich red linen curtains.', price: 249000, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', color: 'Red', material: 'Linen', stock: 20 },
  { id: 4, name: 'Organic Chair', category: 'Chairs', description: 'Minimalist scandinavian chair.', price: 199000, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600', color: 'Natural', material: 'Wood', stock: 5 },
  { id: 5, name: 'Marble Coffee Table', category: 'Tables', description: 'Elegant marble-top coffee table with gold legs.', price: 389000, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', color: 'White/Gold', material: 'Marble', stock: 3 },
  { id: 6, name: 'Luxury Floor Lamp', category: 'Accessories', description: 'Sleek black floor lamp.', price: 129000, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', color: 'Black', material: 'Metal', stock: 15 },
  { id: 7, name: 'Velvet Throw Pillow', category: 'Pillows', description: 'Set of 2 luxurious velvet throw pillows.', price: 45000, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600', color: 'Beige', material: 'Velvet', stock: 30 },
  { id: 8, name: 'Oak Dining Table', category: 'Tables', description: 'Solid oak dining table seating 6.', price: 850000, imageUrl: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=600', color: 'Oak', material: 'Wood', stock: 4 },
  { id: 9, name: 'Linen Sofa 3-Seat', category: 'Sofas', description: 'Contemporary 3-seat sofa in natural linen.', price: 580000, imageUrl: 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600', color: 'Cream', material: 'Linen', stock: 6 },
  { id: 10, name: 'Velvet Armchair', category: 'Armchairs', description: 'Deep-button tufted armchair in royal blue velvet.', price: 319000, imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600', color: 'Blue', material: 'Velvet', stock: 9 },
  { id: 11, name: 'Sheer White Curtains', category: 'Curtains', description: 'Light, airy white sheer curtains.', price: 189000, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', color: 'White', material: 'Sheer Fabric', stock: 25 },
  { id: 12, name: 'Foam Accent Pillow Set', category: 'Pillows', description: 'Set of 4 colorful geometric accent pillows.', price: 65000, imageUrl: 'https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?w=600', color: 'Multi', material: 'Cotton', stock: 18 }
];

// ===========================
// LOAD PRODUCTS (API + fallback)
// ===========================
async function loadProducts(category = null) {
  let products = null;
  if (category) {
    products = await API.get(`/products/category/${category}`);
  } else {
    products = await API.get('/products');
  }
  if (!products || products.length === 0) {
    products = category
      ? SAMPLE_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase())
      : SAMPLE_PRODUCTS;
  }
  return products;
}

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  initNavbar();
});

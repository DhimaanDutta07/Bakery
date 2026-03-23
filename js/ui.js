// ── Toast ──
const Toast = (() => {
  let container;
  function getContainer() {
    if (!container) {
      container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    }
    return container;
  }
  function show(msg, type = 'info', duration = 3200) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    el.innerHTML = `
      <span class="toast__icon">${icons[type] || 'ℹ'}</span>
      <span class="toast__msg">${msg}</span>
      <button class="toast__close" onclick="this.closest('.toast').remove()">✕</button>`;
    getContainer().appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all 0.3s'; setTimeout(() => el.remove(), 300); }, duration);
  }
  return { show };
})();

// ── Navbar scroll shadow ──
window.addEventListener('scroll', () => {
  document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── Hamburger menu ──
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  }));
}

// ── Active nav link ──
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar__links a, .mobile-menu a').forEach(a => {
  const href = a.getAttribute('href') || '';
  if (href.includes(currentPage) || (currentPage === 'index.html' && href === '#')) {
    a.classList.add('active');
  }
});

// ── Seasonal banner close ──
document.querySelector('.close-banner')?.addEventListener('click', function() {
  this.closest('.seasonal-banner').style.display = 'none';
});

// ── Modal helpers ──
function openModal(overlayId) {
  const el = document.getElementById(overlayId);
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(overlayId) {
  const el = document.getElementById(overlayId);
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.cart-sidebar.open').forEach(() => closeCart());
    document.body.style.overflow = '';
  }
});

// ── Quick View Modal ──
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const overlay = document.getElementById('quick-view-overlay');
  if (!overlay) return;

  const tagHtml = (product.isVegan ? '<span class="badge badge--sage">Vegan</span>' : '')
    + (product.isEggless ? '<span class="badge badge--rose">Eggless</span>' : '');

  overlay.querySelector('.qv-modal__body').innerHTML = `
    <div class="qv-modal__category">${product.category}</div>
    <div class="qv-modal__name">${product.name}</div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div class="stars">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '½' : ''}</div>
      <span style="font-size:13px;color:var(--muted)">${product.rating}/5</span>
    </div>
    <div class="qv-modal__price">₹${product.price.toLocaleString('en-IN')}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${tagHtml}</div>
    <div class="qv-modal__desc">${product.description}</div>
    <div class="qv-modal__meta">
      <div class="qv-modal__meta-row"><span class="qv-modal__meta-label">Weight</span><span class="qv-modal__meta-value">${product.weight}</span></div>
      <div class="qv-modal__meta-row"><span class="qv-modal__meta-label">Serves</span><span class="qv-modal__meta-value">${product.servings || '—'}</span></div>
      <div class="qv-modal__meta-row"><span class="qv-modal__meta-label">Ingredients</span><span class="qv-modal__meta-value">${product.ingredients.join(', ')}</span></div>
      <div class="qv-modal__meta-row"><span class="qv-modal__meta-label">Allergens</span><span class="qv-modal__meta-value">${product.allergens}</span></div>
    </div>
    <div>
      <label class="form-label" style="margin-bottom:8px;display:block">Customisation</label>
      <select class="select-field" id="qv-custom-msg" style="margin-bottom:8px">
        <option value="">No message on item</option>
        <option value="message">Add message on cake</option>
        <option value="eggless">Make it eggless</option>
        <option value="extra-frosting">Extra frosting (+₹50)</option>
      </select>
    </div>
    <div class="qty-selector">
      <span style="font-size:14px;color:var(--muted)">Qty:</span>
      <button class="qty-btn" onclick="qvChangeQty(-1)">−</button>
      <span class="qty-count" id="qv-qty">1</span>
      <button class="qty-btn" onclick="qvChangeQty(1)">+</button>
    </div>
    <div style="display:flex;gap:10px;margin-top:4px">
      <button class="btn btn--primary" style="flex:1" onclick="qvAddToCart(${product.id})">Add to Cart</button>
      <button class="btn btn--dark" style="flex:1" onclick="qvBuyNow(${product.id})">Buy Now</button>
    </div>
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn btn--swiggy btn--sm" style="flex:1;font-size:13px" onclick="openDeliveryModal('swiggy')">Order on Swiggy</button>
      <button class="btn btn--zomato btn--sm" style="flex:1;font-size:13px" onclick="openDeliveryModal('zomato')">Order on Zomato</button>
    </div>
  `;

  const imgEl = overlay.querySelector('.qv-modal__image-col img');
  if (imgEl) { imgEl.src = product.image; imgEl.alt = product.name; }

  overlay.setAttribute('data-product-id', productId);
  openModal('quick-view-overlay');
}

let qvQty = 1;
function qvChangeQty(delta) {
  qvQty = Math.max(1, qvQty + delta);
  const el = document.getElementById('qv-qty');
  if (el) el.textContent = qvQty;
}
function qvAddToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (product) { Cart.add(product, qvQty); closeModal('quick-view-overlay'); }
  qvQty = 1;
}
function qvBuyNow(id) {
  qvAddToCart(id);
  window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'checkout.html';
}

// ── Delivery Platform Modal ──
function openDeliveryModal(platform) {
  const overlay = document.getElementById('platform-overlay');
  if (!overlay) return;
  const isSwiggy = platform === 'swiggy';
  overlay.querySelector('.platform-modal').innerHTML = `
    <button class="modal__close-btn" onclick="closeModal('platform-overlay')" style="position:static;margin-left:auto;display:flex;margin-bottom:16px">✕</button>
    <div class="platform-modal__logo platform-modal__logo--${platform}">${isSwiggy ? 'S' : 'Z'}</div>
    <div class="platform-modal__title">Redirecting to ${isSwiggy ? 'Swiggy' : 'Zomato'}…</div>
    <div class="platform-modal__sub">We're sending your cart to ${isSwiggy ? 'Swiggy' : 'Zomato'} for fast delivery.</div>
    <div class="platform-modal__progress"><div class="platform-modal__progress-bar platform-modal__progress-bar--${platform}"></div></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn btn--${platform}" onclick="simulateOrder('${platform}')">Simulate Order Placed</button>
      <button class="btn btn--ghost" onclick="closeModal('platform-overlay')">Continue on Our Site</button>
    </div>
  `;
  openModal('platform-overlay');
}

function simulateOrder(platform) {
  closeModal('platform-overlay');
  const orderId = 'SH' + Math.random().toString(36).substring(2,8).toUpperCase();
  Toast.show(`Order sent to ${platform === 'swiggy' ? 'Swiggy' : 'Zomato'}! Track: ${orderId}`, 'success', 5000);
}

// ── Scroll Reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Simple Carousel ──
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel__track');
  const prevBtn = carousel.querySelector('.carousel__btn--prev');
  const nextBtn = carousel.querySelector('.carousel__btn--next');
  const dots = carousel.querySelectorAll('.carousel__dot');
  if (!track) return;

  let current = 0;
  const items = track.children;
  const getVisible = () => window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : parseInt(carousel.dataset.visible || '3');

  function goTo(idx) {
    const max = Math.max(0, items.length - getVisible());
    current = Math.max(0, Math.min(idx, max));
    const itemW = items[0]?.offsetWidth + 16 || 0;
    track.style.transform = `translateX(-${current * itemW}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  // Auto-play
  let autoInterval = setInterval(() => goTo(current + 1 > items.length - getVisible() ? 0 : current + 1), 4500);
  carousel.addEventListener('mouseenter', () => clearInterval(autoInterval));
  carousel.addEventListener('mouseleave', () => { autoInterval = setInterval(() => goTo(current + 1 > items.length - getVisible() ? 0 : current + 1), 4500); });
  window.addEventListener('resize', () => goTo(0));
});

// ── Navbar search handler (homepage) ──
const navSearchInput = document.querySelector('.navbar__search input');
if (navSearchInput) {
  navSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = navSearchInput.value.trim();
      if (q) window.location.href = `pages/shop.html?q=${encodeURIComponent(q)}`;
    }
  });
}

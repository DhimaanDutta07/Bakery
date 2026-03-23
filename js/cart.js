// ── Cart Module ──
const Cart = (() => {
  const STORAGE_KEY = 'sweethaven_cart';
  let items = [];
  let listeners = [];

  function load() {
    try { items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { items = []; }
    notify();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notify();
  }

  function notify() {
    listeners.forEach(fn => fn(items));
    updateBadge();
  }

  function on(fn) { listeners.push(fn); fn(items); }

  function add(product, qty = 1) {
    const existing = items.find(i => i.id === product.id);
    if (existing) { existing.qty += qty; }
    else { items.push({ ...product, qty }); }
    save();
    Toast.show(`${product.name} added to cart`, 'success');
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    save();
  }

  function updateQty(id, qty) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (qty <= 0) { remove(id); return; }
    item.qty = qty;
    save();
  }

  function clear() { items = []; save(); }

  function getItems()   { return [...items]; }
  function getCount()   { return items.reduce((s, i) => s + i.qty, 0); }
  function getSubtotal(){ return items.reduce((s, i) => s + i.price * i.qty, 0); }
  function getTotal()   {
    const sub = getSubtotal();
    if (sub === 0) return 0;
    const delivery = 49;
    const tax = Math.round(sub * 0.05);
    return sub + delivery + tax;
  }

  function updateBadge() {
    const count = getCount();
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = count > 99 ? '99+' : count;
      b.classList.toggle('visible', count > 0);
    });
  }

  return { load, add, remove, updateQty, clear, on, getItems, getCount, getSubtotal, getTotal };
})();

// ── Cart Sidebar Renderer ──
function renderCartSidebar() {
  const bodyEl   = document.getElementById('cart-body');
  const footerEl = document.getElementById('cart-footer');
  if (!bodyEl) return;

  const items = Cart.getItems();

  if (items.length === 0) {
    bodyEl.innerHTML = `
      <div class="cart-sidebar__empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Your cart is empty</p>
        <a href="../index.html" class="btn btn--primary btn--sm">Start Shopping</a>
      </div>`;
    if (footerEl) footerEl.innerHTML = '';
    return;
  }

  bodyEl.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-item__controls">
          <button class="qty-btn" onclick="Cart.updateQty(${item.id}, ${item.qty - 1})">−</button>
          <span class="qty-count">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty(${item.id}, ${item.qty + 1})">+</button>
          <button class="cart-item__remove" onclick="Cart.remove(${item.id})" title="Remove">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const sub      = Cart.getSubtotal();
  const delivery = sub > 0 ? 49 : 0;
  const tax      = Math.round(sub * 0.05);
  const total    = sub + delivery + tax;

  if (footerEl) {
    footerEl.innerHTML = `
      <div class="cart-summary-row"><span>Subtotal</span><span>₹${sub.toLocaleString('en-IN')}</span></div>
      <div class="cart-summary-row"><span>Delivery</span><span>₹${delivery}</span></div>
      <div class="cart-summary-row"><span>GST (5%)</span><span>₹${tax.toLocaleString('en-IN')}</span></div>
      <div class="cart-summary-row total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
      <a href="${window.location.pathname.includes('/pages/') ? 'checkout.html' : 'pages/checkout.html'}" class="btn btn--primary btn--full">Proceed to Checkout</a>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn--swiggy btn--sm" style="flex:1;font-size:12px" onclick="openDeliveryModal('swiggy')">🛵 Swiggy</button>
        <button class="btn btn--zomato btn--sm" style="flex:1;font-size:12px" onclick="openDeliveryModal('zomato')">🍽 Zomato</button>
      </div>
    `;
  }
}

Cart.on(renderCartSidebar);

// ── Cart Sidebar Open/Close ──
function openCart()  {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

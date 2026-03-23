// ── Checkout Page Logic ──
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('checkout-form')) return;

  renderOrderSummary();
  Cart.on(renderOrderSummary);

  // Form validation & submission
  document.getElementById('checkout-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!validateCheckoutForm()) return;
    placeOrder();
  });
});

function renderOrderSummary() {
  const container = document.getElementById('checkout-summary-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const deliveryEl = document.getElementById('checkout-delivery');
  const taxEl      = document.getElementById('checkout-tax');
  const totalEl    = document.getElementById('checkout-total');
  if (!container) return;

  const items    = Cart.getItems();
  const sub      = Cart.getSubtotal();
  const delivery = sub > 0 ? 49 : 0;
  const tax      = Math.round(sub * 0.05);
  const total    = sub + delivery + tax;

  container.innerHTML = items.length === 0
    ? '<p style="color:var(--muted);font-size:14px">Your cart is empty</p>'
    : items.map(item => `
      <div class="order-summary-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="order-summary-item__name">${item.name}</div>
        <div class="order-summary-item__qty">×${item.qty}</div>
        <div class="order-summary-item__price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>`).join('');

  if (subtotalEl) subtotalEl.textContent = `₹${sub.toLocaleString('en-IN')}`;
  if (deliveryEl) deliveryEl.textContent = sub > 0 ? `₹${delivery}` : 'Free';
  if (taxEl)      taxEl.textContent      = `₹${tax.toLocaleString('en-IN')}`;
  if (totalEl)    totalEl.textContent    = `₹${total.toLocaleString('en-IN')}`;
}

function validateCheckoutForm() {
  let valid = true;
  const fields = [
    { id: 'co-name',    msg: 'Name is required' },
    { id: 'co-phone',   msg: 'Valid phone required', pattern: /^[6-9]\d{9}$/ },
    { id: 'co-address', msg: 'Address is required' },
    { id: 'co-pincode', msg: 'Valid Mumbai pincode required', pattern: /^4[0-9]{5}$/ },
  ];
  fields.forEach(({ id, msg, pattern }) => {
    const el = document.getElementById(id);
    const err = document.getElementById(id + '-error');
    if (!el) return;
    const val = el.value.trim();
    const isOk = val && (!pattern || pattern.test(val));
    el.classList.toggle('error', !isOk);
    if (err) err.textContent = isOk ? '' : msg;
    if (!isOk) valid = false;
  });
  return valid;
}

function placeOrder() {
  const btn = document.getElementById('place-order-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Processing…'; }

  setTimeout(() => {
    const orderId = '#SH' + Math.random().toString(36).substring(2, 8).toUpperCase();
    Cart.clear();
    if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
    showOrderSuccess(orderId);
  }, 1800);
}

function showOrderSuccess(orderId) {
  const overlay = document.getElementById('success-overlay');
  if (!overlay) return;
  const idEl = overlay.querySelector('.order-success__id');
  if (idEl) idEl.textContent = `Order ID: ${orderId}`;

  const now  = new Date();
  const eta  = new Date(now.getTime() + 38 * 60000);
  const fmt  = t => t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const timeEl = overlay.querySelector('#success-eta');
  if (timeEl) timeEl.textContent = `${fmt(now)} – ${fmt(eta)}`;

  openModal('success-overlay');
  launchConfetti();
}

// ── Tiny Confetti ──
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * canvas.height,
    r: Math.random() * 7 + 3,
    d: Math.random() * 2 + 1,
    color: ['#D4874A','#C9A96E','#E8A598','#2C1810','#6bcb77'][Math.floor(Math.random() * 5)],
    tilt: Math.random() * 10 - 5,
    tiltAngleIncremental: Math.random() * 0.07 + 0.05,
    tiltAngle: 0,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r * 0.4, p.tiltAngle, 0, Math.PI * 2);
      ctx.fill();
    });
    update();
    frame = requestAnimationFrame(draw);
  }
  function update() {
    pieces.forEach(p => {
      p.y += p.d + 1.5;
      p.tiltAngle += p.tiltAngleIncremental;
      p.tilt = Math.sin(p.tiltAngle) * 12;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
    });
  }
  draw();
  setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 5000);
}

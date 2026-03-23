// ── Order Tracking ──
const ORDER_STATUSES = [
  { label: 'Order Placed',     icon: '✓', done: true },
  { label: 'Baking in Progress', icon: '🔥', done: false },
  { label: 'Quality Check',    icon: '⭐', done: false },
  { label: 'Out for Delivery', icon: '🛵', done: false },
  { label: 'Delivered',        icon: '🎉', done: false },
];

document.getElementById('track-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const id = document.getElementById('track-input')?.value.trim().toUpperCase();
  if (!id) return;

  // Simulate different statuses based on last char
  const charCode = id.charCodeAt(id.length - 1);
  const stepIdx  = charCode % 5;

  const statuses = ORDER_STATUSES.map((s, i) => ({ ...s, done: i <= stepIdx, active: i === stepIdx }));
  renderTrackSteps(statuses, id);
});

function renderTrackSteps(statuses, orderId) {
  const container = document.getElementById('track-result');
  if (!container) return;

  const eta = new Date(Date.now() + 25 * 60000);
  const fmt = t => t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  container.innerHTML = `
    <div style="margin-bottom:24px;padding:16px 20px;background:#fff;border:1px solid var(--border);border-radius:var(--r-lg);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em">Order ID</div>
        <div style="font-size:17px;font-weight:600;color:var(--espresso);margin-top:2px">${orderId}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;color:var(--muted)">Estimated Arrival</div>
        <div style="font-size:17px;font-weight:600;color:var(--honey);margin-top:2px">${fmt(eta)}</div>
      </div>
    </div>
    <div class="track-steps">
      ${statuses.map((s, i) => `
        <div class="track-step ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}">
          <div class="track-step__dot">${s.done ? '✓' : s.icon}</div>
          <div class="track-step__content">
            <div class="track-step__title">${s.label}</div>
            <div class="track-step__time">${s.done ? getStepTime(i) : '—'}</div>
          </div>
        </div>`).join('')}
    </div>
  `;
  container.style.display = 'block';
}

function getStepTime(idx) {
  const base = new Date(Date.now() - (4 - idx) * 8 * 60000);
  return base.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ── Shop Page Logic ──
let activeCategories = new Set();
let activeTags       = new Set();
let priceMax         = 2500;
let sortBy           = 'popular';
let searchQuery      = '';

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) html += `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    else if (i === full && half) html += `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><defs><clipPath id="h${i}"><rect x="0" y="0" width="12" height="24"/></clipPath></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z"/></svg>`;
    else html += `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }
  return html;
}

function getTagBadges(product) {
  let html = '';
  if (product.isVegan)   html += '<span class="badge badge--sage" style="font-size:10px;padding:2px 7px">Vegan</span>';
  if (product.isEggless && !product.isVegan) html += '<span class="badge badge--rose" style="font-size:10px;padding:2px 7px">Eggless</span>';
  if (product.tags.includes('bestseller')) html += '<span class="badge badge--honey" style="font-size:10px;padding:2px 7px">Bestseller</span>';
  if (product.tags.includes('seasonal'))  html += '<span class="badge badge--gold" style="font-size:10px;padding:2px 7px">Seasonal</span>';
  if (product.tags.includes('new'))       html += '<span class="badge badge--espresso" style="font-size:10px;padding:2px 7px">New</span>';
  return html;
}

function renderProductCard(product) {
  return `
    <div class="product-card reveal">
      <div class="product-card__image-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-card__badges">${getTagBadges(product)}</div>
        <button class="product-card__quick-view" onclick="openQuickView(${product.id})">Quick View</button>
      </div>
      <div class="product-card__body">
        <div class="product-card__category">${product.category}</div>
        <div class="product-card__name">${product.name}</div>
        <div class="product-card__desc">${product.description.substring(0,72)}…</div>
        <div class="product-card__footer">
          <div>
            <div class="product-card__price">₹${product.price.toLocaleString('en-IN')}<span> / ${product.weight}</span></div>
            <div class="stars" style="margin-top:4px">${renderStars(product.rating)}</div>
          </div>
          <button class="btn btn--primary product-card__add" onclick="Cart.add(PRODUCTS.find(p=>p.id===${product.id}))">Add</button>
        </div>
      </div>
    </div>
  `;
}

function applyFilters() {
  let filtered = [...PRODUCTS];

  if (activeCategories.size > 0) {
    filtered = filtered.filter(p => activeCategories.has(p.category));
  }
  if (activeTags.has('eggless')) filtered = filtered.filter(p => p.isEggless);
  if (activeTags.has('vegan'))   filtered = filtered.filter(p => p.isVegan);
  if (activeTags.has('gluten-free')) filtered = filtered.filter(p => p.tags.includes('gluten-free'));

  filtered = filtered.filter(p => p.price <= priceMax);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  switch (sortBy) {
    case 'price-asc':  filtered.sort((a,b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a,b) => b.price - a.price); break;
    case 'rating':     filtered.sort((a,b) => b.rating - a.rating); break;
    default:           filtered.sort((a,b) => b.tags.includes('bestseller') - a.tags.includes('bestseller')); break;
  }

  return filtered;
}

function renderGrid() {
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('product-count');
  if (!grid) return;

  const filtered = applyFilters();
  count && (count.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
        <p>No products found</p>
        <p style="font-size:14px;font-family:var(--font-body);margin-top:6px">Try adjusting your filters</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(renderProductCard).join('');

  // Observe new reveal elements
  grid.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.04}s`;
    revealObserver.observe(el);
  });
}

// ── Filter event listeners ──
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('product-grid')) return;

  // Read URL search param
  const urlParams = new URLSearchParams(window.location.search);
  const urlQ = urlParams.get('q');
  if (urlQ) {
    searchQuery = urlQ;
    const shopSearch = document.getElementById('shop-search');
    if (shopSearch) shopSearch.value = urlQ;
  }

  // Category checkboxes
  document.querySelectorAll('.filter-category').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.checked ? activeCategories.add(cb.value) : activeCategories.delete(cb.value);
      renderGrid();
    });
  });

  // Tag checkboxes
  document.querySelectorAll('.filter-tag').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.checked ? activeTags.add(cb.value) : activeTags.delete(cb.value);
      renderGrid();
    });
  });

  // Price range
  const priceSlider = document.getElementById('price-max');
  const priceLabel  = document.getElementById('price-max-label');
  priceSlider?.addEventListener('input', () => {
    priceMax = parseInt(priceSlider.value);
    if (priceLabel) priceLabel.textContent = `₹${priceMax.toLocaleString('en-IN')}`;
    renderGrid();
  });

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', e => {
    sortBy = e.target.value;
    renderGrid();
  });

  // Search
  document.getElementById('shop-search')?.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    renderGrid();
  });

  // Clear filters
  document.getElementById('clear-filters')?.addEventListener('click', () => {
    activeCategories.clear(); activeTags.clear();
    priceMax = 2500; sortBy = 'popular'; searchQuery = '';
    document.querySelectorAll('.filter-category, .filter-tag').forEach(cb => cb.checked = false);
    const slider = document.getElementById('price-max');
    if (slider) { slider.value = 2500; }
    const label = document.getElementById('price-max-label');
    if (label) label.textContent = '₹2,500';
    const search = document.getElementById('shop-search');
    if (search) search.value = '';
    const sortEl = document.getElementById('sort-select');
    if (sortEl) sortEl.value = 'popular';
    renderGrid();
  });

  renderGrid();
});

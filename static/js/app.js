/**
 * TechStore Frontend SPA
 * Cart in localStorage; prices & stock validated on backend
 */

const API = '/api';
const TAX_NOTE = 'Tasa de ejemplo pendiente de confirmación por la empresa';

// ---------- State ----------
let cart = JSON.parse(localStorage.getItem('techstore_cart') || '[]');
let customer = JSON.parse(localStorage.getItem('techstore_customer') || '{}');
let config = { tax_rate: 0.16, payment_enabled: false };

// ---------- Utils ----------
function $(sel, el = document) { return el.querySelector(sel); }
function $$(sel, el = document) { return [...el.querySelectorAll(sel)]; }

function saveCart() {
  localStorage.setItem('techstore_cart', JSON.stringify(cart));
  updateBadge();
}
function saveCustomer() {
  localStorage.setItem('techstore_customer', JSON.stringify(customer));
}

function updateBadge() {
  const badge = $('#cart-badge');
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  if (total > 0) {
    badge.textContent = total;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(n);
}

function toast(msg, type = 'info') {
  const c = $('#toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || 'Error de servidor');
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Theme ----------
function initTheme() {
  const saved = localStorage.getItem('techstore_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  $('#theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('techstore_theme', next);
  });
}

// ---------- Router ----------
function getRoute() {
  const hash = location.hash.slice(1) || '/';
  const [path, query] = hash.split('?');
  return { path, query: new URLSearchParams(query || '') };
}

function navigate(to) {
  location.hash = to;
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  updateBadge();
  try {
    config = await api('/config');
  } catch (e) {
    console.warn('Config load failed', e);
  }
  render();
});

// ---------- Views ----------
async function render() {
  const main = $('#main');
  const { path } = getRoute();

  // Active nav
  $$('.nav-link').forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('active', href === path || (path === '/' && href === '/'));
  });

  try {
    if (path === '/' || path === '') {
      await viewCatalog(main);
    } else if (path.startsWith('/product/')) {
      const id = path.split('/')[2];
      await viewProduct(main, id);
    } else if (path === '/cart') {
      await viewCart(main);
    } else if (path === '/checkout') {
      await viewCheckout(main);
    } else if (path === '/review') {
      await viewReview(main);
    } else if (path === '/payment') {
      await viewPayment(main);
    } else {
      main.innerHTML = `<div class="empty-state"><h3>Página no encontrada</h3><a href="#/" data-link class="btn btn-primary mt-2">Ir al catálogo</a></div>`;
    }
  } catch (e) {
    main.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${e.message}</p><button class="btn btn-secondary mt-2" onclick="location.reload()">Reintentar</button></div>`;
  }

  // Link handling
  $$('[data-link]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigate(a.getAttribute('href').replace('#', '') || '/');
    });
  });
}

// A. Catalog
async function viewCatalog(main) {
  main.innerHTML = `
    <section class="hero" id="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <span class="hero-badge">Destacados</span>
          <h1>Lo mejor en tecnología, listo para ti</h1>
          <p>Laptops, PCs gaming, monitores y componentes seleccionados por rendimiento y relación calidad-precio. Explora nuestras recomendaciones.</p>
          <a href="#catalog-anchor" class="btn btn-primary hero-cta" id="hero-cta">Ver catálogo completo</a>
        </div>
        <div class="hero-featured" id="hero-featured">
          <p class="text-muted" style="opacity:0.7">Cargando destacados...</p>
        </div>
      </div>
    </section>

    <h1 class="page-title" id="catalog-anchor">Catálogo de productos</h1>
    <p class="page-subtitle">Computadoras, componentes y accesorios tecnológicos</p>
    <div class="toolbar">
      <input type="search" id="search" class="search-input" placeholder="Buscar productos..." />
      <select id="category" class="select">
        <option value="">Todas las categorías</option>
      </select>
    </div>
    <div id="products" class="products-grid">
      <div class="empty-state"><p>Cargando...</p></div>
    </div>
  `;

  // Load featured products for hero
  try {
    const featured = await api('/featured');
    const heroBox = $('#hero-featured');
    if (featured.length) {
      heroBox.innerHTML = featured.slice(0, 4).map(p => `
        <a href="#/product/${p.id}" class="hero-card" data-link>
          <img src="${p.image_url}" alt="${escapeHtml(p.name)}" loading="lazy" />
          <div class="hero-card-body">
            <span class="hero-card-name">${escapeHtml(p.name)}</span>
            <span class="hero-card-price">${formatPrice(p.price)}</span>
          </div>
        </a>
      `).join('');
      $$('#hero-featured [data-link]').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          navigate(a.getAttribute('href').replace('#', ''));
        });
      });
    } else {
      heroBox.innerHTML = '';
    }
  } catch (e) {
    console.warn('Featured load failed', e);
    const heroBox = $('#hero-featured');
    if (heroBox) heroBox.innerHTML = '';
  }

  // Smooth scroll for CTA
  $('#hero-cta')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('catalog-anchor')?.scrollIntoView({ behavior: 'smooth' });
  });

  const cats = await api('/categories');
  const sel = $('#category');
  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = c.slug;
    o.textContent = c.name;
    sel.appendChild(o);
  });

  const load = async () => {
    const q = $('#search').value.trim();
    const cat = $('#category').value;
    let url = '/products?available=1';
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (cat) url += `&category=${encodeURIComponent(cat)}`;
    const products = await api(url);
    const grid = $('#products');
    if (!products.length) {
      grid.innerHTML = `<div class="empty-state card glass" style="grid-column:1/-1"><h3>Sin resultados</h3><p>No hay productos que coincidan con tu búsqueda o filtro.</p></div>`;
      return;
    }
    grid.innerHTML = products.map(p => `
      <article class="card product-card glass">
        <div class="product-img-wrap">
          <img class="product-img" src="${p.image_url}" alt="${escapeHtml(p.name)}" loading="lazy" />
        </div>
        <div class="product-body">
          <span class="product-cat">${escapeHtml(p.category_name)}</span>
          <h2 class="product-name">${escapeHtml(p.name)}</h2>
          <p class="product-price">${formatPrice(p.price)}</p>
          <p class="product-stock ${p.stock <= 5 ? (p.stock === 0 ? 'out' : 'low') : ''}">
            ${p.stock > 0 ? `Disponible: ${p.stock} unidades` : 'Agotado'}
          </p>
          <div class="product-actions">
            <a href="#/product/${p.id}" class="btn btn-secondary btn-sm" data-link>Ver detalle</a>
            <button class="btn btn-primary btn-sm" data-add="${p.id}" ${p.stock < 1 ? 'disabled' : ''}>Agregar</button>
          </div>
        </div>
      </article>
    `).join('');

    $$('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.add, 10), 1));
    });
    $$('[data-link]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        navigate(a.getAttribute('href').replace('#', ''));
      });
    });
  };

  $('#search').addEventListener('input', debounce(load, 300));
  $('#category').addEventListener('change', load);
  await load();
}

// Product detail
async function viewProduct(main, id) {
  const p = await api(`/products/${id}`);
  main.innerHTML = `
    <div class="detail-layout">
      <div class="detail-img card">
        <img src="${p.image_url}" alt="${escapeHtml(p.name)}" />
      </div>
      <div class="detail-info">
        <span class="product-cat">${escapeHtml(p.category_name)}</span>
        <h1>${escapeHtml(p.name)}</h1>
        <p class="detail-price">${formatPrice(p.price)}</p>
        <p class="detail-desc">${escapeHtml(p.description || '')}</p>
        <p class="product-stock ${p.stock <= 5 ? (p.stock === 0 ? 'out' : 'low') : ''}">
          ${p.available && p.stock > 0 ? `En stock: ${p.stock} unidades` : 'No disponible'}
        </p>
        <div class="qty-control">
          <label for="qty">Cantidad</label>
          <input type="number" id="qty" class="qty-input" min="1" max="${p.stock}" value="1" ${p.stock < 1 ? 'disabled' : ''} />
        </div>
        <div class="flex-between">
          <button class="btn btn-primary" id="add-btn" ${!p.available || p.stock < 1 ? 'disabled' : ''}>Agregar al carrito</button>
          <a href="#/" class="btn btn-secondary" data-link>Volver al catálogo</a>
        </div>
      </div>
    </div>
  `;
  $('#add-btn')?.addEventListener('click', () => {
    const qty = parseInt($('#qty').value, 10) || 1;
    if (qty < 1 || qty > p.stock) {
      toast('Cantidad no válida o supera el stock', 'error');
      return;
    }
    addToCart(p.id, qty);
  });
  $$('[data-link]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); navigate(a.getAttribute('href').replace('#', '')); });
  });
}

function addToCart(productId, quantity) {
  const existing = cart.find(i => i.product_id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product_id: productId, quantity });
  }
  saveCart();
  toast('Producto agregado al carrito', 'success');
}

// B. Cart
async function viewCart(main) {
  if (cart.length === 0) {
    main.innerHTML = `
      <h1 class="page-title">Carrito</h1>
      <div class="empty-state card glass">
        <h3>Tu carrito está vacío</h3>
        <p>Explora el catálogo y agrega productos.</p>
        <a href="#/" class="btn btn-primary mt-2" data-link>Ir al catálogo</a>
      </div>
    `;
    bindLinks();
    return;
  }

  main.innerHTML = `
    <h1 class="page-title">Carrito de compra</h1>
    <p class="page-subtitle">Revisa cantidades y totales. Los precios se verifican en el servidor.</p>
    <div id="cart-content"><p class="text-muted">Validando...</p></div>
  `;

  try {
    const result = await api('/cart/validate', {
      method: 'POST',
      body: JSON.stringify({ items: cart })
    });
    if (!result.ok) {
      main.innerHTML = `<div class="empty-state"><h3>Problemas en el carrito</h3><ul>${(result.errors||[]).map(e=>`<li>${escapeHtml(e)}</li>`).join('')}</ul>
        <button class="btn btn-secondary mt-2" id="clear-cart">Vaciar carrito</button></div>`;
      $('#clear-cart')?.addEventListener('click', () => { cart = []; saveCart(); render(); });
      return;
    }

    // Sync quantities if needed (backend is source of truth for prices)
    const html = `
      <div class="card" style="overflow-x:auto">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio unit.</th>
              <th>Cantidad</th>
              <th>Importe</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${result.items.map(item => `
              <tr data-pid="${item.product_id}">
                <td data-label="Producto">
                  <div class="cart-item-info">
                    <img class="cart-item-img" src="${item.image_url}" alt="" />
                    <span class="cart-item-name">${escapeHtml(item.name)}</span>
                  </div>
                </td>
                <td data-label="Precio">${formatPrice(item.unit_price)}</td>
                <td data-label="Cantidad">
                  <input type="number" class="qty-input cart-qty" min="1" max="${item.stock}" value="${item.quantity}" data-pid="${item.product_id}" />
                </td>
                <td data-label="Importe">${formatPrice(item.line_total)}</td>
                <td data-label="">
                  <button class="btn btn-danger btn-sm remove-btn" data-pid="${item.product_id}">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="cart-totals glass card">
        <div class="totals-row"><span>Subtotal</span><span>${formatPrice(result.subtotal)}</span></div>
        <div class="totals-row"><span>Impuestos (${(result.tax_rate*100).toFixed(0)}%)</span><span>${formatPrice(result.tax)}</span></div>
        <div class="totals-row total"><span>Total</span><span>${formatPrice(result.total)}</span></div>
        <p class="totals-note">${TAX_NOTE}</p>
      </div>
      <div class="flex-between mt-3">
        <a href="#/" class="btn btn-secondary" data-link>Seguir comprando</a>
        <a href="#/checkout" class="btn btn-primary" data-link>Continuar al checkout</a>
      </div>
    `;
    $('#cart-content').innerHTML = html;

    $$('.cart-qty').forEach(inp => {
      inp.addEventListener('change', () => {
        const pid = parseInt(inp.dataset.pid, 10);
        let q = parseInt(inp.value, 10);
        if (isNaN(q) || q < 1) q = 1;
        const max = parseInt(inp.max, 10);
        if (q > max) { q = max; toast('Cantidad limitada por stock', 'error'); }
        const item = cart.find(i => i.product_id === pid);
        if (item) { item.quantity = q; saveCart(); render(); }
      });
    });
    $$('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = parseInt(btn.dataset.pid, 10);
        cart = cart.filter(i => i.product_id !== pid);
        saveCart();
        toast('Producto eliminado', 'info');
        render();
      });
    });
    bindLinks();
  } catch (e) {
    $('#cart-content').innerHTML = `<div class="empty-state"><p>${escapeHtml(e.message)}</p>
      <button class="btn btn-secondary mt-2" onclick="location.reload()">Reintentar</button></div>`;
  }
}

// C. Customer data
async function viewCheckout(main) {
  if (cart.length === 0) {
    main.innerHTML = `<div class="empty-state"><h3>Carrito vacío</h3><a href="#/" class="btn btn-primary mt-2" data-link>Ir al catálogo</a></div>`;
    bindLinks();
    return;
  }

  main.innerHTML = `
    <div class="steps">
      <div class="step done">1. Carrito</div>
      <div class="step active">2. Datos de entrega</div>
      <div class="step">3. Revisión</div>
      <div class="step">4. Pago</div>
    </div>
    <h1 class="page-title">Datos de entrega</h1>
    <p class="page-subtitle">Completa la información para el envío. Los campos con * son obligatorios.</p>
    <form id="checkout-form" class="card glass" style="padding:1.5rem; max-width:640px">
      <div class="form-grid">
        <div class="form-group full">
          <label for="full_name">Nombre completo *</label>
          <input type="text" id="full_name" name="full_name" value="${escapeAttr(customer.full_name || '')}" required />
          <span class="field-error" data-for="full_name"></span>
        </div>
        <div class="form-group">
          <label for="email">Correo electrónico *</label>
          <input type="email" id="email" name="email" value="${escapeAttr(customer.email || '')}" required />
          <span class="field-error" data-for="email"></span>
        </div>
        <div class="form-group">
          <label for="phone">Teléfono *</label>
          <input type="tel" id="phone" name="phone" value="${escapeAttr(customer.phone || '')}" required />
          <span class="field-error" data-for="phone"></span>
        </div>
        <div class="form-group full">
          <label for="address">Dirección *</label>
          <input type="text" id="address" name="address" value="${escapeAttr(customer.address || '')}" required />
          <span class="field-error" data-for="address"></span>
        </div>
        <div class="form-group">
          <label for="city">Ciudad *</label>
          <input type="text" id="city" name="city" value="${escapeAttr(customer.city || '')}" required />
          <span class="field-error" data-for="city"></span>
        </div>
        <div class="form-group">
          <label for="state">Estado / Provincia *</label>
          <input type="text" id="state" name="state" value="${escapeAttr(customer.state || '')}" required />
          <span class="field-error" data-for="state"></span>
        </div>
        <div class="form-group">
          <label for="postal_code">Código postal *</label>
          <input type="text" id="postal_code" name="postal_code" value="${escapeAttr(customer.postal_code || '')}" required />
          <span class="field-error" data-for="postal_code"></span>
        </div>
      </div>
      <div class="flex-between mt-3">
        <a href="#/cart" class="btn btn-secondary" data-link>Volver al carrito</a>
        <button type="submit" class="btn btn-primary">Continuar a revisión</button>
      </div>
    </form>
  `;
  bindLinks();

  $('#checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    $$('.field-error').forEach(el => el.textContent = '');
    $$('input.error').forEach(el => el.classList.remove('error'));

    const form = e.target;
    const data = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      postal_code: form.postal_code.value.trim()
    };

    // Client-side basic validation
    let ok = true;
    for (const [k, v] of Object.entries(data)) {
      if (!v) {
        const err = $(`[data-for="${k}"]`);
        if (err) err.textContent = 'Campo obligatorio';
        form[k]?.classList.add('error');
        ok = false;
      }
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      $('[data-for="email"]').textContent = 'Correo inválido';
      form.email.classList.add('error');
      ok = false;
    }
    if (!ok) return;

    customer = data;
    saveCustomer();
    navigate('/review');
  });
}

// D. Review
async function viewReview(main) {
  if (cart.length === 0) {
    navigate('/cart');
    return;
  }
  if (!customer.full_name) {
    navigate('/checkout');
    return;
  }

  main.innerHTML = `
    <div class="steps">
      <div class="step done">1. Carrito</div>
      <div class="step done">2. Datos de entrega</div>
      <div class="step active">3. Revisión</div>
      <div class="step">4. Pago</div>
    </div>
    <h1 class="page-title">Revisión de la compra</h1>
    <p class="page-subtitle">Verifica los productos y los datos de entrega antes de continuar.</p>
    <div id="review-content"><p class="text-muted">Calculando totales en el servidor...</p></div>
  `;

  try {
    const result = await api('/checkout/prepare', {
      method: 'POST',
      body: JSON.stringify({ customer, items: cart })
    });

    if (!result.ok) {
      if (result.customer_errors) {
        toast('Corrige los datos del cliente', 'error');
        navigate('/checkout');
        return;
      }
      throw new Error((result.errors || []).join(', ') || 'Error de validación');
    }

    // Persist validated snapshot for payment page
    sessionStorage.setItem('techstore_review', JSON.stringify(result));

    const c = result.customer;
    $('#review-content').innerHTML = `
      <div class="review-section card glass" style="padding:1.25rem">
        <h3>Productos</h3>
        <table class="cart-table">
          <thead>
            <tr><th>Producto</th><th>Cant.</th><th>P. unit.</th><th>Importe</th></tr>
          </thead>
          <tbody>
            ${result.items.map(i => `
              <tr>
                <td data-label="Producto">${escapeHtml(i.name)}</td>
                <td data-label="Cant.">${i.quantity}</td>
                <td data-label="P. unit.">${formatPrice(i.unit_price)}</td>
                <td data-label="Importe">${formatPrice(i.line_total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="cart-totals" style="margin-top:1rem; margin-left:0; max-width:100%">
          <div class="totals-row"><span>Subtotal</span><span>${formatPrice(result.subtotal)}</span></div>
          <div class="totals-row"><span>Impuestos (${(result.tax_rate*100).toFixed(0)}%)</span><span>${formatPrice(result.tax)}</span></div>
          <div class="totals-row total"><span>Total</span><span>${formatPrice(result.total)}</span></div>
          <p class="totals-note">${TAX_NOTE}</p>
        </div>
      </div>
      <div class="review-section card glass" style="padding:1.25rem">
        <h3>Datos de entrega</h3>
        <p><strong>${escapeHtml(c.full_name)}</strong></p>
        <p>${escapeHtml(c.email)} · ${escapeHtml(c.phone)}</p>
        <p>${escapeHtml(c.address)}</p>
        <p>${escapeHtml(c.city)}, ${escapeHtml(c.state)} ${escapeHtml(c.postal_code)}</p>
      </div>
      <div class="flex-between mt-2">
        <div>
          <a href="#/cart" class="btn btn-secondary" data-link>Modificar carrito</a>
          <a href="#/checkout" class="btn btn-secondary" data-link style="margin-left:0.5rem">Modificar datos</a>
        </div>
        <a href="#/payment" class="btn btn-primary" data-link>Intentar pago</a>
      </div>
    `;
    bindLinks();
  } catch (e) {
    $('#review-content').innerHTML = `<div class="empty-state"><p>${escapeHtml(e.message)}</p>
      <a href="#/cart" class="btn btn-secondary mt-2" data-link>Volver al carrito</a></div>`;
    bindLinks();
  }
}

// E. Payment (disabled)
async function viewPayment(main) {
  const review = JSON.parse(sessionStorage.getItem('techstore_review') || 'null');
  if (!review || !review.ok) {
    navigate('/review');
    return;
  }

  main.innerHTML = `
    <div class="steps">
      <div class="step done">1. Carrito</div>
      <div class="step done">2. Datos de entrega</div>
      <div class="step done">3. Revisión</div>
      <div class="step active">4. Pago</div>
    </div>
    <h1 class="page-title">Pago</h1>
    <div class="payment-box card">
      <p class="text-muted">Importe a pagar</p>
      <div class="amount">${formatPrice(review.total)}</div>
      <div class="payment-message">
        El servicio de pago todavía no está disponible. No se ha realizado ningún cobro.
      </div>
      <p class="text-muted" style="font-size:0.9rem; max-width:420px; margin:0 auto 1.5rem">
        Esta tienda es una demostración. No se solicitan datos de tarjetas ni se procesan transacciones reales.
      </p>
      <div class="flex-between" style="justify-content:center; gap:1rem">
        <a href="#/review" class="btn btn-secondary" data-link>Volver al resumen</a>
        <a href="#/cart" class="btn btn-secondary" data-link>Volver al carrito</a>
      </div>
    </div>
  `;

  // Call the disabled payment endpoint for completeness
  try {
    await api('/payment/attempt', {
      method: 'POST',
      body: JSON.stringify({ total: review.total })
    });
  } catch (_) { /* expected */ }

  bindLinks();
}

// Helpers
function bindLinks() {
  $$('[data-link]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigate(a.getAttribute('href').replace('#', '') || '/');
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

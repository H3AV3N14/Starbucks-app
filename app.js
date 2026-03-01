/* ================================================
   STARBUCKS® INDIA — app.js
   Complete end-to-end app logic
   ================================================ */

/* ── MENU DATA ── */
const MENU = [
  { id:1,  name:'Caramel Macchiato',        type:'Latte',        cat:'latte', icon:'☕', basePrice:295, desc:'Freshly steamed milk with vanilla-flavoured syrup, bold espresso and rich caramel sauce, lightly drizzled on top.' },
  { id:2,  name:'Double Choc Chip Frap',    type:'Frappuccino',  cat:'frap',  icon:'🧋', basePrice:285, desc:'Rich mocha-flavoured sauce meets chocolaty chips, milk and ice. Topped with sweetened whipped cream and mocha drizzle.' },
  { id:3,  name:'Vanilla Latte',            type:'Latte',        cat:'latte', icon:'🥛', basePrice:275, desc:'A classic blend of rich espresso and creamy steamed milk, sweetened with house-made vanilla syrup.' },
  { id:4,  name:'Cold Brew',               type:'Cold Brew',    cat:'cold',  icon:'🧊', basePrice:265, desc:'Slow-steeped for 20 hours for a naturally sweet, smooth flavour. Served over ice.' },
  { id:5,  name:'Mango Dragon Frap',        type:'Frappuccino',  cat:'frap',  icon:'🥭', basePrice:310, desc:'A bright, tropical blend of mango and dragon fruit flavours, blended with ice and cream.' },
  { id:6,  name:'Java Chip Frappuccino',    type:'Frappuccino',  cat:'frap',  icon:'🍫', basePrice:295, desc:'Mocha sauce and Frappuccino chips blended with coffee, milk and ice. Topped with whipped cream.' },
  { id:7,  name:'Matcha Latte',             type:'Latte',        cat:'latte', icon:'🍵', basePrice:285, desc:'Whole milk steamed with premium ceremonial grade matcha, lightly sweetened.' },
  { id:8,  name:'Peach Green Tea',          type:'Tea',          cat:'tea',   icon:'🍑', basePrice:240, desc:'Jade citrus mint green tea with peach juice, water and ice.' },
  { id:9,  name:'Avocado Toast',            type:'Food',         cat:'food',  icon:'🥑', basePrice:320, desc:'Multigrain toast with smashed avocado, cherry tomatoes, micro greens, and a lemon drizzle.' },
  { id:10, name:'Banana Bread',             type:'Food',         cat:'food',  icon:'🍌', basePrice:195, desc:'Moist and sweet banana bread made with real bananas, walnuts and cinnamon.' },
  { id:11, name:'Nitro Cold Brew',          type:'Cold Brew',    cat:'cold',  icon:'⚗️',  basePrice:310, desc:'Our cold brew charged with nitrogen for a smooth, rich flavour and creamy, velvety texture.' },
  { id:12, name:'Chai Tea Latte',           type:'Tea',          cat:'tea',   icon:'🫖', basePrice:260, desc:'Black tea-infused with cinnamon, clove and warming spices, combined with steamed milk.' },
];

const SIZE_EXTRAS = { tall:0, grande:25, venti:55 };

/* ── CART STATE ── */
let cart = [];
let selectedItem  = null;
let selectedSize  = 'grande';
let selectedQty   = 1;
let selectedMethod = 'upi';
let promoApplied  = false;
let currentOrderId = '';

/* ── PAGE NAVIGATION ── */
const PAGES_WITH_NAV  = ['pg-home'];
const PAGES_WITH_SCROLL = ['pg-home', 'pg-product', 'pg-cart', 'pg-checkout', 'pg-payment'];

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(id);
  page.classList.add('active');
  page.scrollTop = 0;

  // Bottom nav visibility
  const nav = document.getElementById('bottomNav');
  if (['pg-home', 'pg-product', 'pg-cart'].includes(id)) {
    nav.classList.add('visible');
    document.querySelectorAll('.bnav-item').forEach(i => i.classList.remove('active'));
    if (id === 'pg-home') document.querySelector('.bnav-item[data-page="pg-home"]').classList.add('active');
    if (id === 'pg-cart') document.querySelector('.cart-nav-item').classList.add('active');
  } else {
    nav.classList.remove('visible');
  }

  updateCartBadge();
}

/* ── CLOCK ── */
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2,'0');
  const m = now.getMinutes().toString().padStart(2,'0');
  document.getElementById('clock').textContent = h + ':' + m;
}
updateClock();
setInterval(updateClock, 30000);

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── LOADING ── */
function showLoading(text = 'Processing…') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.remove('hidden');
}
function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

/* ── CART BADGE ── */
function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('bnavBadge');
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

/* ═══════════════════════════════════════
   LOGIN
═══════════════════════════════════════ */
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { showToast('⚠️ Please fill all fields'); return; }
  if (!email.includes('@')) { showToast('⚠️ Invalid email'); return; }
  showLoading('Signing you in…');
  setTimeout(() => { hideLoading(); buildMenu(); showPage('pg-home'); }, 1400);
});

document.getElementById('googleLoginBtn').addEventListener('click', () => {
  showLoading('Authenticating with Google…');
  setTimeout(() => { hideLoading(); buildMenu(); showPage('pg-home'); }, 1200);
});

/* ═══════════════════════════════════════
   HOME — BUILD MENU
═══════════════════════════════════════ */
function buildMenu(cat = 'all') {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';
  const items = cat === 'all' ? MENU : MENU.filter(m => m.cat === cat);
  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.style.animationDelay = (i * 0.06) + 's';
    card.innerHTML = `
      <div class="mc-icon">${item.icon}</div>
      <div class="mc-name">${item.name}</div>
      <div class="mc-type">${item.type}</div>
      <div class="mc-footer">
        <div class="mc-price">₹${item.basePrice}</div>
        <button class="mc-add">+</button>
      </div>`;
    card.addEventListener('click', () => openProduct(item));
    card.querySelector('.mc-add').addEventListener('click', e => {
      e.stopPropagation();
      quickAddToCart(item);
    });
    grid.appendChild(card);
  });
}

/* Category filter */
document.getElementById('catStrip').addEventListener('click', e => {
  const chip = e.target.closest('.cat-chip');
  if (!chip) return;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  buildMenu(chip.dataset.cat);
});

/* Featured banner */
document.querySelector('.featured-btn').addEventListener('click', () => {
  openProduct(MENU.find(m => m.id === 1));
});

function quickAddToCart(item) {
  addToCart(item, 'grande', 1);
  showToast(`✓ ${item.name} added!`);
  updateCartBadge();
}

/* ═══════════════════════════════════════
   PRODUCT PAGE
═══════════════════════════════════════ */
function openProduct(item) {
  selectedItem = item;
  selectedSize = 'grande';
  selectedQty  = 1;

  document.getElementById('productPageTitle').textContent = item.type;
  document.getElementById('productCatTag').textContent    = '☕ ' + item.type;
  document.getElementById('productName').textContent      = item.name;
  document.getElementById('productDesc').textContent      = item.desc;
  document.getElementById('pdQty').textContent            = 1;

  // Render drink SVG in hero
  document.getElementById('productDrinkSvg').innerHTML = getDrinkSVG(item);

  resetSizeSelection();
  updateProductTotal();
  showPage('pg-product');
}

function getDrinkSVG(item) {
  const colors = {
    frap:  ['#6b3a2a','#c8860a','#f5f0e0'],
    latte: ['#4a2c1a','#8b5a3a','#d4a070'],
    cold:  ['#1a2a4a','#2a4a7a','#4a7ab8'],
    tea:   ['#2a4a1a','#4a8a2a','#8ab84a'],
    food:  ['#5a3a1a','#8a6a3a','#c8a870'],
  };
  const c = colors[item.cat] || colors['latte'];
  return `<svg viewBox="0 0 110 200" width="155" height="210">
    <path d="M18 52 L92 52 L83 172 L27 172 Z" fill="${c[0]}" rx="4"/>
    <path d="M20 65 L90 65 L82 167 L28 167 Z" fill="${c[1]}"/>
    <path d="M24 80 L86 80 L80 162 L30 162 Z" fill="${c[1]}" opacity="0.5"/>
    <ellipse cx="55" cy="55" rx="38" ry="15" fill="#f5f0e0"/>
    <path d="M17 55 Q28 40 42 50 Q52 41 55 49 Q58 40 68 49 Q80 40 93 55" fill="#fffaf0"/>
    <path d="M22 50 Q34 37 46 47 Q54 39 58 47 Q66 37 80 48 Q88 42 91 53" stroke="#8b4513" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>
    <rect x="14" y="47" width="82" height="8" rx="4" fill="${c[0]}" opacity="0.8"/>
    <rect x="68" y="8" width="6" height="56" rx="3" fill="#e8c547" opacity="0.9"/>
    <rect x="68" y="8" width="3" height="56" rx="1.5" fill="#f5d060" opacity="0.5"/>
  </svg>`;
}

/* Size selection */
document.getElementById('sizeRow').addEventListener('click', e => {
  const pill = e.target.closest('.size-pill');
  if (!pill) return;
  document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  selectedSize = pill.dataset.size;
  updateProductTotal();
});

function resetSizeSelection() {
  document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
  document.querySelector('.size-pill[data-size="grande"]').classList.add('active');
}

/* Customise chips */
document.getElementById('customChips').addEventListener('click', e => {
  const chip = e.target.closest('.c-chip');
  if (chip) chip.classList.toggle('active');
});

/* Qty */
document.getElementById('pdMinus').addEventListener('click', () => {
  if (selectedQty > 1) { selectedQty--; document.getElementById('pdQty').textContent = selectedQty; updateProductTotal(); }
});
document.getElementById('pdPlus').addEventListener('click', () => {
  selectedQty++;
  document.getElementById('pdQty').textContent = selectedQty;
  updateProductTotal();
});

function updateProductTotal() {
  if (!selectedItem) return;
  const price = selectedItem.basePrice + SIZE_EXTRAS[selectedSize];
  document.getElementById('pdTotal').textContent = '₹' + (price * selectedQty);
}

/* Add to cart from product page */
document.getElementById('pdAddCart').addEventListener('click', () => {
  if (!selectedItem) return;
  addToCart(selectedItem, selectedSize, selectedQty);
  showToast(`✓ ${selectedQty}× ${selectedItem.name} added to cart!`);
  updateCartBadge();
  showPage('pg-cart');
  renderCart();
});

/* Favourite */
let faved = false;
document.getElementById('productFav').addEventListener('click', () => {
  faved = !faved;
  const icon = document.getElementById('favIcon');
  icon.style.fill   = faved ? '#e74c3c' : 'none';
  icon.style.stroke = faved ? '#e74c3c' : 'white';
  showToast(faved ? '❤️ Added to favourites' : '🤍 Removed from favourites');
});

/* Back */
document.getElementById('productBack').addEventListener('click', () => showPage('pg-home'));

/* ═══════════════════════════════════════
   CART
═══════════════════════════════════════ */
function addToCart(item, size, qty) {
  const key = item.id + '-' + size;
  const existing = cart.find(c => c.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ key, item, size, qty, price: item.basePrice + SIZE_EXTRAS[size] });
  }
  updateCartBadge();
}

function renderCart() {
  const list = document.getElementById('cartList');
  const empty = document.getElementById('cartEmpty');
  const promo = document.getElementById('promoRow');
  const summary = document.getElementById('orderSummary');

  list.innerHTML = '';

  if (cart.length === 0) {
    empty.classList.remove('hidden');
    promo.classList.add('hidden');
    summary.classList.add('hidden');
    document.getElementById('goCheckoutBtn').disabled = true;
    document.getElementById('goCheckoutBtn').style.opacity = '0.4';
    return;
  }

  empty.classList.add('hidden');
  promo.classList.remove('hidden');
  summary.classList.remove('hidden');
  document.getElementById('goCheckoutBtn').disabled = false;
  document.getElementById('goCheckoutBtn').style.opacity = '1';

  cart.forEach((c, idx) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.style.animationDelay = (idx * 0.07) + 's';
    div.innerHTML = `
      <div class="ci-icon">${c.item.icon}</div>
      <div class="ci-info">
        <div class="ci-name">${c.item.name}</div>
        <div class="ci-size">${capitalize(c.size)} · ${c.item.type}</div>
        <div class="ci-qty-row">
          <button class="ci-qty-btn" data-action="minus" data-key="${c.key}">−</button>
          <span class="ci-qty-num">${c.qty}</span>
          <button class="ci-qty-btn" data-action="plus" data-key="${c.key}">+</button>
        </div>
      </div>
      <div class="ci-price">₹${c.price * c.qty}</div>
      <button class="ci-remove" data-key="${c.key}">×</button>`;
    list.appendChild(div);
  });

  // Qty controls
  list.querySelectorAll('.ci-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const item = cart.find(c => c.key === key);
      if (!item) return;
      if (btn.dataset.action === 'plus') { item.qty++; }
      else { item.qty--; if (item.qty <= 0) { cart = cart.filter(c => c.key !== key); } }
      updateCartBadge();
      renderCart();
    });
  });

  // Remove buttons
  list.querySelectorAll('.ci-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart = cart.filter(c => c.key !== btn.dataset.key);
      updateCartBadge();
      renderCart();
    });
  });

  updateCartSummary();
}

function updateCartSummary() {
  const subtotal  = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const delivery  = 49;
  const discount  = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const tax       = Math.round((subtotal - discount) * 0.05);
  const total     = subtotal + delivery - discount + tax;

  document.getElementById('sumSubtotal').textContent = '₹' + subtotal;
  document.getElementById('sumDelivery').textContent = '₹' + delivery;
  document.getElementById('sumTax').textContent      = '₹' + tax;
  document.getElementById('sumTotal').textContent    = '₹' + total;

  const discRow = document.getElementById('discountRow');
  if (promoApplied) {
    discRow.classList.remove('hidden');
    document.getElementById('sumDiscount').textContent = '-₹' + discount;
  } else {
    discRow.classList.add('hidden');
  }
}

document.getElementById('cartBack').addEventListener('click', () => showPage('pg-home'));

document.getElementById('clearCartBtn').addEventListener('click', () => {
  if (cart.length === 0) return;
  cart = [];
  promoApplied = false;
  updateCartBadge();
  renderCart();
  showToast('🗑 Cart cleared');
});

document.getElementById('cartShopBtn').addEventListener('click', () => showPage('pg-home'));

/* PROMO */
document.getElementById('promoApply').addEventListener('click', () => {
  const code = document.getElementById('promoInput').value.trim().toUpperCase();
  if (promoApplied) { showToast('Promo already applied!'); return; }
  if (code === 'SBUX10' || code === 'FIRST10' || code === 'SAVE10') {
    promoApplied = true;
    showToast('🎉 Promo applied! 10% off');
    updateCartSummary();
  } else {
    showToast('❌ Invalid promo code');
  }
});

/* GO TO CHECKOUT */
document.getElementById('goCheckoutBtn').addEventListener('click', () => {
  buildCheckoutPage();
  showPage('pg-checkout');
});

/* ═══════════════════════════════════════
   CHECKOUT
═══════════════════════════════════════ */
function buildCheckoutPage() {
  // Mini order list
  const miniList = document.getElementById('miniOrderList');
  miniList.innerHTML = '';
  cart.forEach(c => {
    const d = document.createElement('div');
    d.className = 'mini-item';
    d.innerHTML = `
      <div>
        <div class="mini-item-name">${c.item.icon} ${c.item.name} ×${c.qty}</div>
        <div class="mini-item-size">${capitalize(c.size)}</div>
      </div>
      <div class="mini-item-price">₹${c.price * c.qty}</div>`;
    miniList.appendChild(d);
  });

  // Update totals
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = selectedMethod === 'pickup' ? 0 : 49;
  const tax      = Math.round((subtotal - discount) * 0.05);
  const total    = subtotal + delivery - discount + tax;

  document.getElementById('ct-sub').textContent      = '₹' + subtotal;
  document.getElementById('ct-delivery').textContent = delivery === 0 ? 'Free' : '₹' + delivery;
  document.getElementById('ct-tax').textContent      = '₹' + tax;
  document.getElementById('ct-total').textContent    = '₹' + total;
  document.getElementById('payBtnAmt').textContent   = '₹' + total;
}

/* Order type */
document.querySelectorAll('.order-type').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-type').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildCheckoutPage();
  });
});

/* Time chips */
document.querySelectorAll('.time-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

/* Payment methods */
document.getElementById('paymentMethods').addEventListener('click', e => {
  const method = e.target.closest('.pay-method');
  if (!method) return;
  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
  method.classList.add('active');
  selectedMethod = method.dataset.method;
});

document.getElementById('checkoutBack').addEventListener('click', () => { showPage('pg-cart'); renderCart(); });

document.getElementById('goPayBtn').addEventListener('click', () => {
  buildPaymentPage();
  showPage('pg-payment');
});

/* ═══════════════════════════════════════
   PAYMENT PAGE
═══════════════════════════════════════ */
function buildPaymentPage() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = 49;
  const tax      = Math.round((subtotal - discount) * 0.05);
  const total    = subtotal + delivery - discount + tax;
  const fmt      = '₹' + total;

  // Show correct section
  document.getElementById('upiSection').classList.add('hidden');
  document.getElementById('cardSection').classList.add('hidden');
  document.getElementById('sbuxSection').classList.add('hidden');
  document.getElementById('codSection').classList.add('hidden');

  document.getElementById('upiPayAmt').textContent  = fmt;
  document.getElementById('cardPayAmt').textContent = fmt;
  document.getElementById('sbuxPayAmt').textContent = fmt;
  document.getElementById('codPayAmt').textContent  = fmt;

  const sectionMap = { upi:'upiSection', card:'cardSection', sbux:'sbuxSection', cod:'codSection' };
  document.getElementById(sectionMap[selectedMethod] || 'upiSection').classList.remove('hidden');
}

/* UPI quick pay */
['upiGpay','upiPhone','upiPaytm','upiOther'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    document.querySelectorAll('.upi-app').forEach(a => a.style.borderColor = '');
    document.getElementById(id).style.borderColor = 'var(--accent)';
    document.getElementById('upiId').value = id === 'upiGpay' ? 'molu@okaxis' : id === 'upiPhone' ? 'molu@ybl' : id === 'upiPaytm' ? 'molu@paytm' : '';
  });
});

/* Card live preview */
document.getElementById('cardNumber').addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g,'').substring(0,16);
  v = v.replace(/(.{4})/g,'$1 ').trim();
  e.target.value = v;
  document.getElementById('cardNumDisplay').textContent = v || '•••• •••• •••• ••••';
});
document.getElementById('cardHolder').addEventListener('input', e => {
  document.getElementById('cardHolderDisplay').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
});
document.getElementById('cardExp').addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g,'');
  if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2,4);
  e.target.value = v;
  document.getElementById('cardExpDisplay').textContent = v || 'MM/YY';
});

document.getElementById('paymentBack').addEventListener('click', () => showPage('pg-checkout'));

/* CONFIRM PAY */
document.getElementById('confirmPayBtn').addEventListener('click', () => {
  let valid = true;
  let msg   = '';

  if (selectedMethod === 'upi') {
    const id = document.getElementById('upiId').value.trim();
    if (!id.includes('@')) { valid = false; msg = '⚠️ Enter a valid UPI ID'; }
  } else if (selectedMethod === 'card') {
    const num = document.getElementById('cardNumber').value.replace(/\s/g,'');
    const exp = document.getElementById('cardExp').value;
    const cvv = document.getElementById('cardCvv').value;
    if (num.length < 16) { valid = false; msg = '⚠️ Enter valid card number'; }
    else if (exp.length < 5) { valid = false; msg = '⚠️ Enter valid expiry date'; }
    else if (cvv.length < 3) { valid = false; msg = '⚠️ Enter valid CVV'; }
  }

  if (!valid) { showToast(msg); return; }

  showLoading('Processing payment…');
  setTimeout(() => {
    hideLoading();
    completeOrder();
  }, 2200);
});

/* ═══════════════════════════════════════
   ORDER SUCCESS
═══════════════════════════════════════ */
function completeOrder() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = 49;
  const tax      = Math.round((subtotal - discount) * 0.05);
  const total    = subtotal + delivery - discount + tax;

  currentOrderId = '#SB' + Math.floor(10000 + Math.random() * 89999);
  document.getElementById('orderId').textContent  = currentOrderId;
  document.getElementById('amtPaid').textContent  = '₹' + total;

  cart = [];
  promoApplied = false;
  updateCartBadge();

  showPage('pg-success');
  showToast('🎉 Order placed successfully!');
}

document.getElementById('backToHomeBtn').addEventListener('click', () => {
  buildMenu();
  showPage('pg-home');
});

/* ═══════════════════════════════════════
   BOTTOM NAV
═══════════════════════════════════════ */
document.getElementById('bottomNav').addEventListener('click', e => {
  const item = e.target.closest('.bnav-item');
  if (!item) return;
  const targetPage = item.dataset.page;

  if (item.classList.contains('cart-nav-item')) {
    renderCart();
    showPage('pg-cart');
  } else {
    buildMenu();
    showPage(targetPage);
  }
});

/* ═══════════════════════════════════════
   UTIL
═══════════════════════════════════════ */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ── INIT ── */
buildMenu();
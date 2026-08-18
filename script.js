const PRODUCTS = [
  // ---- Nike ----
  { id: "nk-01", brand: "Nike", name: "Air Max Pulse", price: 5490, tag: "Running", color: "#F5F0E6", accent: "#111318" },
  { id: "nk-02", brand: "Nike", name: "Air Force 1 '07", price: 4290, tag: "Lifestyle", color: "#FFFFFF", accent: "#1D3557" },
  { id: "nk-03", brand: "Nike", name: "Pegasus Trail 4", price: 4990, tag: "Trail", color: "#E9E1D3", accent: "#6B4F2A" },
  { id: "nk-04", brand: "Nike", name: "Dunk Low Retro", price: 3990, tag: "Lifestyle", color: "#F1E6D8", accent: "#2E7D32" },
 
  // ---- Adidas ----
  { id: "ad-01", brand: "Adidas", name: "Ultraboost Light", price: 5990, tag: "Running", color: "#111318", accent: "#FFFFFF" },
  { id: "ad-02", brand: "Adidas", name: "Samba OG", price: 3290, tag: "Lifestyle", color: "#F5F0E6", accent: "#0B3D2E" },
  { id: "ad-03", brand: "Adidas", name: "Gazelle Indoor", price: 3490, tag: "Lifestyle", color: "#C9A0A0", accent: "#3B1F1F" },
  { id: "ad-04", brand: "Adidas", name: "Forum Low", price: 3790, tag: "Lifestyle", color: "#FFFFFF", accent: "#1D3557" },
 
  // ---- Puma ----
  { id: "pm-01", brand: "Puma", name: "Suede Classic XXI", price: 2390, tag: "Lifestyle", color: "#7A1F2B", accent: "#F5F0E6" },
  { id: "pm-02", brand: "Puma", name: "RS-X Efekt", price: 3990, tag: "Running", color: "#F1E6D8", accent: "#FF5A1F" },
  { id: "pm-03", brand: "Puma", name: "Palermo Leather", price: 2990, tag: "Lifestyle", color: "#E9E1D3", accent: "#111318" },
  { id: "pm-04", brand: "Puma", name: "Speedcat OG", price: 3190, tag: "Motorsport", color: "#111318", accent: "#FF5A1F" },
 
  // ---- Converse ----
  { id: "cv-01", brand: "Converse", name: "Chuck Taylor All Star", price: 1990, tag: "Classic", color: "#111318", accent: "#FFFFFF" },
  { id: "cv-02", brand: "Converse", name: "Chuck 70 Hi", price: 2690, tag: "Classic", color: "#1D3557", accent: "#F5F0E6" },
  { id: "cv-03", brand: "Converse", name: "Run Star Hike", price: 3390, tag: "Lifestyle", color: "#F5F0E6", accent: "#111318" },
  { id: "cv-04", brand: "Converse", name: "One Star Pro", price: 2890, tag: "Skate", color: "#7A1F2B", accent: "#F5F0E6" },
];
 
const CART_KEY = "sneakhub_cart";
const DISCOUNT_THRESHOLD = 3000; // เงื่อนไข if-else ของส่วนลด
const DISCOUNT_RATE = 0.10;
 
/* -------------------------------------------------------------------------
   2) CART STORAGE (localStorage)
   ตะกร้าเก็บเป็น array ของ { id, qty } ใน localStorage คีย์ "sneakhub_cart"
   เก็บแค่ id + qty (ไม่เก็บข้อมูลสินค้าทั้งหมดซ้ำ) แล้วค่อย join กับ PRODUCTS ตอนแสดงผล
------------------------------------------------------------------------- */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("อ่านตะกร้าจาก localStorage ไม่สำเร็จ:", e);
    return [];
  }
}
 
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
 
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
 
  // if-else ธรรมดา: ถ้ามีสินค้านี้อยู่แล้วให้เพิ่มจำนวน ถ้าไม่มีให้ push ใหม่
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
}
 
function updateQty(productId, newQty) {
  let cart = getCart();
  if (newQty <= 0) {
    // ลบสินค้าออกถ้าจำนวนเหลือ 0 หรือน้อยกว่า
    cart = cart.filter((item) => item.id !== productId);
  } else {
    const item = cart.find((i) => i.id === productId);
    if (item) item.qty = newQty;
  }
  saveCart(cart);
  renderCartPage();
}
 
function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}
 
// จำนวนสินค้าทั้งหมดในตะกร้า (รวมจำนวนชิ้น) — ใช้ reduce()
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
 
// อัปเดตตัวเลขบน badge ตะกร้า ทุกหน้า (ถ้ามี element #cart-count)
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = getCartCount();
}
 
/* -------------------------------------------------------------------------
   3) คำนวณยอดตะกร้า: subtotal, discount, total
   ใช้ if-else ตามข้อกำหนด: subtotal >= 3000 บาท => ลด 10%
------------------------------------------------------------------------- */
function calculateCartTotals(cartLines) {
  // cartLines คือ array ของ { product, qty }
  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
 
  let discount = 0;
  // ----- if-else เงื่อนไขส่วนลด (ข้อกำหนดข้อ 11) -----
  if (subtotal >= DISCOUNT_THRESHOLD) {
    discount = subtotal * DISCOUNT_RATE;
  } else {
    discount = 0;
  }
 
  const total = subtotal - discount;
  return { subtotal, discount, total };
}
 
/* -------------------------------------------------------------------------
   4) HELPER: ไอคอนรองเท้าแบบ SVG inline (ไม่พึ่งอินเทอร์เน็ต/ไฟล์ภายนอก)
   ใช้สีของแต่ละสินค้าจาก product.color / product.accent
------------------------------------------------------------------------- */
function shoeSVG(product) {
  return `
  <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${product.name}">
    <rect width="200" height="140" fill="${product.color}"/>
    <g transform="translate(20,55)">
      <path d="M0 40 C 10 10, 40 -5, 70 5 L 130 20 C 150 24, 160 34, 160 46 L 160 55 L 0 55 Z"
            fill="${product.accent}" opacity="0.92"/>
      <path d="M20 40 C 35 20, 55 12, 80 16 L 120 24" stroke="${product.color}" stroke-width="4" fill="none" opacity="0.6"/>
      <circle cx="140" cy="46" r="5" fill="${product.color}"/>
    </g>
  </svg>`;
}
 
/* -------------------------------------------------------------------------
   5) RENDER: Featured products (index.html)
------------------------------------------------------------------------- */
function renderFeatured() {
  const el = document.getElementById("featured-grid");
  if (!el) return;
 
  // สุ่มเลือกตัวแทนแบรนด์ละ 1 คู่ (ใช้ .find เพื่อความง่าย)
  const brands = ["Nike", "Adidas", "Puma", "Converse"];
  const featured = brands.map((b) => PRODUCTS.find((p) => p.brand === b));
 
  el.innerHTML = featured.map((p) => productCardHTML(p)).join("");
  attachAddToCartHandlers(el);
}
 
/* -------------------------------------------------------------------------
   6) RENDER: Product card (ใช้ร่วมกันในหน้า Home และ Products)
------------------------------------------------------------------------- */
function productCardHTML(p) {
  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-thumb">${shoeSVG(p)}</div>
      <div class="product-body">
        <div class="product-brandrow">
          <span class="chip">${p.brand}</span>
          <span class="chip chip-ghost">${p.tag}</span>
        </div>
        <h3 class="product-name">${p.name}</h3>
        <div class="spec-label">
          <span>SKU ${p.id.toUpperCase()}</span>
          <span class="dash-line"></span>
          <span>TH SIZE 39–45</span>
        </div>
        <div class="product-footer">
          <span class="product-price">฿${p.price.toLocaleString("th-TH")}</span>
          <button class="btn btn-small btn-add" data-id="${p.id}">+ ตะกร้า</button>
        </div>
      </div>
    </article>`;
}
 
function attachAddToCartHandlers(scopeEl) {
  scopeEl.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id, 1);
      btn.textContent = "เพิ่มแล้ว ✓";
      btn.classList.add("btn-added");
      setTimeout(() => {
        btn.textContent = "+ ตะกร้า";
        btn.classList.remove("btn-added");
      }, 900);
    });
  });
}
 
/* =========================================================================
   7) PRODUCTS PAGE — Search + Filter ด้วย Set Theory และ Boolean Logic
   ========================================================================= */
 
// เซตของแบรนด์ทั้งหมดในระบบ (Universal Set ของแบรนด์)
const ALL_BRANDS_SET = new Set(PRODUCTS.map((p) => p.brand));
 
// สถานะของตัวกรอง ณ ขณะนั้น
let selectedBrandSet = new Set(ALL_BRANDS_SET); // เริ่มต้น = เลือกทุกแบรนด์ (เท่ากับ Universal Set)
let priceRange = { min: 0, max: 999999 };
let searchTerm = "";
 
function initProductsPage() {
  const grid = document.getElementById("products-grid");
  if (!grid) return; // ไม่ใช่หน้า products.html ก็ไม่ต้องทำอะไร
 
  renderBrandFilters();
  renderProducts();
 
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderProducts();
  });
 
  const minInput = document.getElementById("price-min");
  const maxInput = document.getElementById("price-max");
  [minInput, maxInput].forEach((input) => {
    input.addEventListener("input", () => {
      priceRange.min = Number(minInput.value) || 0;
      priceRange.max = Number(maxInput.value) || 999999;
      renderProducts();
    });
  });
 
  document.getElementById("reset-filters").addEventListener("click", () => {
    selectedBrandSet = new Set(ALL_BRANDS_SET);
    priceRange = { min: 0, max: 999999 };
    searchTerm = "";
    searchInput.value = "";
    minInput.value = "";
    maxInput.value = "";
    renderBrandFilters();
    renderProducts();
  });
}
 
function renderBrandFilters() {
  const wrap = document.getElementById("brand-filters");
  if (!wrap) return;
 
  wrap.innerHTML = [...ALL_BRANDS_SET]
    .map(
      (brand) => `
      <label class="checkbox-pill">
        <input type="checkbox" value="${brand}" ${selectedBrandSet.has(brand) ? "checked" : ""} />
        <span>${brand}</span>
      </label>`
    )
    .join("");
 
  wrap.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const brand = e.target.value;
      // ----- Set Operations: เพิ่ม/ลบสมาชิกออกจากเซตที่เลือก -----
      if (e.target.checked) {
        selectedBrandSet.add(brand); // Union: เพิ่มสมาชิกเข้าเซต
      } else {
        selectedBrandSet.delete(brand); // Difference: ตัดสมาชิกออกจากเซต
      }
      renderProducts();
    });
  });
}
 
/**
 * filterProducts()
 * สาธิตการใช้ Set Theory + Boolean Logic ร่วมกันตามข้อกำหนดข้อ 9-10:
 *   - brandMatch  : สินค้าต้องเป็นสมาชิกของ selectedBrandSet  -> selectedBrandSet.has(p.brand)
 *                   นี่คือการทำ "Intersection" ระหว่างเซตสินค้าทั้งหมด กับเซตแบรนด์ที่ผู้ใช้เลือก
 *   - priceMatch  : ราคาต้องอยู่ในช่วง [min, max]             -> Boolean AND ของสองเงื่อนไข
 *   - searchMatch : ชื่อสินค้าต้องมีคำค้นหา (หรือไม่ได้พิมพ์ค้นหาเลย) -> Boolean OR / NOT
 * แล้วรวมทั้งหมดด้วย AND (&&) เพื่อให้สินค้าที่ผ่านต้องจริง "ทุกเงื่อนไข"
 */
function filterProducts() {
  return PRODUCTS.filter((p) => {
    // 1) Set membership -> เทียบเท่า Intersection ระหว่าง {สินค้าทั้งหมด} กับ {แบรนด์ที่เลือก}
    const brandMatch = selectedBrandSet.has(p.brand);
 
    // 2) Boolean AND ของขอบเขตราคาบน-ล่าง
    const priceMatch = p.price >= priceRange.min && p.price <= priceRange.max;
 
    // 3) Boolean: ถ้า "ไม่มี" คำค้นหา (NOT searchTerm) ให้ผ่านอัตโนมัติ
    //    หรือ (OR) ชื่อสินค้า .includes() คำค้นหา
    const searchMatch = !searchTerm || p.name.toLowerCase().includes(searchTerm);
 
    // เงื่อนไขสุดท้าย: ต้องผ่านทุกข้อ (AND) — if-else แบบย่อ ก็คือนิพจน์ boolean นี้เอง
    return brandMatch && priceMatch && searchMatch;
  });
}
 
function renderProducts() {
  const grid = document.getElementById("products-grid");
  const result = filterProducts();
 
  const countEl = document.getElementById("results-count");
  if (countEl) countEl.textContent = `พบ ${result.length} รายการ`;
 
  if (result.length === 0) {
    grid.innerHTML = `<p class="empty-state">ไม่พบสินค้าที่ตรงกับตัวกรอง ลองปรับแบรนด์หรือช่วงราคาดูใหม่</p>`;
    return;
  }
 
  grid.innerHTML = result.map((p) => productCardHTML(p)).join("");
  attachAddToCartHandlers(grid);
}
 
/* =========================================================================
   8) CART PAGE
   ========================================================================= */
function renderCartPage() {
  const list = document.getElementById("cart-list");
  if (!list) return; // ไม่ใช่หน้า cart.html
 
  const cart = getCart();
 
  // join ข้อมูลตะกร้า (id, qty) เข้ากับข้อมูลสินค้าจริงใน PRODUCTS
  const cartLines = cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      return product ? { product, qty: item.qty } : null;
    })
    .filter((line) => line !== null); // NOT null -> กันสินค้าที่ถูกลบออกจากระบบ
 
  if (cartLines.length === 0) {
    list.innerHTML = `<p class="empty-state">ตะกร้าของคุณว่างเปล่า — <a href="products.html">ไปเลือกซื้อสินค้า</a></p>`;
    document.getElementById("cart-summary").classList.add("hidden");
    return;
  }
 
  document.getElementById("cart-summary").classList.remove("hidden");
 
  list.innerHTML = cartLines
    .map(
      (line) => `
    <div class="cart-row" data-id="${line.product.id}">
      <div class="cart-thumb">${shoeSVG(line.product)}</div>
      <div class="cart-info">
        <span class="chip">${line.product.brand}</span>
        <h4>${line.product.name}</h4>
        <span class="spec-label"><span>SKU ${line.product.id.toUpperCase()}</span></span>
      </div>
      <div class="qty-control">
        <button class="qty-btn" data-action="dec" aria-label="ลดจำนวน">−</button>
        <span class="qty-value">${line.qty}</span>
        <button class="qty-btn" data-action="inc" aria-label="เพิ่มจำนวน">+</button>
      </div>
      <div class="cart-line-price">฿${(line.product.price * line.qty).toLocaleString("th-TH")}</div>
      <button class="remove-btn" data-action="remove" aria-label="ลบสินค้า">✕</button>
    </div>`
    )
    .join("");
 
  // ปุ่มเพิ่ม/ลด/ลบ
  list.querySelectorAll(".cart-row").forEach((row) => {
    const id = row.dataset.id;
    const currentLine = cartLines.find((l) => l.product.id === id);
 
    row.querySelector('[data-action="inc"]').addEventListener("click", () => {
      updateQty(id, currentLine.qty + 1);
    });
    row.querySelector('[data-action="dec"]').addEventListener("click", () => {
      updateQty(id, currentLine.qty - 1);
    });
    row.querySelector('[data-action="remove"]').addEventListener("click", () => {
      removeFromCart(id);
    });
  });
 
  // คำนวณสรุปยอด
  const { subtotal, discount, total } = calculateCartTotals(cartLines);
 
  document.getElementById("cart-subtotal").textContent = `฿${subtotal.toLocaleString("th-TH")}`;
  document.getElementById("cart-discount").textContent =
    discount > 0 ? `−฿${discount.toLocaleString("th-TH")}` : "฿0";
  document.getElementById("cart-total").textContent = `฿${total.toLocaleString("th-TH")}`;
 
  // ----- if-else: ข้อความแจ้งเตือนส่วนลด -----
  const noteEl = document.getElementById("discount-note");
  if (subtotal >= DISCOUNT_THRESHOLD) {
    noteEl.textContent = `🎉 คุณได้รับส่วนลด 10% เพราะยอดสั่งซื้อถึง ฿${DISCOUNT_THRESHOLD.toLocaleString("th-TH")}`;
    noteEl.className = "discount-note discount-active";
  } else {
    const remaining = DISCOUNT_THRESHOLD - subtotal;
    noteEl.textContent = `ซื้อเพิ่มอีก ฿${remaining.toLocaleString("th-TH")} เพื่อรับส่วนลด 10%`;
    noteEl.className = "discount-note";
  }
 
  // แสดงจำนวนแบรนด์ที่ไม่ซ้ำกันในตะกร้า โดยใช้ Set
  const uniqueBrandsInCart = new Set(cartLines.map((l) => l.product.brand));
  const brandsEl = document.getElementById("cart-brand-summary");
  if (brandsEl) {
    brandsEl.textContent = `แบรนด์ในตะกร้า: ${[...uniqueBrandsInCart].join(", ")}`;
  }
}
 
/* -------------------------------------------------------------------------
   9) INIT — ทำงานเมื่อโหลดหน้าเสร็จ (ทุกหน้า)
------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderFeatured();      // ทำงานเฉพาะเมื่อมี #featured-grid (index.html)
  initProductsPage();    // ทำงานเฉพาะเมื่อมี #products-grid (products.html)
  renderCartPage();      // ทำงานเฉพาะเมื่อมี #cart-list (cart.html)
 
  // ปุ่ม mobile nav toggle (ใช้ร่วมกันทุกหน้า ถ้ามี)
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => nav.classList.toggle("open"));
  }
});
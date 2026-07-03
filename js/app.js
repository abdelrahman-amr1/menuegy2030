// Multi-Tenant SaaS Storefront Application Logic - MenuEgy 2030

let products = [];
let cart = [];
let currentCategory = "all";
let searchQuery = "";
let allShops = []; // Stores platform shops in directory view

// Active tenant states
let activeShopSlug = "";
let activeShopName = "متجر إلكتروني";
let activeShopWhatsapp = "";
let activeFreeShippingLimit = 1000;
const DEFAULT_SHIPPING_COST = 50;

// Category Names mapping
const CATEGORY_NAMES = {
  all: "الكل",
  spices: "التوابل والبهارات",
  drinks: "المشروبات الطبيعية",
  herbs: "الأعشاب الطبيعية",
  oils: "الزيوت الخام",
  incense: "البخور المشكل",
  famous: "الأشهر في أسوان"
};

// Category Icons mapping
const CATEGORY_ICONS = {
  spices: "🌱",
  drinks: "☕",
  herbs: "🌿",
  oils: "🧴",
  incense: "💨",
  famous: "✨"
};

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  // Read slug parameter if present in URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlSlug = urlParams.get("s") || urlParams.get("shop");
  
  if (urlSlug) {
    activeShopSlug = urlSlug.toLowerCase().trim();
    await initTenantStorefront(activeShopSlug);
  } else {
    await initPlatformDirectory();
  }
});

// ----------------------------------------------------
// 1. Platform Directory Routing Flow
// ----------------------------------------------------
async function initPlatformDirectory() {
  document.getElementById("platformDirectory").style.display = "block";
  document.getElementById("storefrontApp").style.display = "none";
  
  allShops = await getAllShops();
  renderDirectoryShops();
}

function renderDirectoryShops() {
  const grid = document.getElementById("directoryShopsGrid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  const searchVal = document.getElementById("directorySearchInput").value.trim().toLowerCase();
  const filteredShops = allShops.filter(s => 
    s.name.toLowerCase().includes(searchVal) || 
    (s.slogan && s.slogan.toLowerCase().includes(searchVal)) ||
    s.id.toLowerCase().includes(searchVal)
  );

  if (filteredShops.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #c9ad93;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 30px; margin-bottom: 10px;"></i>
        <p>لا توجد متاجر مطابقة لبحثك حالياً.</p>
      </div>
    `;
    return;
  }

  filteredShops.forEach(shop => {
    const card = document.createElement("a");
    card.className = "dir-shop-card";
    card.href = `?s=${shop.id}`;
    
    const logoHtml = shop.logo_url 
      ? `<img src="${shop.logo_url}" class="dir-shop-logo" alt="logo" onerror="this.src=''; this.innerHTML='<i class=fa-solid fa-shop></i>'">`
      : `<div class="dir-shop-logo"><i class="fa-solid fa-shop"></i></div>`;

    card.innerHTML = `
      ${logoHtml}
      <h3>${shop.name}</h3>
      <p>${shop.slogan || "اضغط لتصفح هذا المتجر والتسوق منه"}</p>
    `;
    grid.appendChild(card);
  });
}

function filterDirectoryShops() {
  renderDirectoryShops();
}

// ----------------------------------------------------
// 2. Tenant Storefront Flow
// ----------------------------------------------------
async function initTenantStorefront(slug) {
  // Fetch tenant info
  const shop = await getShopProfile(slug);
  
  if (!shop) {
    // Redirect back to platform directory if shop is invalid
    showToast("عذراً، هذا المتجر غير مسجل بالمنصة!", "danger");
    setTimeout(() => {
      window.location.href = window.location.pathname; // Reload without query params
    }, 2000);
    return;
  }

  // Check if the shop is deactivated by the admin
  if (shop.is_active === false || shop.is_active === 'false') {
    document.body.innerHTML = `
      <div style="background-color: #120e0c; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; font-family: 'Cairo', sans-serif; direction: rtl;">
        <i class="fa-solid fa-lock" style="font-size: 5rem; color: #d48a37; margin-bottom: 20px; animation: pulse 2s infinite;"></i>
        <h1 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; color: #fff;">هذا المتجر غير متاح حالياً</h1>
        <p style="color: #a0a0a0; font-size: 1.1rem; max-width: 500px; line-height: 1.6;">عذراً، تم إيقاف المتجر مؤقتاً بواسطة الإدارة أو صاحب المتجر. يرجى مراجعتنا لاحقاً أو التواصل معنا.</p>
        <a href="${window.location.pathname}" style="margin-top: 30px; background: #d48a37; color: white; text-decoration: none; padding: 10px 25px; border-radius: 8px; font-weight: bold; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(212,138,55,0.3);">تصفح المتاجر الأخرى</a>
      </div>
    `;
    return;
  }

  // Bind tenant info
  activeShopName = shop.name;
  activeShopWhatsapp = shop.whatsapp_number;
  activeFreeShippingLimit = shop.free_shipping_limit;

  // Apply custom design themes
  document.documentElement.style.setProperty('--primary-color', shop.primary_color);
  document.documentElement.style.setProperty('--secondary-color', shop.secondary_color);
  
  // Set title & header labels
  document.title = `${shop.name} | متجر إلكتروني أونلاين`;
  document.getElementById("storeTitle").textContent = shop.name;
  document.getElementById("storeSubtitle").textContent = shop.slogan || "متجر المنتجات الطبيعية والعطارة";
  document.getElementById("storeSloganBadge").textContent = shop.slogan ? `شعارنا: ${shop.slogan}` : "أهلاً بكم في متجرنا";
  document.getElementById("storeHeroHeading").innerHTML = `منتجات طبيعية مميزة ذات جودة <span>فريدة وقوية</span>`;
  document.getElementById("storeHeroDescription").textContent = `تصفح أرقى المجموعات المتاحة لدينا في متجر ${shop.name}. الجودة هي سر تميزنا ورضاكم غايتنا!`;
  
  document.getElementById("storeFreeShippingMsg").textContent = `لأي طلب بقيمة تتجاوز ${activeFreeShippingLimit} جنيه`;
  
  // Setup logo image
  const logoImg = document.getElementById("storeLogo");
  if (shop.logo_url) {
    logoImg.src = shop.logo_url;
    logoImg.style.display = "block";
  } else {
    logoImg.style.display = "none";
  }

  // Setup footer branding
  document.getElementById("footerStoreTitle").textContent = shop.name;
  document.getElementById("footerStoreSlogan").textContent = shop.slogan || "طعم وجودة يفوقان الوصف";
  document.getElementById("footerStoreSloganBadge").textContent = `"${shop.slogan || 'شعارنا رضاكم دائماً'}"`;
  
  // Setup footer contacts
  const cleanPhone = shop.whatsapp_number.replace(/[^0-9]/g, "");
  document.getElementById("footerPhoneCall").href = `tel:${cleanPhone}`;
  document.getElementById("footerPhoneText").textContent = `اتصل بنا: ${cleanPhone}`;
  document.getElementById("footerWhatsappChat").href = `https://wa.me/${cleanPhone}`;
  document.getElementById("footerWhatsappText").textContent = `واتساب: ${cleanPhone}`;

  // Toggle View layouts
  document.getElementById("platformDirectory").style.display = "none";
  document.getElementById("storefrontApp").style.display = "block";

  // Load products of this shop
  await loadStoreProducts();

  // Scope shopping cart storage to this tenant slug
  const savedCart = sessionStorage.getItem(`cart_${activeShopSlug}`);
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch(e) {
      cart = [];
    }
  }

  // Setup database triggers
  window.addEventListener("productsUpdated", async () => {
    await loadStoreProducts();
  });
}

// Helper to calculate cart subtotal with wholesale discounts
function getCartSubtotal() {
  return cart.reduce((sum, item) => {
    let itemTotal = item.product.price * item.quantity;
    const wholesaleQty = parseFloat(item.product.wholesale_qty);
    const wholesalePrice = parseFloat(item.product.wholesale_price);
    
    if (wholesaleQty > 0 && wholesalePrice > 0 && item.quantity >= wholesaleQty) {
      const bundles = Math.floor(item.quantity / wholesaleQty);
      const remainder = item.quantity % wholesaleQty;
      itemTotal = (bundles * wholesalePrice) + (remainder * item.product.price);
    }
    return sum + itemTotal;
  }, 0);
}

// Load products from Supabase scoped to activeShopSlug
async function loadStoreProducts() {
  products = await getShopProducts(activeShopSlug);
  buildDynamicCategoryTabs();
  renderProducts();
  renderFeaturedMarqueeBar();
}

// Render products to grid
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  // Filter products by search and category
  const filtered = products.filter(p => {
    const matchesCategory = currentCategory === "all" || p.category === currentCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="cart-empty-message" style="grid-column: 1 / -1; padding: 4rem 0;">
        <i class="fa-solid fa-box-open"></i>
        <h3>لا توجد منتجات متوفرة حالياً</h3>
        <p>قم باختيار قسم آخر أو ابحث بكلمات مختلفة</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(p => {
    const isAvailable = p.available !== false;
    const icon = CATEGORY_ICONS[p.category] || "📦";
    
    const card = document.createElement("div");
    card.className = `product-card ${!isAvailable ? 'out-of-stock' : ''}`;
    
    // Product Image display logic
    const imageContainerContent = p.image_url 
      ? `<img src="${p.image_url}" alt="${p.name}" class="product-grid-image" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.outerHTML='<span>${icon}</span>'">`
      : `<span>${icon}</span>`;

    const wholesaleQty = parseFloat(p.wholesale_qty);
    const wholesalePrice = parseFloat(p.wholesale_price);
    const hasWholesale = wholesaleQty > 0 && wholesalePrice > 0;
    const wholesaleBadgeHtml = hasWholesale 
      ? `<div class="wholesale-badge"><i class="fa-solid fa-tags"></i> عرض الجملة: ${p.wholesale_qty} ${p.unit} بـ ${p.wholesale_price} ج</div>`
      : ``;

    card.innerHTML = `
      <span class="product-category-badge">${CATEGORY_NAMES[p.category] || p.category}</span>
      <div class="product-image-container" onclick="openOfferDetails('${p.id}')" style="cursor: pointer;">
        ${imageContainerContent}
        ${!isAvailable ? '<div class="out-of-stock-overlay">غير متوفر حالياً</div>' : ''}
      </div>
      <div class="product-details">
        <h3 class="product-title" onclick="openOfferDetails('${p.id}')" style="cursor: pointer;">${p.name}</h3>
        <p class="product-desc" title="${p.description}">${p.description || "لا يوجد وصف لهذا المنتج حالياً."}</p>
        ${wholesaleBadgeHtml}
        <div class="product-meta">
          <div class="product-price-info">
            <span class="product-price">${p.price} ج</span>
            <span class="product-unit">لكل ${p.unit}</span>
          </div>
          ${isAvailable ? `
            <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">
              <i class="fa-solid fa-cart-plus"></i>
              <span>أضف للسلة</span>
            </button>
          ` : `
            <button class="add-to-cart-btn" disabled style="background: var(--gray-300); cursor: not-allowed;">
              <span>نفذ</span>
            </button>
          `}
        </div>
      </div>
    `;
    
    grid.appendChild(card);
  });
}

// Filter products based on search inputs
function filterProducts() {
  searchQuery = document.getElementById("searchInput").value.trim();
  renderProducts();
}

// Set category filter
function setCategory(category) {
  currentCategory = category;
  
  // Update Active Button Style
  const tabs = document.querySelectorAll(".category-tab");
  tabs.forEach(tab => {
    if (tab.getAttribute("data-category") === category) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
  
  renderProducts();
}

// Toggle Shopping Cart Drawer Open/Closed
function toggleCart(isOpen) {
  const overlay = document.getElementById("cartDrawerOverlay");
  const drawer = document.getElementById("cartDrawer");
  
  if (isOpen) {
    overlay.classList.add("open");
    drawer.classList.add("open");
  } else {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
  }
}

// Add Item to Cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.available === false) return;
  
  const cartItem = cart.find(item => item.product.id === productId);
  
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({
      product: product,
      quantity: 1
    });
  }
  
  saveCartAndRefresh();
  showToast(`تمت إضافة "${product.name}" إلى السلة!`);
}

// Change Quantity in Cart Drawer
function updateQty(productId, amount) {
  const cartItem = cart.find(item => item.product.id === productId);
  if (!cartItem) return;
  
  cartItem.quantity += amount;
  
  if (cartItem.quantity <= 0) {
    cart = cart.filter(item => item.product.id !== productId);
    showToast(`تم إزالة المنتج من السلة.`);
  }
  
  saveCartAndRefresh();
}

// Remove item directly
function removeFromCart(productId) {
  const cartItem = cart.find(item => item.product.id !== productId);
  const name = cartItem ? cartItem.product.name : "المنتج";
  cart = cart.filter(item => item.product.id !== productId);
  saveCartAndRefresh();
  showToast(`تم إزالة "${name}" من السلة.`);
}

// Save Cart to Session & Update Screen elements
function saveCartAndRefresh() {
  sessionStorage.setItem(`cart_${activeShopSlug}`, JSON.stringify(cart));
  updateCartUI();
}

// Update Cart Badge, list of items, totals, and progress bar
function updateCartUI() {
  // Update header cart count
  const cartCount = document.getElementById("cartCount");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  // Render Items List
  const itemsContainer = document.getElementById("cartItemsList");
  const checkoutSection = document.getElementById("cartCheckoutSection");
  
  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <i class="fa-solid fa-basket-shopping"></i>
        <h3>السلة فارغة حالياً</h3>
        <p>تصفح المنتجات في المتجر وأضف ما يعجبك لتجهيز الطلب</p>
      </div>
    `;
    checkoutSection.style.display = "none";
    
    // Hide mobile sticky bar
    document.getElementById("floatingCartBar").classList.remove("visible");
    
    // Update progress tracker
    updateShippingTracker(0);
    return;
  }
  
  checkoutSection.style.display = "block";
  itemsContainer.innerHTML = "";
  
  let subtotal = getCartSubtotal();
  
  cart.forEach(item => {
    let itemTotal = item.product.price * item.quantity;
    let wholesaleApplied = false;
    
    const wholesaleQty = parseFloat(item.product.wholesale_qty);
    const wholesalePrice = parseFloat(item.product.wholesale_price);
    
    if (wholesaleQty > 0 && wholesalePrice > 0 && item.quantity >= wholesaleQty) {
      const bundles = Math.floor(item.quantity / wholesaleQty);
      const remainder = item.quantity % wholesaleQty;
      itemTotal = (bundles * wholesalePrice) + (remainder * item.product.price);
      wholesaleApplied = true;
    }
    
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.product.name}</h4>
        <span class="cart-item-price">${item.product.price} ج × ${item.quantity} = <strong>${itemTotal} ج</strong></span>
        ${wholesaleApplied ? `
          <div class="cart-item-offer-applied">
            <i class="fa-solid fa-circle-check"></i> تم تطبيق عرض الجملة!
          </div>
        ` : ''}
      </div>
      <div class="cart-item-qty-control">
        <button onclick="updateQty('${item.product.id}', 1)">+</button>
        <span class="cart-item-qty-val">${item.quantity}</span>
        <button onclick="updateQty('${item.product.id}', -1)">-</button>
      </div>
      <button class="remove-cart-item-btn" onclick="removeFromCart('${item.product.id}')" title="حذف">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    itemsContainer.appendChild(div);
  });
  
  // Update Mobile Sticky Bar info
  document.getElementById("floatingCartBar").classList.add("visible");
  document.getElementById("floatingCartTotal").textContent = `${subtotal} ج`;
  document.getElementById("floatingCartCount").textContent = `${totalItems} منتج في السلة`;

  // Calculate totals
  document.getElementById("cartSubtotal").textContent = `${subtotal} ج`;
  
  // Update progress tracker
  updateShippingTracker(subtotal);
  
  // Recalculate shipping price
  calculateShippingPrice();
}

// Manage shipping price display
function calculateShippingPrice() {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const citySelect = document.getElementById("custCity");
  const shippingText = document.getElementById("cartShipping");
  const totalText = document.getElementById("cartTotal");
  
  if (subtotal === 0) return;
  
  if (!citySelect.value) {
    shippingText.textContent = "اختر المحافظة أولاً";
    totalText.textContent = `${subtotal} ج`;
    return;
  }
  
  let shippingCost = DEFAULT_SHIPPING_COST;
  let cityName = "أخرى";
  
  if (citySelect.value === "cairo") {
    cityName = "القاهرة";
    shippingCost = 60;
  } else if (citySelect.value === "giza") {
    cityName = "الجيزة";
    shippingCost = 80;
  } else {
    cityName = "محافظة أخرى";
    shippingCost = 100;
  }
  
  if (subtotal >= activeFreeShippingLimit) {
    shippingCost = 0;
    shippingText.innerHTML = `<span style="color: var(--success-color); font-weight: 700;">مجاني 🎉</span>`;
  } else {
    shippingText.textContent = `${shippingCost} ج (${cityName})`;
  }
  
  const finalTotal = subtotal + shippingCost;
  totalText.textContent = `${finalTotal} ج`;
}

// Update free shipping bar
function updateShippingTracker(subtotal) {
  const progress = document.getElementById("shippingTrackerProgress");
  const msg = document.getElementById("shippingTrackerMsg");
  const amount = document.getElementById("shippingTrackerAmount");
  
  if (subtotal === 0) {
    progress.style.width = "0%";
    msg.textContent = `أضف منتجات بقيمة ${activeFreeShippingLimit}ج للحصول على شحن مجاني`;
    amount.textContent = `${activeFreeShippingLimit} ج متبقية`;
    return;
  }
  
  const pct = Math.min((subtotal / activeFreeShippingLimit) * 100, 100);
  progress.style.width = `${pct}%`;
  
  if (subtotal >= activeFreeShippingLimit) {
    msg.innerHTML = `تهانينا! لقد حصلت على شحن مجاني <i class="fa-solid fa-gifts" style="color: var(--secondary-color);"></i>`;
    amount.textContent = "شحن مجاني";
  } else {
    const diff = activeFreeShippingLimit - subtotal;
    msg.textContent = "متبقي للشحن المجاني:";
    amount.textContent = `${diff} ج فقط`;
  }
}

// Handle Order Checkout to WhatsApp
function handleCheckout(event) {
  event.preventDefault();
  
  if (cart.length === 0) {
    showToast("سلتك فارغة، أضف منتجات أولاً لتجهيز الطلب", "danger");
    return;
  }
  
  const name = document.getElementById("custName").value.trim();
  const cityVal = document.getElementById("custCity").value;
  const address = document.getElementById("custAddress").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  
  if (!name || !cityVal || !address || !phone) {
    showToast("يرجى ملء جميع الحقول المطلوبة لتأكيد الطلب", "danger");
    return;
  }
  
  let cityName = "أخرى";
  let shippingCost = 100;
  
  if (cityVal === "cairo") {
    cityName = "القاهرة";
    shippingCost = 60;
  } else if (cityVal === "giza") {
    cityName = "الجيزة";
    shippingCost = 80;
  } else {
    cityName = "محافظة أخرى";
    shippingCost = 100;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  if (subtotal >= activeFreeShippingLimit) {
    shippingCost = 0;
  }
  const finalTotal = subtotal + shippingCost;
  
  // Format the WhatsApp message
  let message = `السلام عليكم ورحمة الله وبركاته،\n`;
  message += `أود طلب المنتجات التالية من *متجر ${activeShopName}*:\n`;
  message += `---------------------------------\n`;
  
  cart.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    message += `${index + 1}. *${item.product.name}* (${item.product.price}ج) × ${item.quantity} = *${itemTotal}ج*\n`;
  });
  
  message += `---------------------------------\n`;
  message += `🔹 إجمالي المنتجات: *${subtotal} ج*\n`;
  message += `🚚 مصاريف الشحن: ${shippingCost === 0 ? '*مجاناً 🎉*' : `*${shippingCost} ج* (${cityName})`}\n`;
  message += `💰 إجمالي الحساب الكلي: *${finalTotal} ج*\n`;
  message += `---------------------------------\n`;
  message += `📝 *بيانات التوصيل للعميل*:\n`;
  message += `👤 *الاسم*: ${name}\n`;
  message += `📍 *المحافظة*: ${cityName}\n`;
  message += `🏠 *العنوان بالتفصيل*: ${address}\n`;
  message += `📞 *رقم الهاتف للاتصال*: ${phone}\n`;
  message += `---------------------------------\n`;
  message += `شكراً جزيلاً وفي انتظار تأكيد الأوردر 🌟`;
  
  // Encode URI text
  const encodedText = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const cleanWhatsapp = activeShopWhatsapp.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodedText}`;
  
  // Redirect
  window.open(waUrl, "_blank");
  
  // Clear cart and UI
  cart = [];
  saveCartAndRefresh();
  document.getElementById("checkoutForm").reset();
  toggleCart(false);
  
  showToast("تم تحويلك إلى الواتساب لإكمال الطلب! شكراً لك.");
}

// Premium Toast Notification Helper
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Animation Triggers
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Build Dynamic Category Tabs based on active products in the shop
function buildDynamicCategoryTabs() {
  const container = document.getElementById("categoryFilterContainer");
  if (!container) return;

  const uniqueCategories = new Set();
  products.forEach(p => {
    if (p.category) {
      uniqueCategories.add(p.category);
    }
  });

  // Start with 'all'
  let tabsHtml = `<button class="category-tab ${currentCategory === 'all' ? 'active' : ''}" data-category="all" onclick="setCategory('all')">الكل</button>`;

  // Add each unique category
  uniqueCategories.forEach(cat => {
    const catLabel = CATEGORY_NAMES[cat] || cat;
    tabsHtml += `<button class="category-tab ${currentCategory === cat ? 'active' : ''}" data-category="${cat}" onclick="setCategory('${cat}')">${catLabel}</button>`;
  });

  container.innerHTML = tabsHtml;
}

// Render Featured Marquee Bar dynamically
function renderFeaturedMarqueeBar() {
  const marqueeBar = document.getElementById("featuredMarqueeBar");
  const textWrapper = document.getElementById("marqueeTextWrapper");
  if (!marqueeBar || !textWrapper) return;

  // Filter products marked as featured
  const featured = products.filter(p => p.is_featured === true || p.is_featured === 'true');

  if (featured.length === 0) {
    marqueeBar.style.display = "none";
    const existingTrigger = document.getElementById("marqueeCollapsedTrigger");
    if (existingTrigger) existingTrigger.remove();
    return;
  }

  marqueeBar.style.display = "flex";
  textWrapper.innerHTML = "";

  featured.forEach(p => {
    const item = document.createElement("span");
    item.className = "marquee-item";
    item.setAttribute("onclick", `openOfferDetails('${p.id}')`);

    const wholesaleQty = parseFloat(p.wholesale_qty);
    const wholesalePrice = parseFloat(p.wholesale_price);
    const hasWholesale = wholesaleQty > 0 && wholesalePrice > 0;

    let text = `عرض مميز: <strong>${p.name}</strong> بسعر ${p.price} ج فقط!`;
    if (hasWholesale) {
      text = `عرض الجملة الخاص: <strong>${p.name}</strong> (${p.wholesale_qty} ${p.unit} بسعر ${p.wholesale_price} ج بدلاً من ${p.wholesale_qty * p.price} ج) - اضغط للتفاصيل`;
    }

    const icon = CATEGORY_ICONS[p.category] || "📦";
    const imgHtml = p.image_url 
      ? `<img src="${p.image_url}" alt="${p.name}" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.4); flex-shrink: 0;" onerror="this.outerHTML='<span style=\"font-size: 1.1rem;\">${icon}</span>'">`
      : `<span style="font-size: 1.1rem; flex-shrink: 0;">${icon}</span>`;

    item.innerHTML = `
      <span class="badge-offer">عرض</span>
      ${imgHtml}
      <span>${text}</span>
    `;
    textWrapper.appendChild(item);
  });

  // Duplicate elements if list is short to ensure smooth scrolling loop
  if (featured.length < 5) {
    const children = Array.from(textWrapper.children);
    children.forEach(child => {
      const clone = child.cloneNode(true);
      textWrapper.appendChild(clone);
    });
  }
}

let isMarqueeClosed = false;

// Handle close action on Marquee bar
function toggleMarqueeBar() {
  const marqueeBar = document.getElementById("featuredMarqueeBar");
  if (!marqueeBar) return;
  
  marqueeBar.classList.add("closed");
  isMarqueeClosed = true;
  
  // Create expand button at bottom-left corner
  createMarqueeCollapsedTrigger();
}

// Create floating trigger to open the marquee back
function createMarqueeCollapsedTrigger() {
  if (document.getElementById("marqueeCollapsedTrigger")) return;

  const trigger = document.createElement("button");
  trigger.id = "marqueeCollapsedTrigger";
  trigger.className = "marquee-collapsed-trigger";
  trigger.innerHTML = `<i class="fa-solid fa-gift"></i> <span>عرض العروض المميزة</span>`;
  trigger.onclick = () => {
    const marqueeBar = document.getElementById("featuredMarqueeBar");
    if (marqueeBar) {
      marqueeBar.classList.remove("closed");
      isMarqueeClosed = false;
    }
    trigger.remove();
  };
  
  document.body.appendChild(trigger);
}

// Open Detail view modal for featured/special deals
function openOfferDetails(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingModal = document.getElementById("offerDetailsModal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "offerDetailsModal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.7)";
  modal.style.backdropFilter = "blur(8px)";
  modal.style.zIndex = "1050";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.padding = "20px";
  modal.style.boxSizing = "border-box";

  const wholesaleQty = parseFloat(product.wholesale_qty);
  const wholesalePrice = parseFloat(product.wholesale_price);
  const hasWholesale = wholesaleQty > 0 && wholesalePrice > 0;

  // Retrieve other active wholesale deals in the same category
  const otherOffers = products.filter(p => 
    p.category === product.category && 
    p.id !== product.id && 
    parseFloat(p.wholesale_qty) > 0 && 
    parseFloat(p.wholesale_price) > 0
  );

  let otherOffersHtml = "";
  if (otherOffers.length > 0) {
    otherOffersHtml = `
      <div style="margin-top: 1.25rem; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 1rem; text-align: right; max-height: 160px; overflow-y: auto; padding-right: 4px;">
        <h4 style="font-size: 0.85rem; color: var(--secondary-color); margin-bottom: 0.5rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-tags"></i> عروض أخرى متوفرة في هذا القسم:
        </h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${otherOffers.map(o => `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 8px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
              <div style="flex: 1;">
                <strong style="color: var(--white); display: block; font-size: 0.8rem; line-height: 1.3;">${o.name}</strong>
                <span style="color: var(--gray-400); font-size: 0.75rem;">العرض: ${o.wholesale_qty} ${o.unit} بـ ${o.wholesale_price} ج</span>
              </div>
              <button onclick="openOfferDetails('${o.id}')" style="background: var(--secondary-color); border: none; color: var(--white); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-weight: 700; white-space: nowrap;">عرض</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let offerDetailsHtml = "";
  if (hasWholesale) {
    const regularTotalPrice = wholesaleQty * product.price;
    const savings = regularTotalPrice - wholesalePrice;
    
    offerDetailsHtml = `
      <div style="background: rgba(25, 20, 17, 0.95); border: 2px solid var(--secondary-color); padding: 1.5rem; border-radius: 20px; text-align: center; max-width: 450px; width: 100%; box-shadow: var(--shadow-lg); color: var(--white); direction: rtl;">
        <i class="fa-solid fa-gift" style="font-size: 2.5rem; color: var(--secondary-color); margin-bottom: 1rem; display: inline-block;"></i>
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--white);">${product.name}</h3>
        <p style="font-size: 0.85rem; color: var(--gray-400); margin-bottom: 1rem;">${product.description || "لا يوجد وصف لهذا المنتج حالياً."}</p>
        
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
            <span style="color: var(--gray-400);">السعر المفرد:</span>
            <span style="font-weight: 700;">${product.price} ج لكل ${product.unit}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
            <span style="color: var(--secondary-color); font-weight: 700;">عرض الجملة:</span>
            <span style="font-weight: 700; color: var(--secondary-color);">${wholesaleQty} ${product.unit} بـ ${wholesalePrice} ج</span>
          </div>
          ${savings > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; color: var(--success-color);">
            <span>نسبة التوفير:</span>
            <span>توفير ${savings} ج!</span>
          </div>
          ` : ''}
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.85rem; color: var(--gray-400); margin-bottom: 0.5rem;">اختر الكمية المرغوبة:</label>
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <button onclick="decrementOfferQty()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.1rem; font-weight: bold;">-</button>
            <input type="number" id="offerQtyInput" value="${wholesaleQty}" min="1" style="width: 70px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; text-align: center; font-size: 1.1rem; font-weight: 700; padding: 5px; border-radius: 6px;">
            <button onclick="incrementOfferQty()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.1rem; font-weight: bold;">+</button>
          </div>
          <span style="display:block; font-size:11px; color:var(--success-color); margin-top:8px;" id="offerAppliedMsg">✓ تم تفعيل سعر العرض الخاص!</span>
        </div>

        ${otherOffersHtml}

        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 1.25rem;">
          <button onclick="addOfferToCart('${product.id}')" style="background: var(--primary-gradient); border: none; color: white; padding: 0.75rem 1.5rem; font-weight: 700; border-radius: 10px; cursor: pointer; flex: 1;">إضافة للسلة</button>
          <button onclick="closeOfferModal()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--gray-300); padding: 0.75rem 1.25rem; font-weight: 700; border-radius: 10px; cursor: pointer;">إغلاق</button>
        </div>
      </div>
    `;
  } else {
    offerDetailsHtml = `
      <div style="background: rgba(25, 20, 17, 0.95); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 20px; text-align: center; max-width: 400px; width: 100%; box-shadow: var(--shadow-lg); color: var(--white); direction: rtl;">
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--white);">${product.name}</h3>
        <p style="font-size: 0.85rem; color: var(--gray-400); margin-bottom: 1.5rem;">${product.description || "لا يوجد وصف لهذا المنتج حالياً."}</p>
        
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
            <span style="color: var(--gray-400);">السعر:</span>
            <span style="font-weight: 700;">${product.price} ج لكل ${product.unit}</span>
          </div>
        </div>

        ${otherOffersHtml}

        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 1.25rem;">
          <button onclick="addSingleToCart('${product.id}')" style="background: var(--primary-gradient); border: none; color: white; padding: 0.75rem 1.5rem; font-weight: 700; border-radius: 10px; cursor: pointer; flex: 1;">إضافة للسلة</button>
          <button onclick="closeOfferModal()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--gray-300); padding: 0.75rem 1.25rem; font-weight: 700; border-radius: 10px; cursor: pointer;">إغلاق</button>
        </div>
      </div>
    `;
  }

  modal.innerHTML = offerDetailsHtml;
  document.body.appendChild(modal);

  window.closeOfferModal = () => modal.remove();
  
  window.incrementOfferQty = () => {
    const input = document.getElementById("offerQtyInput");
    if (input) {
      input.value = parseInt(input.value) + 1;
      updateOfferModalMsg(wholesaleQty);
    }
  };

  window.decrementOfferQty = () => {
    const input = document.getElementById("offerQtyInput");
    if (input && parseInt(input.value) > 1) {
      input.value = parseInt(input.value) - 1;
      updateOfferModalMsg(wholesaleQty);
    }
  };

  window.addOfferToCart = (pId) => {
    const input = document.getElementById("offerQtyInput");
    const qty = parseInt(input.value) || wholesaleQty;
    addToCartWithQty(pId, qty);
    modal.remove();
  };

  window.addSingleToCart = (pId) => {
    addToCart(pId);
    modal.remove();
  };

  const updateOfferModalMsg = (threshold) => {
    const input = document.getElementById("offerQtyInput");
    const msg = document.getElementById("offerAppliedMsg");
    if (!input || !msg) return;
    if (parseInt(input.value) >= threshold) {
      msg.style.color = "#4cd964";
      msg.textContent = "✓ تم تفعيل سعر العرض الخاص!";
    } else {
      msg.style.color = "#ffcc00";
      msg.textContent = `أضف ${threshold - parseInt(input.value)} قطعة إضافية لتفعيل العرض!`;
    }
  };
}

// Add Item with specified quantity
function addToCartWithQty(productId, qty) {
  const product = products.find(p => p.id === productId);
  if (!product || product.available === false) return;

  const cartItem = cart.find(item => item.product.id === productId);
  if (cartItem) {
    cartItem.quantity = qty;
  } else {
    cart.push({
      product: product,
      quantity: qty
    });
  }

  saveCartAndRefresh();
  showToast(`تمت إضافة "${product.name}" بالكمية المطلوبة (${qty}) إلى السلة!`);
}


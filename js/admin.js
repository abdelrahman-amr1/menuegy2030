// Tenant Shop Admin Application Logic - MenuEgy 2030

let products = [];
let filteredProducts = [];
let searchQuery = "";
let selectedCategory = "all";
let activeShopSlug = "";

// Category Names Arabic mapping
const CATEGORY_LABELS = {
  spices: "التوابل والبهارات",
  drinks: "المشروبات الطبيعية",
  herbs: "الأعشاب الطبيعية",
  oils: "الزيوت الخام",
  incense: "البخور المشكل",
  famous: "الأشهر في أسوان",
  "اللحوم والدواجن": "اللحوم والدواجن",
  "الأسماك والمدخن": "الأسماك والمدخن",
  "اللحوم الباردة": "اللحوم الباردة",
  "الأجبان والدهون": "الأجبان والدهون",
  "المخبوزات والعجائن": "المخبوزات والعجائن",
  "البهارات والصلصات": "البهارات والصلصات",
  meat_poultry: "اللحوم والدواجن",
  seafood_smoked: "الأسماك والمدخن",
  cold_cuts: "اللحوم الباردة",
  cheese_fats: "الأجبان والدهون",
  bakery_dough: "المخبوزات والعجائن",
  spices_sauces: "البهارات والصلصات"
};

// Initialize Admin Interface
document.addEventListener("DOMContentLoaded", async () => {
  // Read slug parameter if present in URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlSlug = urlParams.get("s") || urlParams.get("shop");
  
  const slugInputGroup = document.getElementById("loginShopSlugGroup");
  const slugInput = document.getElementById("loginShopSlug");
  
  if (urlSlug) {
    activeShopSlug = urlSlug.toLowerCase().trim();
    slugInput.value = activeShopSlug;
    if (slugInputGroup) {
      slugInputGroup.style.display = "none"; // Hide slug input since it's pre-supplied
    }
  }

  // Bind product image uploader change listener
  const prodImageFile = document.getElementById("prodImageFile");
  const prodImageUrl = document.getElementById("prodImageUrl");
  const prodImagePreviewContainer = document.getElementById("prodImagePreviewContainer");
  const prodImagePreview = document.getElementById("prodImagePreview");
  const prodImageUploadStatus = document.getElementById("prodImageUploadStatus");

  if (prodImageFile) {
    prodImageFile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      prodImagePreviewContainer.style.display = "block";
      prodImageUploadStatus.style.color = "#d48a37";
      prodImageUploadStatus.textContent = "⌛ جاري رفع صورة المنتج...";
      prodImagePreview.style.opacity = "0.5";

      try {
        const publicUrl = await uploadFileToSupabase(file, "products");
        if (publicUrl) {
          prodImageUrl.value = publicUrl;
          prodImagePreview.src = publicUrl;
          prodImagePreview.style.opacity = "1";
          prodImageUploadStatus.style.color = "#4cd964";
          prodImageUploadStatus.textContent = "✓ تم رفع الصورة بنجاح";
        } else {
          throw new Error("فشل الرفع");
        }
      } catch (err) {
        console.error(err);
        prodImageUploadStatus.style.color = "#d9534f";
        prodImageUploadStatus.textContent = "❌ فشل رفع الصورة";
        prodImagePreviewContainer.style.display = "none";
        prodImageUrl.value = "";
      }
    });
  }

  await checkAuth();
});

// Check if authenticated
function isAuthenticated() {
  const isAuth = sessionStorage.getItem("tenant_admin_auth") === "true";
  const sessionSlug = sessionStorage.getItem("tenant_admin_shop_id");
  
  if (activeShopSlug) {
    // If slug is pre-defined in URL, ensure it matches session slug
    return isAuth && sessionSlug === activeShopSlug;
  }
  return isAuth && !!sessionSlug;
}

// Check session storage and toggle views
async function checkAuth() {
  const loginContainer = document.getElementById("adminLoginContainer");
  const dashboardContent = document.getElementById("adminDashboardContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const goToStoreBtn = document.getElementById("goToStoreBtn");
  
  if (isAuthenticated()) {
    activeShopSlug = sessionStorage.getItem("tenant_admin_shop_id");
    
    // Load shop branding
    const shop = await getShopProfile(activeShopSlug);
    if (shop) {
      activeShopProfile = shop;
      
      // Set admin document title
      document.title = `لوحة تحكم | ${shop.name}`;
      
      // Update page labels
      document.getElementById("adminHeaderTitle").textContent = `لوحة إدارة | ${shop.name}`;
      document.getElementById("adminHeaderSubtitle").textContent = shop.slogan || "لوحة تحكم المتجر وإدارة الأسعار والمخزن";
      document.getElementById("adminFooterShopName").textContent = shop.name;

      // Manage POS Terminal button visibility based on Super Admin toggle
      const posBtn = document.getElementById("posTerminalMainBtn");
      if (posBtn) {
        if (shop.pos_enabled === false || shop.pos_enabled === 'false') {
          posBtn.style.opacity = "0.5";
          posBtn.title = "ميزة POS غير مفعلة باشتراكك، تواصل مع إداره المنصة لترقيتها وتفعيلها";
          posBtn.onclick = function() {
            showToast("عذراً، ميزة شاشة الكاشير (POS) غير مفعلة باشتراك هذا المتجر، تواصل مع إدارة المنصة لتفعيلها", "warning");
          };
        } else {
          posBtn.style.opacity = "1";
          posBtn.title = "";
          posBtn.onclick = function() { openPosTerminalModal(); };
        }
      }

      // Display subscription information
      const subBanner = document.getElementById("subscriptionAlertBanner");
      const subText = document.getElementById("subscriptionBannerText");
      const renewBtn = document.getElementById("renewSubscriptionWaBtn");
      if (subBanner && subText) {
        subBanner.style.display = "block";
        const planName = shop.subscription_plan === 'pro' ? 'الباقة الاحترافية (Pro) 🌟' : shop.subscription_plan === 'business' ? 'باقة الأعمال (Business) 💼' : shop.subscription_plan === 'trial' ? 'الفترة التجريبية 🎁' : 'الباقة الأساسية (Starter) 💳';
        const expiryDate = shop.subscription_expiry ? new Date(shop.subscription_expiry) : null;
        
        let statusText = `باقة الاشتراك الحالية: <strong>${planName}</strong>. `;
        if (expiryDate) {
          const today = new Date();
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          const formattedExpiry = expiryDate.toLocaleDateString('ar-EG');
          if (diffDays < 0) {
            statusText += ` <span style="color: #d9534f; font-weight: 700;">انتهى الاشتراك في تاريخ ${formattedExpiry} (منذ ${Math.abs(diffDays)} يوم).</span>`;
          } else if (diffDays <= 7) {
            statusText += ` <span style="color: #d48a37; font-weight: 700;">ينتهي الاشتراك قريباً في تاريخ ${formattedExpiry} (متبقي ${diffDays} يوم).</span>`;
          } else {
            statusText += ` ينتهي الاشتراك في تاريخ <strong style="color: #4cd964;">${formattedExpiry}</strong> (متبقي ${diffDays} يوم).`;
          }
        } else {
          statusText += ` صلاحية الاشتراك: مفتوح وغير محدد.`;
        }
        subText.innerHTML = statusText;
        
        if (renewBtn) {
          renewBtn.href = `https://wa.me/201128007078?text=${encodeURIComponent(`السلام عليكم م. عبدالرحمن، أريد تجديد اشتراك متجري (${shop.name}) صاحب الرابط (${shop.id}) في منصة MenuEgy`)}`;
        }
      }
      
      // Apply theme colors dynamically
      document.documentElement.style.setProperty('--primary-color', shop.primary_color);
      document.documentElement.style.setProperty('--secondary-color', shop.secondary_color);
      
      // Logo image
      const logoImg = document.getElementById("adminHeaderLogo");
      if (shop.logo_url) {
        logoImg.src = shop.logo_url;
        logoImg.style.display = "block";
      } else {
        logoImg.style.display = "none";
      }
      
      // Store link button
      if (goToStoreBtn) {
        goToStoreBtn.href = `../index.html?s=${activeShopSlug}`;
        goToStoreBtn.style.display = "flex";
      }
    }

    if (loginContainer) loginContainer.style.display = "none";
    if (dashboardContent) dashboardContent.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "flex";
    
    // Apply granular permissions UI restrictions
    applyUserPermissions();
    
    await loadAdminProducts();
  } else {
    if (loginContainer) loginContainer.style.display = "flex";
    if (dashboardContent) dashboardContent.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (goToStoreBtn) goToStoreBtn.style.display = "none";
  }
}

// Handle Login Form Submission (Main Admin or Sub-Users / Cashiers)
async function handleAdminLogin(event) {
  event.preventDefault();
  
  const errorMsg = document.getElementById("loginErrorMsg");
  errorMsg.style.display = "none";

  const shopSlug = document.getElementById("loginShopSlug").value.trim().toLowerCase();
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  
  if (!shopSlug) {
    showToast("يرجى إدخال معرّف المحل (Slug)", "danger");
    return;
  }

  // Cloudflare Turnstile Validation
  const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]');
  if (turnstileResponse && !turnstileResponse.value) {
    showToast("يرجى اجتياز التحقق الأمني (الكابتشا) أولاً!", "danger");
    return;
  }

  // --- BRUTE FORCE PROTECTION ---
  const attemptKey = `login_attempts_${shopSlug}_${user}`;
  let attempts = JSON.parse(localStorage.getItem(attemptKey)) || { count: 0, lockoutTime: 0 };
  
  if (attempts.lockoutTime > Date.now()) {
    const remainingMins = Math.ceil((attempts.lockoutTime - Date.now()) / 60000);
    errorMsg.innerHTML = `تم قفل الحساب مؤقتاً بسبب كثرة المحاولات الخاطئة. حاول مجدداً بعد <strong>${remainingMins}</strong> دقيقة.`;
    errorMsg.style.display = "block";
    showToast("حساب مقفل مؤقتاً!", "danger");
    return;
  }
  // -----------------------------

  try {
    const shop = await getShopProfile(shopSlug);
    
    if (!shop) {
      errorMsg.textContent = "عذراً، هذا المتجر غير مسجل بالمنصة!";
      errorMsg.style.display = "block";
      showToast("عذراً، هذا المتجر غير مسجل بالمنصة!", "danger");
      return;
    }

    // 1. Check Main Shop Admin Credentials
    let authenticated = false;
    let userRole = "owner";
    let userPermissions = "all";

    if (shop.admin_username === user && shop.admin_password === pass) {
      authenticated = true;
      userRole = "owner";
      userPermissions = "all";
    } else {
      // 2. Check Sub-Users / Cashiers Accounts
      const subUsers = shop.sub_users || [];
      const match = subUsers.find(u => u.username === user && u.password === pass);
      if (match) {
        authenticated = true;
        userRole = match.role || "cashier";
        userPermissions = match.permissions ? JSON.stringify(match.permissions) : "{}";
      }
    }

    if (authenticated) {
      // Reset attempts on success
      localStorage.removeItem(attemptKey);
      
      sessionStorage.setItem("tenant_admin_auth", "true");
      sessionStorage.setItem("tenant_admin_shop_id", shopSlug);
      sessionStorage.setItem("tenant_user_role", userRole);
      sessionStorage.setItem("tenant_user_permissions", userPermissions);
      activeShopSlug = shopSlug;
      
      await checkAuth();
      showToast(`تم تسجيل الدخول بنجاح! مرحباً بك (${userRole === 'cashier' ? 'الكاشير' : 'مدير المتجر'}).`);
    } else {
      // Record failed attempt
      attempts.count += 1;
      if (attempts.count >= 5) {
        attempts.lockoutTime = Date.now() + (15 * 60 * 1000); // 15 mins
        errorMsg.textContent = "تم إدخال بيانات خاطئة 5 مرات متتالية. تم قفل الحساب لمدة 15 دقيقة لدواعي أمنية.";
      } else {
        errorMsg.textContent = `خطأ في اسم المستخدم أو كلمة المرور! (المحاولات المتبقية: ${5 - attempts.count})`;
      }
      localStorage.setItem(attemptKey, JSON.stringify(attempts));
      
      errorMsg.style.display = "block";
      showToast("خطأ في البيانات المُدخلة!", "danger");
    }
  } catch (e) {
    console.error(e);
    showToast("حدث خطأ أثناء الاتصال بالسحابة.", "danger");
  }
}

// Handle Logout
function handleAdminLogout() {
  const confirmLogout = confirm("هل أنت متأكد من رغبتك في تسجيل الخروج؟");
  if (!confirmLogout) return;
  
  sessionStorage.removeItem("tenant_admin_auth");
  sessionStorage.removeItem("tenant_admin_shop_id");
  checkAuth();
  showToast("تم تسجيل الخروج بنجاح.");
}

// Load products and render admin UI
async function loadAdminProducts() {
  products = await getShopProducts(activeShopSlug);
  populateAdminCategoryFilter();
  updateStats();
  applyFiltersAndRender();
}

// Update Stats Cards
function updateStats() {
  const total = products.length;
  const active = products.filter(p => p.available !== false).length;
  const outOfStock = total - active;
  
  document.getElementById("statTotalProducts").textContent = total;
  document.getElementById("statActiveProducts").textContent = active;
  document.getElementById("statOutOfStock").textContent = outOfStock;
}

// Filter products based on search input and dropdown category
function filterAdminProducts() {
  searchQuery = document.getElementById("adminSearchInput").value.trim().toLowerCase();
  selectedCategory = document.getElementById("adminCategorySelect").value;
  applyFiltersAndRender();
}

// Filter and render helper
function applyFiltersAndRender() {
  filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesSearch;
  });
  
  renderAdminTable();
}

// Render Products Table
function renderAdminTable() {
  const tbody = document.getElementById("adminProductsTableBody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--gray-600); padding: 3rem;">
          <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block; color: var(--gray-300)"></i>
          لا توجد منتجات مسجلة مطابقة للبحث حالياً
        </td>
      </tr>
    `;
    return;
  }
  
  filteredProducts.forEach(p => {
    const tr = document.createElement("tr");
    
    const categoryLabel = CATEGORY_LABELS[p.category] || p.category;
    const categoryBadgeClass = `product-row-badge badge-${p.category}`;
    const isAvailable = p.available !== false;
    
    const qty = p.quantity !== undefined ? parseFloat(p.quantity) : 100;
    const minStock = parseFloat(p.min_stock) || 5;
    const costPrice = parseFloat(p.cost_price) || 0;
    const barcodeStr = p.barcode || "200" + Math.floor(100000000 + Math.random() * 900000000);
    const storeNameStr = p.store_name || "المخزن الرئيسي";

    let qtyBadgeHtml = "";
    if (qty <= 0) {
      qtyBadgeHtml = `<span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;"><i class="fa-solid fa-triangle-exclamation"></i> نفدت الكمية (${qty})</span>`;
    } else if (qty <= minStock) {
      qtyBadgeHtml = `<span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;"><i class="fa-solid fa-battery-quarter"></i> مخزون منخفض (${qty})</span>`;
    } else {
      qtyBadgeHtml = `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;"><i class="fa-solid fa-boxes-stacked"></i> ${qty} ${p.unit}</span>`;
    }

    tr.innerHTML = `
      <td>
        <span class="${categoryBadgeClass}">${categoryLabel}</span>
      </td>
      <td>
        <div style="display:flex; align-items:center; gap: 10px;">
          ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" style="width:38px; height:38px; object-fit:cover; border-radius:6px; border:1px solid #e2e8f0;">` : `<div style="width:38px; height:38px; background:var(--gray-200); border-radius:6px; display:flex; align-items:center; justify-content:center; color:var(--gray-500);"><i class="fa-solid fa-image"></i></div>`}
          <div>
            <strong style="color: var(--dark-color); font-size: 13px;">${p.name}</strong>
            <div style="font-size: 10px; color: #64748b;"><i class="fa-solid fa-warehouse"></i> ${storeNameStr}</div>
          </div>
        </div>
      </td>
      <td>
        <code style="font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #0284c7;">${barcodeStr}</code>
      </td>
      <td style="text-align: center;">
        ${qtyBadgeHtml}
      </td>
      <td>
        <span style="font-size: 12px; color: #64748b;">${costPrice} ج</span>
      </td>
      <td>
        <span style="font-weight: 800; color: var(--primary-color); font-size: 13px;">${p.price} ج</span>
      </td>
      <td style="text-align: center;">
        <label class="switch">
          <input type="checkbox" ${isAvailable ? 'checked' : ''} onchange="toggleProductAvailability('${p.id}', this.checked)">
          <span class="slider"></span>
        </label>
      </td>
      <td style="text-align: center;">
        <div style="display: flex; gap: 0.35rem; justify-content: center;">
          <button class="btn btn-outline" style="padding: 0.35rem 0.5rem;" onclick="openBarcodeModal('${p.id}')" title="طباعة ملصق الباركود والأسعار">
            <i class="fa-solid fa-barcode" style="color: #0284c7"></i>
          </button>
          <button class="btn btn-outline" style="padding: 0.35rem 0.5rem;" onclick="openProductModal('${p.id}')" title="تعديل">
            <i class="fa-solid fa-pencil" style="color: var(--secondary-color)"></i>
          </button>
          <button class="btn btn-outline" style="padding: 0.35rem 0.5rem;" onclick="deleteProduct('${p.id}')" title="حذف">
            <i class="fa-solid fa-trash-can" style="color: var(--danger-color)"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Toggle product availability status
async function toggleProductAvailability(productId, isChecked) {
  const index = products.findIndex(p => p.id === productId);
  if (index === -1) return;
  
  const product = { ...products[index] };
  product.available = isChecked;
  
  const success = await saveShopProduct(product);
  if (success) {
    products[index].available = isChecked;
    updateStats();
    const statusMsg = isChecked ? "متوفر للبيع" : "غير متوفر حالياً";
    showToast(`تم تعديل حالة المنتج "${product.name}" إلى: ${statusMsg}`);
  } else {
    showToast("فشل تحديث حالة المنتج بالشبكة", "danger");
    applyFiltersAndRender(); // Reset checkbox UI
  }
}

// Open Form Modal for Add or Edit
function openProductModal(productId) {
  const overlay = document.getElementById("productModalOverlay");
  const form = document.getElementById("productForm");
  const modalTitle = document.getElementById("modalTitle");
  const saveBtn = document.getElementById("saveModalBtn");
  
  form.reset();
  
  // Clear file input and preview container
  const prodImageFile = document.getElementById("prodImageFile");
  if (prodImageFile) prodImageFile.value = "";
  const prodImagePreviewContainer = document.getElementById("prodImagePreviewContainer");
  const prodImagePreview = document.getElementById("prodImagePreview");
  const prodImageUrl = document.getElementById("prodImageUrl");
  prodImageUrl.value = "";
  if (prodImagePreviewContainer) prodImagePreviewContainer.style.display = "none";
  
  if (productId === null) {
    // Add Mode
    modalTitle.textContent = "إضافة منتج جديد";
    saveBtn.textContent = "إضافة المنتج";
    document.getElementById("modalProductId").value = "";
    document.getElementById("prodAvailable").value = "true";
    document.getElementById("prodIsFeatured").checked = false;
    document.getElementById("prodWholesaleQty").value = "";
    document.getElementById("prodWholesalePrice").value = "";
    
    document.getElementById("prodQty").value = "100";
    document.getElementById("prodCostPrice").value = "";
    document.getElementById("prodMinStock").value = "5";
    document.getElementById("prodBarcode").value = "200" + Math.floor(100000000 + Math.random() * 900000000);
    document.getElementById("prodStoreName").value = "المخزن الرئيسي";

    populateAdminCategorySelect("");
  } else {
    // Edit Mode
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    modalTitle.textContent = "تعديل بيانات المنتج والمخزن";
    saveBtn.textContent = "حفظ التعديلات";
    
    document.getElementById("modalProductId").value = product.id;
    document.getElementById("prodName").value = product.name;
    document.getElementById("prodPrice").value = product.price;
    document.getElementById("prodUnit").value = product.unit;
    document.getElementById("prodDesc").value = product.description || "";
    document.getElementById("prodAvailable").value = (product.available !== false).toString();
    document.getElementById("prodIsFeatured").checked = product.is_featured === true || product.is_featured === 'true';
    document.getElementById("prodWholesaleQty").value = product.wholesale_qty || "";
    document.getElementById("prodWholesalePrice").value = product.wholesale_price || "";
    
    document.getElementById("prodQty").value = product.quantity !== undefined ? product.quantity : 100;
    document.getElementById("prodCostPrice").value = product.cost_price || "";
    document.getElementById("prodMinStock").value = product.min_stock || "5";
    document.getElementById("prodBarcode").value = product.barcode || ("200" + Math.floor(100000000 + Math.random() * 900000000));
    document.getElementById("prodStoreName").value = product.store_name || "المخزن الرئيسي";
    
    prodImageUrl.value = product.image_url || "";
    if (product.image_url) {
      prodImagePreview.src = product.image_url;
      prodImagePreviewContainer.style.display = "block";
      document.getElementById("prodImageUploadStatus").style.color = "#4cd964";
      document.getElementById("prodImageUploadStatus").textContent = "✓ صورة المنتج الحالية";
      prodImagePreview.style.opacity = "1";
    }
    
    populateAdminCategorySelect(product.category);
  }
  
  overlay.classList.add("open");
}

// Close Modal Form
function closeProductModal() {
  document.getElementById("productModalOverlay").classList.remove("open");
}

// Save Product (Create or Update)
async function saveProductForm(event) {
  event.preventDefault();
  
  const id = document.getElementById("modalProductId").value;
  const name = document.getElementById("prodName").value.trim();
  
  // Handle custom category
  let category = document.getElementById("prodCategory").value;
  if (category === "__custom__") {
    category = document.getElementById("prodCategoryCustom").value.trim();
  }
  
  const price = parseFloat(document.getElementById("prodPrice").value);
  const cost_price = parseFloat(document.getElementById("prodCostPrice").value) || 0;
  const quantity = parseFloat(document.getElementById("prodQty").value) || 0;
  const min_stock = parseFloat(document.getElementById("prodMinStock").value) || 5;
  const barcode = document.getElementById("prodBarcode").value.trim() || ("200" + Math.floor(100000000 + Math.random() * 900000000));
  const store_name = document.getElementById("prodStoreName").value || "المخزن الرئيسي";

  const unit = document.getElementById("prodUnit").value.trim();
  const image_url = document.getElementById("prodImageUrl").value.trim();
  const description = document.getElementById("prodDesc").value.trim();
  const available = document.getElementById("prodAvailable").value === "true";
  
  const is_featured = document.getElementById("prodIsFeatured").checked;
  const wholesale_qty = parseFloat(document.getElementById("prodWholesaleQty").value) || null;
  const wholesale_price = parseFloat(document.getElementById("prodWholesalePrice").value) || null;
  
  // Enforce Starter plan wholesale feature restriction
  let currentShopPlan = "starter";
  try {
    const shopProfile = await getShopProfile(activeShopSlug);
    if (shopProfile && shopProfile.subscription_plan) {
      currentShopPlan = shopProfile.subscription_plan;
    }
  } catch(err) {
    console.error("Error checking shop plan:", err);
  }

  if (currentShopPlan === "starter" && (wholesale_qty > 0 || wholesale_price > 0)) {
    showToast("عروض الجملة والكمية متوفرة فقط في الباقة الاحترافية (Pro) وباقة الأعمال (Business). يرجى ترقية باقتك لتفعيلها!", "danger");
    return;
  }
  
  if (!name || !category || isNaN(price) || !unit) {
    showToast("يرجى ملء جميع الحقول الإلزامية", "danger");
    return;
  }

  const saveModalBtn = document.getElementById("saveModalBtn");

  // Enforce max products limit when adding a new product
  if (!id) {
    saveModalBtn.disabled = true;
    saveModalBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص باقة المحل...`;
    
    try {
      const shopProfile = await getShopProfile(activeShopSlug);
      const maxLimit = shopProfile && shopProfile.max_products_limit !== undefined && shopProfile.max_products_limit !== null
        ? parseInt(shopProfile.max_products_limit)
        : 50;
        
      if (products.length >= maxLimit) {
        showToast(`عذراً، لقد بلغت الحد الأقصى للمنتجات المسموح بها في باقتك الحالية (${maxLimit} منتج). يرجى الترقية لإضافة المزيد!`, "danger");
        saveModalBtn.disabled = false;
        saveModalBtn.innerHTML = `إضافة المنتج`;
        return;
      }
    } catch(err) {
      console.error("Error verifying shop limit:", err);
    }
  }
  
  const productData = {
    id: id || "p_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    shop_id: activeShopSlug,
    name,
    category,
    price,
    unit,
    image_url: image_url || null,
    description: description || null,
    available,
    is_featured,
    wholesale_qty,
    wholesale_price
  };

  saveModalBtn.disabled = true;
  saveModalBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...`;

  const success = await saveShopProduct(productData);
  
  if (success) {
    if (!id) {
      showToast(`تمت إضافة منتج "${name}" بنجاح!`);
    } else {
      showToast(`تم تعديل منتج "${name}" بنجاح!`);
    }
    closeProductModal();
    await loadAdminProducts();
  } else {
    showToast("حدث خطأ أثناء محاولة حفظ المنتج بالسحابة.", "danger");
  }

  saveModalBtn.disabled = false;
  saveModalBtn.innerHTML = id ? "حفظ التعديلات" : "إضافة المنتج";
}

// Delete Product
async function deleteProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const confirmDel = confirm(`هل أنت متأكد من رغبتك في حذف منتج "${product.name}" نهائياً من المتجر؟`);
  if (!confirmDel) return;
  
  const success = await deleteShopProduct(productId);
  if (success) {
    await loadAdminProducts();
    showToast(`تم حذف منتج "${product.name}" بنجاح.`, "danger");
  } else {
    showToast("حدث خطأ أثناء محاولة حذف المنتج.", "danger");
  }
}

// Reset Database Confirmation
async function confirmResetDB() {
  const confirmReset = confirm("تنبيه هام جداً!\nهل أنت متأكد من رغبتك في إعادة تعيين متجرك بالكامل؟\nسيؤدي هذا إلى مسح كافة المنتجات الحالية نهائياً لتتمكن من البدء بمتجر فارغ.");
  if (!confirmReset) return;
  
  const success = await clearShopProducts(activeShopSlug);
  if (success) {
    await loadAdminProducts();
    showToast("تم إعادة ضبط المتجر بنجاح ومسح كافة المنتجات.");
  } else {
    showToast("حدث خطأ أثناء محاولة إعادة التهيئة.", "danger");
  }
}

// Export Database as JSON
function exportData() {
  const formattedProducts = products.map(p => ({
    name: p.name,
    category: p.category,
    price: p.price,
    unit: p.unit,
    image_url: p.image_url || "",
    description: p.description || "",
    available: p.available !== false
  }));

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formattedProducts, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `shop_${activeShopSlug}_products_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("تم تصدير نسخة الاحتياط بنجاح!");
}

// Trigger hidden file input click
function triggerImport() {
  document.getElementById("importFileInput").click();
}

// Import Database from JSON file
async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // Basic validation
      if (Array.isArray(importedData) && importedData.length > 0 && importedData[0].hasOwnProperty("name")) {
        const confirmImp = confirm(`تم العثور على ${importedData.length} منتج في الملف. هل تريد استيرادها ودمجها مع المنتجات الحالية في هذا المتجر؟`);
        if (!confirmImp) return;
        
        const success = await saveAllProducts(activeShopSlug, importedData);
        if (success) {
          await loadAdminProducts();
          showToast("تم استيراد ودمج المنتجات وتحديث قاعدة البيانات بنجاح!");
        } else {
          showToast("حدث خطأ أثناء حفظ المنتجات المستوردة بالسحابة.", "danger");
        }
      } else {
        showToast("صيغة الملف غير صالحة. يرجى اختيار ملف نسخ احتياطي صحيح.", "danger");
      }
    } catch (err) {
      showToast("حدث خطأ أثناء قراءة الملف. تأكد من أن الملف بصيغة JSON صحيحة.", "danger");
    }
  };
  reader.readAsText(file);
  event.target.value = ""; // Reset input file
}

// Toast helper
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
  
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Category change handler in modal
function handleCategorySelectChange(val) {
  const customInput = document.getElementById("prodCategoryCustom");
  if (!customInput) return;
  if (val === "__custom__") {
    customInput.style.display = "block";
    customInput.required = true;
    customInput.focus();
  } else {
    customInput.style.display = "none";
    customInput.required = false;
    customInput.value = "";
  }
}

// Quick Unit selector helper
function setUnitQuick(val) {
  const unitInput = document.getElementById("prodUnit");
  if (unitInput) {
    unitInput.value = val;
  }
}

// Dynamic dropdown category populate
function populateAdminCategorySelect(selectedVal = "") {
  const select = document.getElementById("prodCategory");
  if (!select) return;

  const uniqueCategories = new Set();
  products.forEach(p => {
    if (p.category) {
      uniqueCategories.add(p.category);
    }
  });

  let optionsHtml = ``;
  uniqueCategories.forEach(cat => {
    const label = CATEGORY_LABELS[cat] || cat;
    optionsHtml += `<option value="${cat}">${label}</option>`;
  });

  optionsHtml += `<option value="__custom__">+ إضافة تصنيف جديد...</option>`;
  select.innerHTML = optionsHtml;

  const customInput = document.getElementById("prodCategoryCustom");
  
  if (selectedVal) {
    if (Array.from(uniqueCategories).includes(selectedVal)) {
      select.value = selectedVal;
      customInput.style.display = "none";
      customInput.required = false;
    } else {
      select.value = "__custom__";
      customInput.style.display = "block";
      customInput.required = true;
      customInput.value = selectedVal;
    }
  } else {
    const firstCat = Array.from(uniqueCategories)[0];
    if (firstCat) {
      select.value = firstCat;
      customInput.style.display = "none";
      customInput.required = false;
      customInput.value = "";
    } else {
      select.value = "__custom__";
      customInput.style.display = "block";
      customInput.required = true;
      customInput.value = "";
    }
  }
}

// Dynamic toolbar filter categories populate
function populateAdminCategoryFilter() {
  const filter = document.getElementById("adminCategorySelect");
  if (!filter) return;

  const uniqueCategories = new Set();
  products.forEach(p => {
    if (p.category) {
      uniqueCategories.add(p.category);
    }
  });

  let optionsHtml = `<option value="all">كل الأقسام</option>`;
  uniqueCategories.forEach(cat => {
    const label = CATEGORY_LABELS[cat] || cat;
    optionsHtml += `<option value="${cat}">${label}</option>`;
  });

  const previousSelection = selectedCategory;
  filter.innerHTML = optionsHtml;
  
  if (Array.from(uniqueCategories).includes(previousSelection)) {
    filter.value = previousSelection;
  } else {
    filter.value = "all";
    selectedCategory = "all";
  }
}

// ====================================================
// Sahl ERP Interactive Modals & Permissions Logic
// ====================================================

// --- 1. USER PERMISSIONS LOGIC ---
function switchPermTab(tabId, btnElement) {
  const contents = document.querySelectorAll("#userPermissionsModalOverlay .perm-tab-content");
  contents.forEach(c => c.classList.remove("active"));
  
  const buttons = document.querySelectorAll("#userPermissionsModalOverlay .menuegy-tab-btn");
  buttons.forEach(b => b.classList.remove("active"));
  
  const targetContent = document.getElementById(tabId);
  if (targetContent) targetContent.classList.add("active");
  if (btnElement) btnElement.classList.add("active");
}

async function openUserPermissionsModal() {
  const overlay = document.getElementById("userPermissionsModalOverlay");
  if (!overlay) return;

  const perms = await getShopUserPermissions(activeShopSlug);

  // Tab 1: General
  if (perms.general) {
    document.getElementById("perm_admin_app").checked = perms.general.admin_app !== false;
    document.getElementById("perm_backup_create").checked = perms.general.backup_create !== false;
    document.getElementById("perm_backup_restore").checked = perms.general.backup_restore !== false;
    document.getElementById("perm_edit_inv_number").checked = perms.general.edit_inv_number !== false;
    document.getElementById("perm_view_today_invoices_only").checked = perms.general.view_today_invoices_only === true;
    document.getElementById("perm_active_user").checked = perms.general.active_user !== false;
  }

  // Tab 2: Invoices
  if (perms.invoices) {
    document.getElementById("perm_invoice_view_sales").checked = perms.invoices.view_sales !== false;
    document.getElementById("perm_invoice_sales_new").checked = perms.invoices.sales_new !== false;
    document.getElementById("perm_invoice_sales_edit").checked = perms.invoices.sales_edit !== false;
    document.getElementById("perm_invoice_sales_delete").checked = perms.invoices.sales_delete === true;
    document.getElementById("perm_invoice_sales_return").checked = perms.invoices.sales_return !== false;

    document.getElementById("perm_invoice_view_purchases").checked = perms.invoices.view_purchases !== false;
    document.getElementById("perm_invoice_purchase_new").checked = perms.invoices.purchase_new !== false;
    document.getElementById("perm_invoice_purchase_edit").checked = perms.invoices.purchase_edit !== false;
    document.getElementById("perm_invoice_purchase_delete").checked = perms.invoices.purchase_delete === true;
    document.getElementById("perm_invoice_purchase_return").checked = perms.invoices.purchase_return !== false;

    document.getElementById("perm_invoice_view_quotes").checked = perms.invoices.view_quotes !== false;
    document.getElementById("perm_invoice_quote_new").checked = perms.invoices.quote_new !== false;
    document.getElementById("perm_invoice_quote_edit").checked = perms.invoices.quote_edit !== false;
    document.getElementById("perm_invoice_quote_delete").checked = perms.invoices.quote_delete === true;

    document.getElementById("perm_invoice_edit_price").checked = perms.invoices.edit_price !== false;
    document.getElementById("perm_invoice_discount").checked = perms.invoices.discount !== false;
    document.getElementById("perm_invoice_max_discount").value = perms.invoices.max_discount || 10;
    document.getElementById("perm_invoice_below_cost").checked = perms.invoices.below_cost === true;
    document.getElementById("perm_invoice_profit").checked = perms.invoices.view_profit !== false;
    document.getElementById("perm_invoice_credit_sales").checked = perms.invoices.credit_sales !== false;
  }

  // Tab 3: Inventory
  if (perms.inventory) {
    document.getElementById("perm_inv_view_items").checked = perms.inventory.view_items !== false;
    document.getElementById("perm_inv_item_new").checked = perms.inventory.item_new !== false;
    document.getElementById("perm_inv_item_edit").checked = perms.inventory.item_edit !== false;
    document.getElementById("perm_inv_item_delete").checked = perms.inventory.item_delete === true;
    document.getElementById("perm_inv_item_movement").checked = perms.inventory.item_movement !== false;
    document.getElementById("perm_inv_store_items").checked = perms.inventory.store_items !== false;
    document.getElementById("perm_inv_store_movement").checked = perms.inventory.store_movement !== false;
    document.getElementById("perm_inv_view_cost").checked = perms.inventory.view_cost !== false;
    document.getElementById("perm_inv_negative_sale").checked = perms.inventory.negative_sale === true;
    document.getElementById("perm_inv_print_barcode").checked = perms.inventory.print_barcode !== false;
  }

  // Tab 4: Accounts
  if (perms.accounts) {
    document.getElementById("perm_acc_view").checked = perms.accounts.view !== false;
    document.getElementById("perm_acc_new").checked = perms.accounts.new !== false;
    document.getElementById("perm_acc_edit").checked = perms.accounts.edit !== false;
    document.getElementById("perm_acc_delete").checked = perms.accounts.delete === true;
    document.getElementById("perm_acc_balance").checked = perms.accounts.balance !== false;
    document.getElementById("perm_acc_statement").checked = perms.accounts.statement !== false;
    document.getElementById("perm_acc_type_customer").checked = perms.accounts.type_customer !== false;
    document.getElementById("perm_acc_type_supplier").checked = perms.accounts.type_supplier !== false;
    document.getElementById("perm_acc_type_rep").checked = perms.accounts.type_rep !== false;
    document.getElementById("perm_acc_type_other").checked = perms.accounts.type_other !== false;
  }

  // Tab 5: Treasury
  if (perms.treasury) {
    document.getElementById("perm_treasury_view_receipts").checked = perms.treasury.view_receipts !== false;
    document.getElementById("perm_treasury_receipt_new").checked = perms.treasury.receipt_new !== false;
    document.getElementById("perm_treasury_receipt_edit").checked = perms.treasury.receipt_edit !== false;
    document.getElementById("perm_treasury_receipt_delete").checked = perms.treasury.receipt_delete === true;
    document.getElementById("perm_treasury_view_expenses").checked = perms.treasury.view_expenses !== false;
    document.getElementById("perm_treasury_expense_new").checked = perms.treasury.expense_new !== false;
    document.getElementById("perm_treasury_expense_edit").checked = perms.treasury.expense_edit !== false;
    document.getElementById("perm_treasury_expense_delete").checked = perms.treasury.expense_delete === true;
    document.getElementById("perm_treasury_view_flow").checked = perms.treasury.view_flow !== false;
    document.getElementById("perm_treasury_transfer").checked = perms.treasury.transfer !== false;
    document.getElementById("perm_treasury_close_shift").checked = perms.treasury.close_shift !== false;
  }

  // Tab 6: Advanced Reports
  if (perms.advanced_reports) {
    document.getElementById("perm_advanced_reports_access").checked = perms.advanced_reports.advanced_reports_access !== false;
    document.getElementById("perm_daily_flow_report").checked = perms.advanced_reports.daily_flow_report !== false;
    document.getElementById("perm_sales_analysis_report").checked = perms.advanced_reports.sales_analysis_report !== false;
    document.getElementById("perm_purchases_analysis_report").checked = perms.advanced_reports.purchases_analysis_report !== false;
  }

  // Tab 7: Installments
  if (perms.installments) {
    document.getElementById("perm_view_contracts").checked = perms.installments.view_contracts !== false;
    document.getElementById("perm_contract_new").checked = perms.installments.contract_new !== false;
    document.getElementById("perm_pay_installment").checked = perms.installments.pay_installment !== false;
    document.getElementById("perm_due_overdue_installments").checked = perms.installments.due_overdue_installments !== false;
  }

  overlay.classList.add("open");
}

function closeUserPermissionsModal() {
  const overlay = document.getElementById("userPermissionsModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

async function saveUserPermissionsForm() {
  const permsObj = {
    general: {
      admin_app: document.getElementById("perm_admin_app").checked,
      backup_create: document.getElementById("perm_backup_create").checked,
      backup_restore: document.getElementById("perm_backup_restore").checked,
      edit_inv_number: document.getElementById("perm_edit_inv_number").checked,
      view_today_invoices_only: document.getElementById("perm_view_today_invoices_only").checked,
      active_user: document.getElementById("perm_active_user").checked
    },
    invoices: {
      view_sales: document.getElementById("perm_invoice_view_sales").checked,
      sales_new: document.getElementById("perm_invoice_sales_new").checked,
      sales_edit: document.getElementById("perm_invoice_sales_edit").checked,
      sales_delete: document.getElementById("perm_invoice_sales_delete").checked,
      sales_return: document.getElementById("perm_invoice_sales_return").checked,
      view_purchases: document.getElementById("perm_invoice_view_purchases").checked,
      purchase_new: document.getElementById("perm_invoice_purchase_new").checked,
      purchase_edit: document.getElementById("perm_invoice_purchase_edit").checked,
      purchase_delete: document.getElementById("perm_invoice_purchase_delete").checked,
      purchase_return: document.getElementById("perm_invoice_purchase_return").checked,
      view_quotes: document.getElementById("perm_invoice_view_quotes").checked,
      quote_new: document.getElementById("perm_invoice_quote_new").checked,
      quote_edit: document.getElementById("perm_invoice_quote_edit").checked,
      quote_delete: document.getElementById("perm_invoice_quote_delete").checked,
      edit_price: document.getElementById("perm_invoice_edit_price").checked,
      discount: document.getElementById("perm_invoice_discount").checked,
      max_discount: parseFloat(document.getElementById("perm_invoice_max_discount").value) || 0,
      below_cost: document.getElementById("perm_invoice_below_cost").checked,
      view_profit: document.getElementById("perm_invoice_profit").checked,
      credit_sales: document.getElementById("perm_invoice_credit_sales").checked
    },
    inventory: {
      view_items: document.getElementById("perm_inv_view_items").checked,
      item_new: document.getElementById("perm_inv_item_new").checked,
      item_edit: document.getElementById("perm_inv_item_edit").checked,
      item_delete: document.getElementById("perm_inv_item_delete").checked,
      item_movement: document.getElementById("perm_inv_item_movement").checked,
      store_items: document.getElementById("perm_inv_store_items").checked,
      store_movement: document.getElementById("perm_inv_store_movement").checked,
      view_cost: document.getElementById("perm_inv_view_cost").checked,
      negative_sale: document.getElementById("perm_inv_negative_sale").checked,
      print_barcode: document.getElementById("perm_inv_print_barcode").checked
    },
    accounts: {
      view: document.getElementById("perm_acc_view").checked,
      new: document.getElementById("perm_acc_new").checked,
      edit: document.getElementById("perm_acc_edit").checked,
      delete: document.getElementById("perm_acc_delete").checked,
      balance: document.getElementById("perm_acc_balance").checked,
      statement: document.getElementById("perm_acc_statement").checked,
      type_customer: document.getElementById("perm_acc_type_customer").checked,
      type_supplier: document.getElementById("perm_acc_type_supplier").checked,
      type_rep: document.getElementById("perm_acc_type_rep").checked,
      type_other: document.getElementById("perm_acc_type_other").checked
    },
    treasury: {
      view_receipts: document.getElementById("perm_treasury_view_receipts").checked,
      receipt_new: document.getElementById("perm_treasury_receipt_new").checked,
      receipt_edit: document.getElementById("perm_treasury_receipt_edit").checked,
      receipt_delete: document.getElementById("perm_treasury_receipt_delete").checked,
      view_expenses: document.getElementById("perm_treasury_view_expenses").checked,
      expense_new: document.getElementById("perm_treasury_expense_new").checked,
      expense_edit: document.getElementById("perm_treasury_expense_edit").checked,
      expense_delete: document.getElementById("perm_treasury_expense_delete").checked,
      view_flow: document.getElementById("perm_treasury_view_flow").checked,
      transfer: document.getElementById("perm_treasury_transfer").checked,
      close_shift: document.getElementById("perm_treasury_close_shift").checked
    },
    advanced_reports: {
      advanced_reports_access: document.getElementById("perm_advanced_reports_access").checked,
      daily_flow_report: document.getElementById("perm_daily_flow_report").checked,
      sales_analysis_report: document.getElementById("perm_sales_analysis_report").checked,
      purchases_analysis_report: document.getElementById("perm_purchases_analysis_report").checked
    },
    installments: {
      view_contracts: document.getElementById("perm_view_contracts").checked,
      contract_new: document.getElementById("perm_contract_new").checked,
      pay_installment: document.getElementById("perm_pay_installment").checked,
      due_overdue_installments: document.getElementById("perm_due_overdue_installments").checked
    }
  };

  const success = await saveShopUserPermissions(activeShopSlug, permsObj);
  if (success) {
    showToast("تم حفظ صلاحيات المستخدم بنجاح!");
    closeUserPermissionsModal();
  } else {
    showToast("حدث خطأ أثناء حفظ الصلاحيات بالسحابة", "danger");
  }
}

// --- 2. SYSTEM SETTINGS LOGIC ---
function switchSysTab(tabId, btnElement) {
  const contents = document.querySelectorAll("#systemSettingsModalOverlay .sys-tab-content");
  contents.forEach(c => c.classList.remove("active"));
  
  const buttons = document.querySelectorAll("#systemSettingsModalOverlay .menuegy-tab-btn");
  buttons.forEach(b => b.classList.remove("active"));
  
  const targetContent = document.getElementById(tabId);
  if (targetContent) targetContent.classList.add("active");
  if (btnElement) btnElement.classList.add("active");
}

async function openSystemSettingsModal() {
  const overlay = document.getElementById("systemSettingsModalOverlay");
  if (!overlay) return;

  const settings = await getShopSystemSettings(activeShopSlug);

  // Tab 1: General
  if (settings.general) {
    document.getElementById("sys_auto_deliver_sales").checked = settings.general.auto_deliver_sales !== false;
    document.getElementById("sys_images_save_path").value = settings.general.images_save_path || "/uploads/images/";
    document.getElementById("sys_invoice_print_copies").value = settings.general.invoice_print_copies || 1;
    document.getElementById("sys_lock_invoice_edit_before").value = settings.general.lock_invoice_edit_before || "2000-01-01";
  }

  // Tab 2: Custom Fields
  if (settings.custom_fields) {
    document.getElementById("sys_item_field1").value = settings.custom_fields.item_field1 || "الماركة";
    document.getElementById("sys_item_field2").value = settings.custom_fields.item_field2 || "الموديل";
    document.getElementById("sys_item_field3").value = settings.custom_fields.item_field3 || "اسم المورد";

    document.getElementById("sys_account_field1").value = settings.custom_fields.account_field1 || "المدينة";
    document.getElementById("sys_account_field2").value = settings.custom_fields.account_field2 || "الدولة";
    document.getElementById("sys_account_field3").value = settings.custom_fields.account_field3 || "التصنيف الفرعي";

    document.getElementById("sys_invoice_field1").value = settings.custom_fields.invoice_field1 || "اسم المستلم";
    document.getElementById("sys_invoice_field2").value = settings.custom_fields.invoice_field2 || "رقم السيارة";
    document.getElementById("sys_invoice_field3").value = settings.custom_fields.invoice_field3 || "";

    document.getElementById("sys_item_extra_label1").value = settings.custom_fields.item_extra_label1 || "اللون";
    document.getElementById("sys_item_extra_label2").value = settings.custom_fields.item_extra_label2 || "الكرتونة";
  }

  // Tab 3: Taxes & E-invoicing
  if (settings.taxes_einvoicing) {
    document.getElementById("sys_tax_reg_number").value = settings.taxes_einvoicing.tax_reg_number || "100-200-300";
    document.getElementById("sys_commercial_reg_number").value = settings.taxes_einvoicing.commercial_reg_number || "987654";
    document.getElementById("sys_vat_name1").value = settings.taxes_einvoicing.vat_name1 || "ضريبة القيمة المضافة";
    document.getElementById("sys_vat_pct1").value = settings.taxes_einvoicing.vat_pct1 || 14;
    document.getElementById("sys_auto_add_sell1").checked = settings.taxes_einvoicing.auto_add_sell1 !== false;
    document.getElementById("sys_auto_add_buy1").checked = settings.taxes_einvoicing.auto_add_buy1 === true;
    document.getElementById("sys_einvoicing_active").checked = settings.taxes_einvoicing.einvoicing_active !== false;
    document.getElementById("sys_einvoice_qr").checked = settings.taxes_einvoicing.einvoice_qr !== false;
  }

  // Tab 4: Passwords
  if (settings.security) {
    document.getElementById("sys_backup_protect_pass").value = settings.security.backup_protect_pass || "menu123";
    document.getElementById("sys_restricted_user_pass").value = settings.security.restricted_user_pass || "super999";
  }

  // Tab 5: Scale Barcode
  if (settings.scale_barcode) {
    document.getElementById("sys_enable_scale_barcode").checked = settings.scale_barcode.enable_scale_barcode !== false;
    document.getElementById("sys_scale_prefix").value = settings.scale_barcode.scale_prefix || "00";
    document.getElementById("sys_total_barcode_digits").value = settings.scale_barcode.total_barcode_digits || 13;
    document.getElementById("sys_item_code_digits").value = settings.scale_barcode.item_code_digits || 5;
    document.getElementById("sys_weight_digits").value = settings.scale_barcode.weight_digits || 5;
  }

  // Tab 6: Restaurant Setup
  if (settings.restaurant_setup) {
    document.getElementById("sys_enable_restaurant_mode").checked = settings.restaurant_setup.enable_restaurant_mode !== false;
  }

  overlay.classList.add("open");
}

function closeSystemSettingsModal() {
  const overlay = document.getElementById("systemSettingsModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

async function saveSystemSettingsForm() {
  const sysObj = {
    general: {
      auto_deliver_sales: document.getElementById("sys_auto_deliver_sales").checked,
      images_save_path: document.getElementById("sys_images_save_path").value.trim(),
      invoice_print_copies: parseInt(document.getElementById("sys_invoice_print_copies").value) || 1,
      lock_invoice_edit_before: document.getElementById("sys_lock_invoice_edit_before").value
    },
    custom_fields: {
      item_field1: document.getElementById("sys_item_field1").value.trim(),
      item_field2: document.getElementById("sys_item_field2").value.trim(),
      item_field3: document.getElementById("sys_item_field3").value.trim(),
      account_field1: document.getElementById("sys_account_field1").value.trim(),
      account_field2: document.getElementById("sys_account_field2").value.trim(),
      account_field3: document.getElementById("sys_account_field3").value.trim(),
      invoice_field1: document.getElementById("sys_invoice_field1").value.trim(),
      invoice_field2: document.getElementById("sys_invoice_field2").value.trim(),
      invoice_field3: document.getElementById("sys_invoice_field3").value.trim(),
      item_extra_label1: document.getElementById("sys_item_extra_label1").value.trim(),
      item_extra_label2: document.getElementById("sys_item_extra_label2").value.trim()
    },
    taxes_einvoicing: {
      tax_reg_number: document.getElementById("sys_tax_reg_number").value.trim(),
      commercial_reg_number: document.getElementById("sys_commercial_reg_number").value.trim(),
      vat_name1: document.getElementById("sys_vat_name1").value.trim(),
      vat_pct1: parseFloat(document.getElementById("sys_vat_pct1").value) || 14,
      auto_add_sell1: document.getElementById("sys_auto_add_sell1").checked,
      auto_add_buy1: document.getElementById("sys_auto_add_buy1").checked,
      einvoicing_active: document.getElementById("sys_einvoicing_active").checked,
      einvoice_qr: document.getElementById("sys_einvoice_qr").checked
    },
    security: {
      backup_protect_pass: document.getElementById("sys_backup_protect_pass").value,
      restricted_user_pass: document.getElementById("sys_restricted_user_pass").value
    },
    scale_barcode: {
      enable_scale_barcode: document.getElementById("sys_enable_scale_barcode").checked,
      scale_prefix: document.getElementById("sys_scale_prefix").value.trim(),
      total_barcode_digits: parseInt(document.getElementById("sys_total_barcode_digits").value) || 13,
      item_code_digits: parseInt(document.getElementById("sys_item_code_digits").value) || 5,
      weight_digits: parseInt(document.getElementById("sys_weight_digits").value) || 5
    },
    restaurant_setup: {
      enable_restaurant_mode: document.getElementById("sys_enable_restaurant_mode").checked
    }
  };

  const success = await saveShopSystemSettings(activeShopSlug, sysObj);
  if (success) {
    showToast("تم حفظ إعدادات النظام والفوترة وطابعات المطعم بنجاح!");
    closeSystemSettingsModal();
  } else {
    showToast("حدث خطأ أثناء حفظ الإعدادات بالسحابة", "danger");
  }
}

// --- 3. SUBSCRIPTION MODAL LOGIC ---
async function openSubscriptionModal() {
  const overlay = document.getElementById("subscriptionModalOverlay");
  if (!overlay) return;

  try {
    const shop = await getShopProfile(activeShopSlug);
    if (shop) {
      const subCompName = document.getElementById("subCompName");
      const subMobile = document.getElementById("subMobile");
      if (subCompName) subCompName.textContent = shop.name || "بيت الهدايا والتوريدات";
      if (subMobile) subMobile.textContent = shop.whatsapp_number ? `+${shop.whatsapp_number}` : "+201061936565";
    }
  } catch (err) {
    console.error("Error loading subscription modal info:", err);
  }

  overlay.classList.add("open");
}

function closeSubscriptionModal() {
  const overlay = document.getElementById("subscriptionModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

// --- 4. BARCODE LABEL PRINTING LOGIC ---
async function openBarcodeModal(productId = null) {
  const overlay = document.getElementById("barcodeModalOverlay");
  if (!overlay) return;

  // Populate product dropdown
  populateBarcodeProductSelect(productId);
  updateBarcodePreview();

  overlay.classList.add("open");
}

function closeBarcodeModal() {
  const overlay = document.getElementById("barcodeModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

function populateBarcodeProductSelect(selectedId = null) {
  const select = document.getElementById("barcodeProductSelect");
  if (!select) return;

  if (products.length === 0) {
    select.innerHTML = `<option value="">لا توجد منتجات مسجلة</option>`;
    return;
  }

  let optionsHtml = "";
  products.forEach(p => {
    const isSelected = selectedId && p.id === selectedId ? "selected" : "";
    optionsHtml += `<option value="${p.id}" ${isSelected}>${p.name} (${p.price} ج)</option>`;
  });

  select.innerHTML = optionsHtml;
}

async function updateBarcodePreview() {
  const select = document.getElementById("barcodeProductSelect");
  if (!select) return;

  const targetId = select.value;
  const product = products.find(p => p.id === targetId) || products[0];

  const shopNameEl = document.getElementById("prevShopName");
  const prodNameEl = document.getElementById("prevProdName");
  const priceValEl = document.getElementById("prevPriceVal");
  const unitValEl = document.getElementById("prevUnitVal");
  const barcodeInput = document.getElementById("barcodeValueInput");

  // Fetch shop name
  try {
    const shop = await getShopProfile(activeShopSlug);
    if (shopNameEl) shopNameEl.textContent = shop ? shop.name : "متجر MenuEgy";
  } catch (e) {
    if (shopNameEl) shopNameEl.textContent = "متجر MenuEgy";
  }

  if (product) {
    if (prodNameEl) prodNameEl.textContent = product.name;
    if (priceValEl) priceValEl.textContent = product.price;
    if (unitValEl) unitValEl.textContent = product.unit || "قطعة";

    // Standard numeric/alphanumeric code for barcode
    if (barcodeInput && (!barcodeInput.value || barcodeInput.dataset.prodId !== product.id)) {
      // Create a deterministic numeric code if no SKU exists
      const cleanNum = product.id.replace(/[^0-9]/g, '');
      const barcodeVal = "200" + (cleanNum ? cleanNum.padStart(9, '0').slice(-9) : "123456789");
      barcodeInput.value = barcodeVal;
      barcodeInput.dataset.prodId = product.id;
    }
  }

  // Toggle visible elements based on checkboxes
  const showShop = document.getElementById("bc_show_shop").checked;
  const showName = document.getElementById("bc_show_name").checked;
  const showPrice = document.getElementById("bc_show_price").checked;

  if (shopNameEl) shopNameEl.style.display = showShop ? "block" : "none";
  if (prodNameEl) prodNameEl.style.display = showName ? "block" : "none";
  const priceTag = document.getElementById("prevPriceTag");
  if (priceTag) priceTag.style.display = showPrice ? "block" : "none";

  renderLiveBarcodeSvg();
}

function renderLiveBarcodeSvg() {
  const barcodeInput = document.getElementById("barcodeValueInput");
  const barcodeCanvas = document.getElementById("barcodeCanvas");
  if (!barcodeInput || !barcodeCanvas) return;

  const codeVal = barcodeInput.value.trim() || "200000000001";

  if (typeof JsBarcode !== "undefined") {
    try {
      JsBarcode("#barcodeCanvas", codeVal, {
        format: "CODE128",
        lineColor: "#0f172a",
        width: 1.5,
        height: 35,
        displayValue: true,
        fontSize: 11,
        margin: 2
      });
    } catch (e) {
      console.warn("JsBarcode error, using fallback SVG:", e);
      renderSvgBarcodeFallback(barcodeCanvas, codeVal);
    }
  } else {
    renderSvgBarcodeFallback(barcodeCanvas, codeVal);
  }
}

// Pure SVG Barcode Generator Fallback (No External Library Dependency)
function renderSvgBarcodeFallback(svgElement, codeStr) {
  let barsHtml = `<rect x="0" y="0" width="100%" height="100%" fill="#fff"/>`;
  let currentX = 5;
  
  for (let i = 0; i < codeStr.length; i++) {
    const charCode = codeStr.charCodeAt(i);
    const width1 = (charCode % 3) + 1;
    const width2 = (charCode % 2) + 1;

    barsHtml += `<rect x="${currentX}" y="2" width="${width1}" height="30" fill="#0f172a"/>`;
    currentX += width1 + width2;
  }
  
  barsHtml += `<text x="50%" y="42" font-size="10" font-weight="bold" text-anchor="middle" fill="#0f172a">${codeStr}</text>`;
  svgElement.innerHTML = barsHtml;
}

// Print Barcode Stickers for Thermal Printer
function printBarcodeStickersNow() {
  const select = document.getElementById("barcodeProductSelect");
  if (!select || !select.value) {
    showToast("يرجى اختيار منتج لطباعة الباركود", "danger");
    return;
  }

  const product = products.find(p => p.id === select.value) || products[0];
  if (!product) return;

  const copies = parseInt(document.getElementById("barcodePrintCopies").value) || 1;
  const labelSize = document.getElementById("barcodeLabelSize").value || "38x25";
  const printerType = document.getElementById("barcodePrinterType") ? document.getElementById("barcodePrinterType").value : "roll";
  const barcodeVal = document.getElementById("barcodeValueInput").value.trim() || "200000000001";

  const showShop = document.getElementById("bc_show_shop").checked;
  const showName = document.getElementById("bc_show_name").checked;
  const showPrice = document.getElementById("bc_show_price").checked;
  const shopNameText = document.getElementById("prevShopName") ? document.getElementById("prevShopName").textContent : "متجر MenuEgy";

  // Build print grid (mode-roll for thermal roll printer, mode-a4 for A4 paper)
  let stickersHtml = `<div class="printable-stickers-grid mode-${printerType} size-${labelSize}">`;

  for (let i = 0; i < copies; i++) {
    stickersHtml += `
      <div class="printable-sticker-item">
        ${showShop ? `<div class="p-shop">${shopNameText}</div>` : ''}
        ${showName ? `<div class="p-name">${product.name}</div>` : ''}
        <svg class="p-barcode-svg" id="p_bc_${i}"></svg>
        ${showPrice ? `<div class="p-price">السعر: ${product.price} ج / ${product.unit || ''}</div>` : ''}
      </div>
    `;
  }
  stickersHtml += `</div>`;

  const printContainer = document.getElementById("barcodePrintContainer");
  printContainer.innerHTML = stickersHtml;

  // Render SVG barcode for each sticker item
  setTimeout(() => {
    for (let i = 0; i < copies; i++) {
      const svgEl = document.getElementById(`p_bc_${i}`);
      if (svgEl) {
        if (typeof JsBarcode !== "undefined") {
          try {
            JsBarcode(`#p_bc_${i}`, barcodeVal, {
              format: "CODE128",
              lineColor: "#000000",
              width: 1.2,
              height: 28,
              displayValue: true,
              fontSize: 9,
              margin: 1
            });
          } catch (err) {
            renderSvgBarcodeFallback(svgEl, barcodeVal);
          }
        } else {
          renderSvgBarcodeFallback(svgEl, barcodeVal);
        }
      }
    }

    // Trigger Print
    window.print();
  }, 150);
}

/* ==================================================== */
/* POS CASHIER TERMINAL & INVENTORY DEDUCTION SYSTEM */
/* ==================================================== */

let posCart = [];
let posSelectedCat = "all";

function openPosTerminalModal() {
  const overlay = document.getElementById("posTerminalModalOverlay");
  if (!overlay) return;
  
  posCart = [];
  posSelectedCat = "all";
  renderPosCategoriesBar();
  renderPosProductsGrid("all");
  renderPosCartTable();
  calculatePosTotals();
  
  overlay.classList.add("open");
  
  const scanInput = document.getElementById("posBarcodeScanInput");
  if (scanInput) {
    scanInput.value = "";
    setTimeout(() => scanInput.focus(), 200);
  }
}

function closePosTerminalModal() {
  const overlay = document.getElementById("posTerminalModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

function renderPosCategoriesBar() {
  const bar = document.getElementById("posCategoriesBar");
  if (!bar) return;

  const categories = ["all", ...new Set(products.map(p => p.category))];
  
  bar.innerHTML = categories.map(cat => {
    const label = cat === "all" ? "الكل" : (CATEGORY_LABELS[cat] || cat);
    const activeStyle = cat === posSelectedCat ? 'background: #15803d; color: #fff; border-color: #15803d;' : 'background: #f8fafc; color: #334155; border-color: #cbd5e1;';
    return `
      <button onclick="filterPosCategory('${cat}')" class="btn" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 20px; border: 1px solid; cursor: pointer; white-space: nowrap; ${activeStyle}">
        ${label}
      </button>
    `;
  }).join("");
}

function filterPosCategory(cat) {
  posSelectedCat = cat;
  renderPosCategoriesBar();
  renderPosProductsGrid(cat);
}

function renderPosProductsGrid(cat) {
  const grid = document.getElementById("posProductsGrid");
  if (!grid) return;

  const list = products.filter(p => (cat === "all" || p.category === cat) && p.available !== false);
  
  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 2rem;">لا توجد منتجات متوفرة بالأرقام الحالية</div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const qty = p.quantity !== undefined ? parseFloat(p.quantity) : 100;
    const isOut = qty <= 0;
    
    return `
      <div onclick="${isOut ? '' : `addToPosCart('${p.id}')`}" style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; cursor: ${isOut ? 'not-allowed' : 'pointer'}; background: ${isOut ? '#fff1f2' : '#ffffff'}; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: space-between; position: relative;">
        ${p.image_url ? `<img src="${p.image_url}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; margin-bottom: 4px;">` : `<div style="width: 45px; height: 45px; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #94a3b8; margin-bottom: 4px;"><i class="fa-solid fa-box"></i></div>`}
        <div style="font-size: 11px; font-weight: 700; color: #1e293b; line-height: 1.2; margin-bottom: 3px;">${p.name}</div>
        <div style="font-size: 12px; font-weight: 800; color: #16a34a;">${p.price} ج</div>
        <span style="font-size: 9px; padding: 1px 5px; border-radius: 3px; margin-top: 3px; ${isOut ? 'background: #fecdd3; color: #9f1239;' : 'background: #e2e8f0; color: #475569;'}">
          ${isOut ? 'نفدت الكمية' : `مخزون: ${qty}`}
        </span>
      </div>
    `;
  }).join("");
}

function addToPosCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const stockQty = product.quantity !== undefined ? parseFloat(product.quantity) : 100;
  
  const existing = posCart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty + 1 > stockQty) {
      showToast(`عذراً، الكمية المطلوبة تجاوزت المتاح بالرصيد بالمخزن الرئيسي (${stockQty})`, "warning");
      return;
    }
    existing.qty += 1;
  } else {
    if (stockQty <= 0) {
      showToast("عذراً، هذا المنتج نفذت كميته بالكامل بالمخزن الرئيسي", "danger");
      return;
    }
    posCart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      unit: product.unit || '',
      qty: 1
    });
  }

  renderPosCartTable();
  calculatePosTotals();
}

function updatePosCartQty(productId, delta) {
  const item = posCart.find(i => i.id === productId);
  if (!item) return;

  const product = products.find(p => p.id === productId);
  const stockQty = product ? (product.quantity !== undefined ? parseFloat(product.quantity) : 100) : 999;

  if (item.qty + delta > stockQty) {
    showToast(`المتاح بالمخزن الرئيسي فقط هو ${stockQty}`, "warning");
    return;
  }

  item.qty += delta;
  if (item.qty <= 0) {
    removePosCartItem(productId);
    return;
  }

  renderPosCartTable();
  calculatePosTotals();
}

function removePosCartItem(productId) {
  posCart = posCart.filter(i => i.id !== productId);
  renderPosCartTable();
  calculatePosTotals();
}

function renderPosCartTable() {
  const tbody = document.getElementById("posCartTableBody");
  if (!tbody) return;

  if (posCart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 2rem;">السلة فارغة، قم بمسح الباركود أو الضغط على المنتجات</td></tr>`;
    return;
  }

  tbody.innerHTML = posCart.map(item => {
    const total = (item.price * item.qty).toFixed(2);
    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 6px; font-weight: 700; color: #1e293b;">${item.name}</td>
        <td style="padding: 6px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
            <button onclick="updatePosCartQty('${item.id}', -1)" style="border:1px solid #cbd5e1; background:#fff; width:22px; height:22px; border-radius:3px; cursor:pointer;">-</button>
            <span style="font-weight: 800; min-width: 18px; text-align: center;">${item.qty}</span>
            <button onclick="updatePosCartQty('${item.id}', 1)" style="border:1px solid #cbd5e1; background:#fff; width:22px; height:22px; border-radius:3px; cursor:pointer;">+</button>
          </div>
        </td>
        <td style="padding: 6px; text-align: center; color: #475569;">${item.price} ج</td>
        <td style="padding: 6px; text-align: center; font-weight: 800; color: #16a34a;">${total} ج</td>
        <td style="padding: 6px; text-align: center;">
          <button onclick="removePosCartItem('${item.id}')" style="border:none; background:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      </tr>
    `;
  }).join("");
}

function calculatePosTotals() {
  const subTotal = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discountPct = parseFloat(document.getElementById("posDiscountPct")?.value) || 0;
  
  // Apply permissions check for discounts
  const role = sessionStorage.getItem("tenant_user_role");
  if (role !== "owner" && window.currentSubUserPermissions) {
    const perms = window.currentSubUserPermissions;
    if (perms.invoices) {
      if (perms.invoices.discount === false) {
        discountPct = 0;
        if (document.getElementById("posDiscountPct")) document.getElementById("posDiscountPct").value = 0;
      } else if (perms.invoices.max_discount !== undefined) {
        if (discountPct > perms.invoices.max_discount) {
          discountPct = perms.invoices.max_discount;
          if (document.getElementById("posDiscountPct")) document.getElementById("posDiscountPct").value = discountPct;
          showToast(`أقصى نسبة خصم مسموحة لك هي ${discountPct}%`, "warning");
        }
      }
    }
  }

  const isVatActive = document.getElementById("posVatActive")?.checked;
  const discountVal = subTotal * (discountPct / 100);
  const afterDiscount = Math.max(0, subTotal - discountVal);
  const vatVal = isVatActive ? (afterDiscount * 0.14) : 0;
  const finalTotal = afterDiscount + vatVal;

  if (document.getElementById("posSubTotalVal")) document.getElementById("posSubTotalVal").textContent = `${subTotal.toFixed(2)} ج`;
  if (document.getElementById("posVatVal")) document.getElementById("posVatVal").textContent = `${vatVal.toFixed(2)} ج`;
  if (document.getElementById("posFinalTotalVal")) document.getElementById("posFinalTotalVal").textContent = `${finalTotal.toFixed(2)} ج`;
}

function handlePosBarcodeScan(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    triggerPosBarcodeAdd();
  }
}

function triggerPosBarcodeAdd() {
  const input = document.getElementById("posBarcodeScanInput");
  if (!input || !input.value.trim()) return;

  const query = input.value.trim().toLowerCase();
  
  // Match barcode or product name
  const match = products.find(p => p.barcode === query || p.name.toLowerCase().includes(query));
  
  if (match) {
    addToPosCart(match.id);
    input.value = "";
    showToast(`تمت إضافة "${match.name}" لسلة الفاتورة`);
  } else {
    showToast(`عذراً، لم يتم العثور على صنف بالباركود أو الاسم: ${query}`, "warning");
  }
}

// Complete Order, Deduct Inventory Stock, and Print POS Receipt
async function completePosOrderAndPrint() {
  if (posCart.length === 0) {
    showToast("سلة الفاتورة فارغة!", "danger");
    return;
  }

  const shopNameText = document.getElementById("adminFooterShopName")?.textContent || "متجر MenuEgy";
  const paymentMethod = document.getElementById("posPaymentMethod")?.value || "cash";
  const paymentMethodText = paymentMethod === "cash" ? "نقداً (كاش)" : paymentMethod === "card" ? "بطاقة إلكترونية" : paymentMethod === "credit" ? "حساب آجل" : "تقسيط";

  const subTotal = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountPct = parseFloat(document.getElementById("posDiscountPct")?.value) || 0;
  const isVatActive = document.getElementById("posVatActive")?.checked;
  const discountVal = subTotal * (discountPct / 100);
  const afterDiscount = Math.max(0, subTotal - discountVal);
  const vatVal = isVatActive ? (afterDiscount * 0.14) : 0;
  const finalTotal = afterDiscount + vatVal;

  const now = new Date();
  const invoiceNum = "INV-" + Math.floor(100000 + Math.random() * 900000);
  const dateStr = now.toLocaleDateString("ar-EG") + " " + now.toLocaleTimeString("ar-EG");

  // 1. Deduct Stock Quantity from DB & Local State and Build Invoice Items
  const invoiceItemsArr = [];
  for (const cartItem of posCart) {
    const pIndex = products.findIndex(p => p.id === cartItem.id);
    let costPrice = 0;
    
    if (pIndex !== -1) {
      costPrice = parseFloat(products[pIndex].cost_price) || 0;
      const currentQty = products[pIndex].quantity !== undefined ? parseFloat(products[pIndex].quantity) : 100;
      const newQty = Math.max(0, currentQty - cartItem.qty);
      products[pIndex].quantity = newQty;
      
      // Save updated product stock to Supabase DB
      await saveShopProduct(products[pIndex]);
    }
    
    invoiceItemsArr.push({
      product_id: cartItem.id,
      product_name: cartItem.name,
      qty: cartItem.qty,
      cost_price: costPrice,
      sale_price: cartItem.price,
      total_price: cartItem.qty * cartItem.price
    });
  }
  
  // Save Invoice Header to DB
  const user = sessionStorage.getItem("tenant_user_name") || "Cashier";
  const invoiceHeader = {
    shop_id: activeShopSlug,
    invoice_num: invoiceNum,
    type: "sales",
    payment_method: paymentMethod,
    subtotal: subTotal,
    discount: discountPct,
    vat: vatVal,
    final_total: finalTotal,
    user_id: user
  };
  
  await saveInvoiceData(invoiceHeader, invoiceItemsArr);

  // Update Admin Stats & Table
  updateStats();
  applyFiltersAndRender();

  // 2. Build POS Receipt HTML
  let receiptHtml = `
    <div class="pos-receipt-box">
      <header>
        <h2 style="margin:0 0 3px 0; font-size:14pt; font-weight:bold;">${shopNameText}</h2>
        <div style="font-size:8pt;">منصة المتاجر والمنيو الإلكتروني الذكي</div>
        <div style="font-size:8pt; margin-top:2mm;">رقم الفاتورة: <strong>${invoiceNum}</strong></div>
        <div style="font-size:7pt; color:#444;">التاريخ: ${dateStr}</div>
        <div style="font-size:8pt; font-weight:bold; margin-top:1mm;">طريقة الدفع: ${paymentMethodText}</div>
      </header>

      <table class="pos-receipt-table">
        <thead>
          <tr>
            <th style="text-align:right;">الصنف</th>
            <th style="text-align:center;">الكمية</th>
            <th style="text-align:center;">السعر</th>
            <th style="text-align:left;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${posCart.map(item => `
            <tr>
              <td style="text-align:right;">${item.name}</td>
              <td style="text-align:center;">${item.qty}</td>
              <td style="text-align:center;">${item.price}</td>
              <td style="text-align:left;">${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="border-top:1px dashed #000; padding-top:2mm; margin-top:2mm; font-size:8pt;">
        <div style="display:flex; justify-content:space-between;">
          <span>المجموع الفرعي:</span>
          <span>${subTotal.toFixed(2)} ج</span>
        </div>
        ${discountPct > 0 ? `
          <div style="display:flex; justify-content:space-between; color:#b91c1c;">
            <span>الخصم (${discountPct}%):</span>
            <span>-${discountVal.toFixed(2)} ج</span>
          </div>
        ` : ''}
        ${isVatActive ? `
          <div style="display:flex; justify-content:space-between;">
            <span>ضريبة القيمة المضافة (14% VAT):</span>
            <span>${vatVal.toFixed(2)} ج</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; font-size:11pt; font-weight:bold; border-top:1px solid #000; margin-top:1.5mm; padding-top:1.5mm;">
          <span>الإجمالي الكلي:</span>
          <span>${finalTotal.toFixed(2)} ج</span>
        </div>
      </div>

      <div style="text-align:center; margin-top:4mm; font-size:8pt; border-top:1px dashed #ccc; padding-top:3mm;">
        <div>شكراً لتعاملكم معنا! نتمنى لكم يوماً سعيداً</div>
        <div style="font-size:7pt; color:#666; margin-top:1mm;">تم خصم كمية المشتريات تلقائياً من المخزن الرئيسي</div>
      </div>
    </div>
  `;

  const receiptContainer = document.getElementById("posReceiptPrintContainer");
  if (receiptContainer) {
    receiptContainer.innerHTML = receiptHtml;
  }
  
  // 3. Add to Treasury if payment is cash
  if (paymentMethod === "cash" && finalTotal > 0) {
    const user = sessionStorage.getItem("tenant_user_name") || "Cashier";
    await addTreasuryTransaction(activeShopSlug, "income", finalTotal, "مبيعات نقدية POS", `فاتورة رقم ${invoiceNum}`, user);
  }

  showToast(`تم حفظ الفاتورة بنجاح! وخصم الكميات من المخزن الرئيسي.`);
  
  // Reset Cart & Close Modal
  posCart = [];
  closePosTerminalModal();

  // Trigger Print
  setTimeout(() => {
    window.print();
  }, 100);
}

/* ==================================================== */
/* SHOP SUB-USERS & CASHIERS MANAGEMENT SYSTEM */
/* ==================================================== */

let activeShopProfile = null;

async function openShopUsersModal() {
  const overlay = document.getElementById("shopUsersModalOverlay");
  if (!overlay) return;

  if (!activeShopProfile) {
    activeShopProfile = await getShopProfile(activeShopSlug);
  }

  // Update Quota labels
  const maxMain = activeShopProfile ? (activeShopProfile.max_main_users || 1) : 1;
  const maxSub = activeShopProfile ? (activeShopProfile.max_sub_users !== undefined ? activeShopProfile.max_sub_users : 3) : 3;
  const currentSubUsers = activeShopProfile && activeShopProfile.sub_users ? activeShopProfile.sub_users.length : 0;

  if (document.getElementById("quotaMainUsersVal")) document.getElementById("quotaMainUsersVal").textContent = maxMain;
  if (document.getElementById("quotaSubUsersVal")) document.getElementById("quotaSubUsersVal").textContent = maxSub;
  if (document.getElementById("quotaCurrentUsageBadge")) {
    document.getElementById("quotaCurrentUsageBadge").textContent = `المستخدمين الفرعيين المضافين: ${currentSubUsers} / ${maxSub}`;
    document.getElementById("quotaCurrentUsageBadge").style.background = currentSubUsers >= maxSub ? '#fecdd3' : '#dbeafe';
    document.getElementById("quotaCurrentUsageBadge").style.color = currentSubUsers >= maxSub ? '#9f1239' : '#1e40af';
  }

  // Reset form
  document.getElementById("subUserIdInput").value = "";
  document.getElementById("subUserUsernameInput").value = "";
  document.getElementById("subUserPasswordInput").value = "";
  document.getElementById("subUserFullNameInput").value = "";

  renderSubUsersTable();
  overlay.classList.add("open");
}

function closeShopUsersModal() {
  const overlay = document.getElementById("shopUsersModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

function renderSubUsersTable() {
  const tbody = document.getElementById("subUsersTableBody");
  if (!tbody) return;

  const subUsers = activeShopProfile && activeShopProfile.sub_users ? activeShopProfile.sub_users : [];

  if (subUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 1.5rem;">لا يوجد مستخدمين أو كاشير مضافين حالياً</td></tr>`;
    return;
  }

  tbody.innerHTML = subUsers.map(user => {
    const roleLabel = user.role === 'cashier' ? 'كاشير نقطة بيع (POS)' : user.role === 'manager' ? 'مدير فرع' : 'محاسب';
    const roleBadgeColor = user.role === 'cashier' ? 'background:#dcfce7; color:#166534;' : 'background:#e0f2fe; color:#0369a1;';

    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px; font-weight: 700; color: #1e293b;">${user.full_name}</td>
        <td style="padding: 8px;"><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${user.username}</code></td>
        <td style="padding: 8px;"><span style="padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; ${roleBadgeColor}">${roleLabel}</span></td>
        <td style="padding: 8px; text-align: center;">
          <button onclick="deleteSubUser('${user.id}')" style="border: none; background: none; color: #ef4444; cursor: pointer;" title="حذف المستخدم"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      </tr>
    `;
  }).join("");
}

async function saveSubUserForm(event) {
  event.preventDefault();

  if (!activeShopProfile) {
    activeShopProfile = await getShopProfile(activeShopSlug);
  }

  const maxSub = activeShopProfile ? (activeShopProfile.max_sub_users !== undefined ? activeShopProfile.max_sub_users : 3) : 3;
  const currentSubUsers = activeShopProfile && activeShopProfile.sub_users ? activeShopProfile.sub_users : [];

  const username = document.getElementById("subUserUsernameInput").value.trim().toLowerCase();
  const password = document.getElementById("subUserPasswordInput").value.trim();
  const full_name = document.getElementById("subUserFullNameInput").value.trim();
  const role = document.getElementById("subUserRoleInput").value;

  if (!username || !password || !full_name) {
    showToast("يرجى ملء كافة حقول بيانات الكاشير!", "danger");
    return;
  }

  // Check quota on addition
  if (currentSubUsers.length >= maxSub) {
    showToast(`وصلت للحد الأقصى المسموح به للمستخدمين الكاشير باشتراكك (${maxSub} مستخدم)! تواصل مع الإدارة لزيادة الكوتا.`, "danger");
    return;
  }

  // Check username collision
  if (currentSubUsers.some(u => u.username === username)) {
    showToast("اسم الدخول هذا مستخدم بالفعل لكاشير آخر!", "warning");
    return;
  }

  const newUser = {
    id: "user_" + Math.random().toString(36).substr(2, 9),
    username,
    password,
    full_name,
    role,
    created_at: new Date().toISOString()
  };

  currentSubUsers.push(newUser);
  activeShopProfile.sub_users = currentSubUsers;

  showToast("جاري حفظ حساب الكاشير الجديد...", "info");

  // Save to Supabase DB
  const res = await saveShopProfile(activeShopProfile);
  if (res.success) {
    showToast(`تمت إضافة حساب الكاشير (${full_name}) بنجاح!`);
    document.getElementById("subUserForm").reset();
    openShopUsersModal();
  } else {
    showToast("حدث خطأ أثناء حفظ المستخدم في السحابة.", "danger");
  }
}

async function deleteSubUser(userId) {
  if (!confirm("هل أنت متأكد من رغبتك في حذف حساب الكاشير هذا؟")) return;

  if (!activeShopProfile) {
    activeShopProfile = await getShopProfile(activeShopSlug);
  }

  let currentSubUsers = activeShopProfile && activeShopProfile.sub_users ? activeShopProfile.sub_users : [];
  currentSubUsers = currentSubUsers.filter(u => u.id !== userId);
  activeShopProfile.sub_users = currentSubUsers;

  showToast("جاري حذف الحساب...", "info");

  const res = await saveShopProfile(activeShopProfile);
  if (res.success) {
    showToast("تم حذف الحساب بنجاح.");
    openShopUsersModal();
  } else {
    showToast("فشل الحذف من السحابة.", "danger");
  }
}

/* ==================================================== */
/* NEW ERP SYSTEMS MODALS CONTROLLERS */
/* ==================================================== */

async function openReportsModal() {
  const overlay = document.getElementById("reportsModalOverlay");
  if (overlay) overlay.classList.add("open");
  
  // Set default to today
  const periodSelect = document.getElementById("reportPeriodSelect");
  if (periodSelect) periodSelect.value = "today";
  
  await renderAdvancedReports();
}

function closeReportsModal() {
  const overlay = document.getElementById("reportsModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

async function renderAdvancedReports() {
  const loading = document.getElementById("reportsLoadingSpinner");
  const content = document.getElementById("reportsContentWrapper");
  const period = document.getElementById("reportPeriodSelect")?.value || "today";
  
  if (loading) loading.style.display = "block";
  if (content) content.style.display = "none";
  
  const data = await getAdvancedReportsData(activeShopSlug, period);
  
  if (loading) loading.style.display = "none";
  if (content) content.style.display = "block";
  
  if (!data) return;
  
  document.getElementById("repTotalSales").textContent = `${data.totalSales.toFixed(2)} ج`;
  document.getElementById("repTotalCost").textContent = `${data.totalCost.toFixed(2)} ج`;
  document.getElementById("repTotalProfit").textContent = `${data.totalProfit.toFixed(2)} ج`;
  document.getElementById("repInvoicesCount").textContent = data.invoicesCount;
  
  const tbody = document.getElementById("repTopProductsBody");
  if (tbody) {
    if (data.sortedProducts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px; color:#64748b;">لا توجد مبيعات في هذه الفترة</td></tr>`;
    } else {
      tbody.innerHTML = data.sortedProducts.map(p => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; text-align: right; font-weight: bold; color: #1e293b;">${p.name}</td>
          <td style="padding: 12px; text-align: center;">
            <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem;">
              ${p.qty} وحدة
            </span>
          </td>
          <td style="padding: 12px; text-align: left; color: #16a34a; font-weight: bold;">${p.revenue.toFixed(2)} ج</td>
        </tr>
      `).join("");
    }
  }
}


async function openTreasuryModal() {
  const overlay = document.getElementById("treasuryModalOverlay");
  if (overlay) overlay.classList.add("open");
  
  // Refresh data whenever opened
  await updateTreasuryBalanceDisplay();
  await loadTreasuryTransactions();
}

function closeTreasuryModal() {
  const overlay = document.getElementById("treasuryModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

function openPurchasesModal() {
  const overlay = document.getElementById("purchasesModalOverlay");
  if (overlay) overlay.classList.add("open");
}
function closePurchasesModal() {
  const overlay = document.getElementById("purchasesModalOverlay");
  if (overlay) overlay.classList.remove("open");
}


// --- 3. PERMISSIONS ENFORCEMENT ---
function applyUserPermissions() {
  const role = sessionStorage.getItem("tenant_user_role");
  if (role === "owner") return; // Super admin has full access
  
  const permsStr = sessionStorage.getItem("tenant_user_permissions");
  if (!permsStr) return;
  
  try {
    const perms = JSON.parse(permsStr);
    
    // Helper to hide elements securely
    const hideEl = (id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    };
    
    // Menu Buttons
    if (!perms.general || perms.general.admin_app === false) {
      hideEl("btnUsersMenu");
    }
    
    if (!perms.advanced_reports || perms.advanced_reports.advanced_reports_access === false) {
      hideEl("btnReportsMenu");
    }
    
    if (!perms.treasury || perms.treasury.view_receipts === false && perms.treasury.view_expenses === false && perms.treasury.view_flow === false) {
      hideEl("btnTreasuryMenu");
    }
    
    if (!perms.invoices || perms.invoices.view_purchases === false) {
      hideEl("btnPurchasesMenu");
    }
    
    if (!perms.invoices || perms.invoices.sales_new === false) {
      hideEl("posTerminalMainBtn");
    }

    // Additional specific UI elements inside the POS itself
    // E.g. Add product button in admin table
    if (!perms.inventory || perms.inventory.item_new === false) {
      hideEl("adminAddNewProductBtn");
    }
    
    // Save the parsed permissions object globally for POS checks

    // Specific POS actions
    if (!perms.invoices || perms.invoices.discount === false) {
      const discountInput = document.getElementById("posDiscountPct");
      if (discountInput) {
        discountInput.disabled = true;
        discountInput.title = "غير مصرح لك بعمل خصم";
      }
    }

    // Specific Treasury Tabs
    if (perms.treasury) {
      if (perms.treasury.receipt_new === false) hideEl("tabBtnTreasuryIncome");
      if (perms.treasury.expense_new === false) hideEl("tabBtnTreasuryExpense");
      if (perms.treasury.view_flow === false) hideEl("tabBtnTreasuryLogs");
      if (perms.treasury.close_shift === false) hideEl("tabBtnTreasuryShift");
    }
    window.currentSubUserPermissions = perms;

  } catch (e) {
    console.error("Failed to parse user permissions", e);
  }
}

// ==========================================
// TREASURY & SHIFTS UI LOGIC
// ==========================================

function switchTreasuryTab(tabId, btnElement) {
  // Hide all tabs
  document.querySelectorAll('.treasury-tab-content').forEach(el => el.style.display = 'none');
  // Remove active class from all buttons
  document.querySelectorAll('.menuegy-tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab
  document.getElementById(tabId).style.display = 'block';
  btnElement.classList.add('active');
  
  if (tabId === 'treasuryLogs') {
    loadTreasuryTransactions();
  } else if (tabId === 'treasuryBalance' || tabId === 'treasuryShift') {
    updateTreasuryBalanceDisplay();
  }
}

async function updateTreasuryBalanceDisplay() {
  const balance = await getTreasuryBalanceSinceLastShift(activeShopSlug);
  const formatted = balance.toFixed(2) + " ج";
  
  if (document.getElementById("treasuryCurrentBalanceVal")) {
    document.getElementById("treasuryCurrentBalanceVal").textContent = formatted;
  }
  if (document.getElementById("shiftExpectedBalance")) {
    document.getElementById("shiftExpectedBalance").textContent = formatted;
    // Auto populate actual to match expected by default to save time, can be overridden
    const actualInput = document.getElementById("shiftActualBalance");
    if (actualInput && !actualInput.value) {
      actualInput.value = balance.toFixed(2);
      calculateShiftVariance();
    }
  }
}

async function loadTreasuryTransactions() {
  const tbody = document.getElementById("treasuryLogsTableBody");
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
  
  const txs = await getTreasuryTransactions(activeShopSlug);
  
  if (txs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">لا توجد حركات مسجلة حالياً.</td></tr>';
    return;
  }
  
  tbody.innerHTML = txs.map(tx => {
    const isIncome = tx.type === 'income';
    const color = isIncome ? '#16a34a' : '#dc2626';
    const icon = isIncome ? '<i class="fa-solid fa-arrow-down" style="color:#16a34a"></i>' : '<i class="fa-solid fa-arrow-up" style="color:#dc2626"></i>';
    const typeLabel = isIncome ? 'وارد' : 'منصرف';
    
    const dateStr = new Date(tx.created_at).toLocaleString('ar-EG');
    
    return `
      <tr>
        <td style="padding: 10px; font-weight: bold; color: ${color};">${icon} ${typeLabel}</td>
        <td style="padding: 10px; font-weight: bold;">${parseFloat(tx.amount).toFixed(2)} ج</td>
        <td style="padding: 10px;">${tx.category}</td>
        <td style="padding: 10px;">${tx.description || '-'}</td>
        <td style="padding: 10px; font-size: 0.85rem; color: #64748b;">${tx.user_id}</td>
        <td style="padding: 10px; font-size: 0.85rem; color: #64748b;" dir="ltr">${dateStr}</td>
      </tr>
    `;
  }).join('');
}

async function handleTreasuryTransaction(event, type) {
  event.preventDefault();
  
  const prefix = type === 'income' ? 'inc' : 'exp';
  const amount = document.getElementById(prefix + "Amount").value;
  const category = document.getElementById(prefix + "Category").value;
  const notes = document.getElementById(prefix + "Notes").value;
  const user = sessionStorage.getItem("tenant_user_name") || "Manager";
  
  if (!amount || amount <= 0) {
    showToast("يرجى إدخال مبلغ صحيح", "danger");
    return;
  }
  
  const success = await addTreasuryTransaction(activeShopSlug, type, amount, category, notes, user);
  if (success) {
    showToast(`تم تسجيل حركة ال${type === 'income' ? 'وارد' : 'منصرف'} بنجاح!`);
    event.target.reset();
    await updateTreasuryBalanceDisplay();
    // Switch to balance tab
    switchTreasuryTab('treasuryBalance', document.getElementById('tabBtnTreasuryBalance'));
  } else {
    showToast("حدث خطأ أثناء التسجيل. حاول مرة أخرى.", "danger");
  }
}

function calculateShiftVariance() {
  const expectedText = document.getElementById("shiftExpectedBalance").textContent.replace(' ج', '');
  const expected = parseFloat(expectedText) || 0;
  
  const actualInput = document.getElementById("shiftActualBalance").value;
  const actual = parseFloat(actualInput) || 0;
  
  const variance = actual - expected;
  const varianceBox = document.getElementById("shiftVarianceBox");
  
  if (!varianceBox) return;
  
  varianceBox.style.display = 'block';
  
  if (variance === 0) {
    varianceBox.style.background = '#f0fdf4';
    varianceBox.style.color = '#166534';
    varianceBox.style.border = '1px solid #86efac';
    varianceBox.innerHTML = '<i class="fa-solid fa-check-circle"></i> العهدة مطابقة تماماً (العجز/الزيادة: 0.00 ج)';
  } else if (variance > 0) {
    varianceBox.style.background = '#eff6ff';
    varianceBox.style.color = '#1d4ed8';
    varianceBox.style.border = '1px solid #93c5fd';
    varianceBox.innerHTML = `<i class="fa-solid fa-arrow-up"></i> يوجد زيادة في العهدة بمقدار: ${variance.toFixed(2)} ج`;
  } else {
    varianceBox.style.background = '#fef2f2';
    varianceBox.style.color = '#b91c1c';
    varianceBox.style.border = '1px solid #fca5a5';
    varianceBox.innerHTML = `<i class="fa-solid fa-arrow-down"></i> يوجد عجز في العهدة بمقدار: ${Math.abs(variance).toFixed(2)} ج`;
  }
}

async function confirmCloseShift() {
  const expectedText = document.getElementById("shiftExpectedBalance").textContent.replace(' ج', '');
  const expected = parseFloat(expectedText) || 0;
  
  const actualInput = document.getElementById("shiftActualBalance").value;
  if (!actualInput) {
    showToast("يرجى إدخال النقدية الفعلية أولاً", "warning");
    return;
  }
  const actual = parseFloat(actualInput);
  
  const floatInput = document.getElementById("shiftFloatAmount").value;
  const floatAmount = parseFloat(floatInput) || 0;
  
  if (floatAmount > actual) {
    showToast("عفواً، لا يمكن أن تكون العهدة المتبقية أكبر من النقدية الفعلية بالدرج!", "danger");
    return;
  }
  
  const confirmMsg = `هل أنت متأكد من إقفال الوردية؟\nالنقدية الفعلية: ${actual} ج\nسيتم ترحيل مبلغ ${floatAmount} ج للوردية القادمة.`;
  if (!confirm(confirmMsg)) return;
  
  const user = sessionStorage.getItem("tenant_user_name") || "Manager";
  
  const success = await closeCurrentShift(activeShopSlug, user, expected, actual, floatAmount);
  if (success) {
    showToast("تم إقفال الوردية وتسليم العهدة بنجاح!");
    closeTreasuryModal();
  } else {
    showToast("فشل في إقفال الوردية. يرجى المحاولة مرة أخرى.", "danger");
  }
}

// ==========================================
// MONEY TRANSFERS LOGIC
// ==========================================

function openMoneyTransfersModal() {
  const overlay = document.getElementById("moneyTransfersModalOverlay");
  if (overlay) overlay.classList.add("open");
  resetTransferForm();
  renderTransfersTable();
}

function closeMoneyTransfersModal() {
  const overlay = document.getElementById("moneyTransfersModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

function resetTransferForm() {
  document.getElementById("transferType").value = "send";
  document.getElementById("transferPhone").value = "";
  document.getElementById("transferAmount").value = "0";
  document.getElementById("transferFee").value = "10";
  calculateTransferTotals();
}

function calculateTransferTotals() {
  const type = document.getElementById("transferType").value;
  const amount = parseFloat(document.getElementById("transferAmount").value) || 0;
  const fee = parseFloat(document.getElementById("transferFee").value) || 0;
  
  const textEl = document.getElementById("transferNetText");
  const valueEl = document.getElementById("transferNetValue");
  const hintEl = document.getElementById("transferTypeHint");
  
  if (type === "send") {
    // Customer wants to send money. They pay us Amount + Fee.
    textEl.textContent = "المطلوب استلامه من العميل (كاش):";
    valueEl.textContent = (amount + fee).toFixed(2) + " ج";
    valueEl.style.color = "#16a34a"; // Green (Income to drawer)
    hintEl.textContent = "تستلم كاش من العميل لترسله إلكترونياً (زيادة في الخزينة).";
  } else {
    // Customer wants to receive money. We pay them Amount, but we deduct our Fee.
    textEl.textContent = "المطلوب تسليمه للعميل (كاش):";
    valueEl.textContent = (amount - fee).toFixed(2) + " ج";
    valueEl.style.color = "#dc2626"; // Red (Expense from drawer)
    hintEl.textContent = "تسلم العميل كاش مقابل رصيد إلكتروني أرسله لك (سحب من الخزينة).";
  }
}

async function submitMoneyTransfer() {
  const type = document.getElementById("transferType").value;
  const phone = document.getElementById("transferPhone").value.trim();
  const amount = parseFloat(document.getElementById("transferAmount").value) || 0;
  const fee = parseFloat(document.getElementById("transferFee").value) || 0;
  
  if (!phone) {
    showToast("يرجى إدخال رقم الهاتف!", "warning");
    return;
  }
  
  if (amount <= 0) {
    showToast("يرجى إدخال مبلغ صحيح للتحويل!", "warning");
    return;
  }
  
  const net = type === "send" ? amount + fee : amount - fee;
  
  // 1. Save Transfer Record
  const user = sessionStorage.getItem("tenant_user_name") || "Cashier";
  const success = await saveMoneyTransferData({
    shop_id: activeShopSlug,
    type: type,
    phone_number: phone,
    amount: amount,
    fee: fee,
    net_amount: net,
    user_id: user
  });
  
  if (!success) {
    showToast("حدث خطأ أثناء حفظ التحويل", "danger");
    return;
  }
  
  // 2. Add to Treasury
  if (type === "send") {
    // We received (Amount + Fee) Cash
    await addTreasuryTransaction(activeShopSlug, "income", amount, "تحويل وارد (إرسال)", `استلام نقدي لتحويل لـ ${phone}`, user);
    if (fee > 0) await addTreasuryTransaction(activeShopSlug, "income", fee, "إيراد رسوم خدمة", `عمولة تحويل لـ ${phone}`, user);
  } else {
    // We paid out (Amount - Fee) Cash
    // Note: We received electronic money equal to 'amount', but the drawer pays out 'net'.
    // So we record an expense of 'amount' and an income of 'fee' to balance it, or just one expense of 'net'.
    // Since we are tracking the physical cash drawer:
    await addTreasuryTransaction(activeShopSlug, "expense", amount, "تحويل منصرف (استقبال)", `تسليم نقدي لحوالة من ${phone}`, user);
    if (fee > 0) await addTreasuryTransaction(activeShopSlug, "income", fee, "إيراد رسوم خدمة", `عمولة استقبال من ${phone}`, user);
  }
  
  showToast("تم تنفيذ العملية وتسجيلها بالخزينة بنجاح", "success");
  resetTransferForm();
  renderTransfersTable();
  if (typeof updateTreasuryBalanceDisplay === "function") {
    updateTreasuryBalanceDisplay();
  }
}

async function renderTransfersTable() {
  const tbody = document.getElementById("transfersTableBody");
  if (!tbody) return;
  
  const data = await getRecentMoneyTransfers(activeShopSlug, 20);
  
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:#64748b;">لا توجد تحويلات حديثة</td></tr>`;
    return;
  }
  
  tbody.innerHTML = data.map(t => {
    const isSend = t.type === "send";
    const typeLabel = isSend ? 
      `<span style="background: #dcfce3; color: #16a34a; padding: 3px 8px; border-radius: 12px;"><i class="fa-solid fa-arrow-up"></i> إرسال</span>` : 
      `<span style="background: #fee2e2; color: #dc2626; padding: 3px 8px; border-radius: 12px;"><i class="fa-solid fa-arrow-down"></i> استقبال</span>`;
    
    const d = new Date(t.created_at);
    const timeStr = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${typeLabel}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${t.phone_number}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
          <div>${parseFloat(t.amount).toFixed(0)} ج</div>
          <div style="font-size: 0.7rem; color: #64748b;">الرسوم: ${parseFloat(t.fee).toFixed(0)} ج</div>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 0.8rem; color: #64748b;">${timeStr}</td>
      </tr>
    `;
  }).join("");
}

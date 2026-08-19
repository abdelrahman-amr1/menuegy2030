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
      // Set admin document title
      document.title = `لوحة تحكم | ${shop.name}`;
      
      // Update page labels
      document.getElementById("adminHeaderTitle").textContent = `لوحة إدارة | ${shop.name}`;
      document.getElementById("adminHeaderSubtitle").textContent = shop.slogan || "لوحة تحكم المتجر وإدارة الأسعار";
      document.getElementById("adminFooterShopName").textContent = shop.name;

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
    
    await loadAdminProducts();
  } else {
    if (loginContainer) loginContainer.style.display = "flex";
    if (dashboardContent) dashboardContent.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (goToStoreBtn) goToStoreBtn.style.display = "none";
  }
}

// Handle Login Form Submission
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

  try {
    const shop = await getShopProfile(shopSlug);
    
    if (!shop) {
      errorMsg.textContent = "عذراً، هذا المتجر غير مسجل بالمنصة!";
      errorMsg.style.display = "block";
      showToast("عذراً، هذا المتجر غير مسجل بالمنصة!", "danger");
      return;
    }

    if (shop.admin_username === user && shop.admin_password === pass) {
      sessionStorage.setItem("tenant_admin_auth", "true");
      sessionStorage.setItem("tenant_admin_shop_id", shopSlug);
      activeShopSlug = shopSlug;
      
      await checkAuth();
      showToast("تم تسجيل الدخول بنجاح! مرحباً بك.");
    } else {
      errorMsg.textContent = "خطأ في اسم المستخدم أو كلمة المرور الخاصة بالمتجر!";
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
        <td colspan="6" style="text-align: center; color: var(--gray-600); padding: 3rem;">
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
    
    tr.innerHTML = `
      <td>
        <span class="${categoryBadgeClass}">${categoryLabel}</span>
      </td>
      <td>
        <div style="display:flex; align-items:center; gap: 10px;">
          ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" style="width:35px; height:35px; object-fit:cover; border-radius:5px;">` : `<div style="width:35px; height:35px; background:var(--gray-200); border-radius:5px; display:flex; align-items:center; justify-content:center; color:var(--gray-500);"><i class="fa-solid fa-image"></i></div>`}
          <div>
            <strong style="color: var(--dark-color);">${p.name}</strong>
            ${p.description ? `<p style="font-size: 0.75rem; color: var(--gray-600); margin-top: 0.2rem; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${p.description}</p>` : ''}
          </div>
        </div>
      </td>
      <td><span style="font-weight: 700; color: var(--primary-color);">${p.price} ج</span></td>
      <td><span style="font-size: 0.85rem; color: var(--gray-600);">${p.unit}</span></td>
      <td style="text-align: center;">
        <label class="switch">
          <input type="checkbox" ${isAvailable ? 'checked' : ''} onchange="toggleProductAvailability('${p.id}', this.checked)">
          <span class="slider"></span>
        </label>
      </td>
      <td style="text-align: center;">
        <div style="display: flex; gap: 0.5rem; justify-content: center;">
          <button class="btn btn-outline" style="padding: 0.35rem 0.6rem;" onclick="openProductModal('${p.id}')" title="تعديل">
            <i class="fa-solid fa-pencil" style="color: var(--secondary-color)"></i>
          </button>
          <button class="btn btn-outline" style="padding: 0.35rem 0.6rem;" onclick="deleteProduct('${p.id}')" title="حذف">
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
    
    populateAdminCategorySelect("");
  } else {
    // Edit Mode
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    modalTitle.textContent = "تعديل بيانات المنتج";
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
  
  const buttons = document.querySelectorAll("#userPermissionsModalOverlay .sahl-tab-btn");
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
    document.getElementById("perm_view_sales_invoices").checked = perms.invoices.view_sales_invoices !== false;
    document.getElementById("perm_sales_new").checked = perms.invoices.sales_new !== false;
    document.getElementById("perm_sales_edit").checked = perms.invoices.sales_edit !== false;
    document.getElementById("perm_sales_delete").checked = perms.invoices.sales_delete === true;

    document.getElementById("perm_view_quotes").checked = perms.invoices.view_quotes !== false;
    document.getElementById("perm_quote_new").checked = perms.invoices.quote_new !== false;
    document.getElementById("perm_quote_edit").checked = perms.invoices.quote_edit !== false;
    document.getElementById("perm_quote_delete").checked = perms.invoices.quote_delete === true;

    document.getElementById("perm_view_purchases").checked = perms.invoices.view_purchases !== false;
    document.getElementById("perm_purchase_new").checked = perms.invoices.purchase_new !== false;
    document.getElementById("perm_purchase_edit").checked = perms.invoices.purchase_edit !== false;
    document.getElementById("perm_purchase_delete").checked = perms.invoices.purchase_delete === true;

    document.getElementById("perm_view_stocktake").checked = perms.invoices.view_stocktake !== false;
    document.getElementById("perm_view_branch_transfers").checked = perms.invoices.view_branch_transfers !== false;
    document.getElementById("perm_view_adjustments").checked = perms.invoices.view_adjustments !== false;

    document.getElementById("perm_view_expenses").checked = perms.invoices.view_expenses !== false;
    document.getElementById("perm_view_receipts").checked = perms.invoices.view_receipts !== false;
    document.getElementById("perm_transfer_safe_other").checked = perms.invoices.transfer_safe_other !== false;
    document.getElementById("perm_track_cheques").checked = perms.invoices.track_cheques !== false;

    document.getElementById("perm_allow_sale_edit_price").checked = perms.invoices.allow_sale_edit_price !== false;
    document.getElementById("perm_allow_invoice_discount").checked = perms.invoices.allow_invoice_discount !== false;
    document.getElementById("perm_max_discount_pct").value = perms.invoices.max_discount_pct || 10;
    document.getElementById("perm_allow_sale_below_cost").checked = perms.invoices.allow_sale_below_cost === true;
    document.getElementById("perm_view_invoice_profit").checked = perms.invoices.view_invoice_profit !== false;
    document.getElementById("perm_allow_credit_sales").checked = perms.invoices.allow_credit_sales !== false;
  }

  // Tab 3: Inventory
  if (perms.inventory) {
    document.getElementById("perm_view_items").checked = perms.inventory.view_items !== false;
    document.getElementById("perm_item_new").checked = perms.inventory.item_new !== false;
    document.getElementById("perm_item_edit").checked = perms.inventory.item_edit !== false;
    document.getElementById("perm_item_delete").checked = perms.inventory.item_delete === true;
    document.getElementById("perm_item_movement_report").checked = perms.inventory.item_movement_report !== false;
    document.getElementById("perm_stock_report").checked = perms.inventory.stock_report !== false;
    document.getElementById("perm_store_movement_report").checked = perms.inventory.store_movement_report !== false;
    document.getElementById("perm_view_cost_price").checked = perms.inventory.view_cost_price !== false;
    document.getElementById("perm_allow_negative_stock").checked = perms.inventory.allow_negative_stock === true;
    document.getElementById("perm_print_barcode_labels").checked = perms.inventory.print_barcode_labels !== false;
  }

  // Tab 4: Accounts
  if (perms.accounts) {
    document.getElementById("perm_view_accounts").checked = perms.accounts.view_accounts !== false;
    document.getElementById("perm_acc_new").checked = perms.accounts.acc_new !== false;
    document.getElementById("perm_acc_edit").checked = perms.accounts.acc_edit !== false;
    document.getElementById("perm_acc_delete").checked = perms.accounts.acc_delete === true;
    document.getElementById("perm_view_account_balance").checked = perms.accounts.view_account_balance !== false;
    document.getElementById("perm_view_account_statement").checked = perms.accounts.view_account_statement !== false;
    document.getElementById("perm_allowed_customer").checked = perms.accounts.allowed_customer !== false;
    document.getElementById("perm_allowed_supplier").checked = perms.accounts.allowed_supplier !== false;
    document.getElementById("perm_allowed_rep").checked = perms.accounts.allowed_rep !== false;
    document.getElementById("perm_allowed_other").checked = perms.accounts.allowed_other !== false;
  }

  // Tab 5: Treasury
  if (perms.treasury) {
    document.getElementById("perm_view_treasury_flow").checked = perms.treasury.view_treasury_flow !== false;
    document.getElementById("perm_analyze_receipts").checked = perms.treasury.analyze_receipts !== false;
    document.getElementById("perm_analyze_expenses").checked = perms.treasury.analyze_expenses !== false;
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
      view_sales_invoices: document.getElementById("perm_view_sales_invoices").checked,
      sales_new: document.getElementById("perm_sales_new").checked,
      sales_edit: document.getElementById("perm_sales_edit").checked,
      sales_delete: document.getElementById("perm_sales_delete").checked,
      view_quotes: document.getElementById("perm_view_quotes").checked,
      quote_new: document.getElementById("perm_quote_new").checked,
      quote_edit: document.getElementById("perm_quote_edit").checked,
      quote_delete: document.getElementById("perm_quote_delete").checked,
      view_purchases: document.getElementById("perm_view_purchases").checked,
      purchase_new: document.getElementById("perm_purchase_new").checked,
      purchase_edit: document.getElementById("perm_purchase_edit").checked,
      purchase_delete: document.getElementById("perm_purchase_delete").checked,
      view_stocktake: document.getElementById("perm_view_stocktake").checked,
      view_branch_transfers: document.getElementById("perm_view_branch_transfers").checked,
      view_adjustments: document.getElementById("perm_view_adjustments").checked,
      view_expenses: document.getElementById("perm_view_expenses").checked,
      view_receipts: document.getElementById("perm_view_receipts").checked,
      transfer_safe_other: document.getElementById("perm_transfer_safe_other").checked,
      track_cheques: document.getElementById("perm_track_cheques").checked,
      allow_sale_edit_price: document.getElementById("perm_allow_sale_edit_price").checked,
      allow_invoice_discount: document.getElementById("perm_allow_invoice_discount").checked,
      max_discount_pct: parseFloat(document.getElementById("perm_max_discount_pct").value) || 0,
      allow_sale_below_cost: document.getElementById("perm_allow_sale_below_cost").checked,
      view_invoice_profit: document.getElementById("perm_view_invoice_profit").checked,
      allow_credit_sales: document.getElementById("perm_allow_credit_sales").checked
    },
    inventory: {
      view_items: document.getElementById("perm_view_items").checked,
      item_new: document.getElementById("perm_item_new").checked,
      item_edit: document.getElementById("perm_item_edit").checked,
      item_delete: document.getElementById("perm_item_delete").checked,
      item_movement_report: document.getElementById("perm_item_movement_report").checked,
      stock_report: document.getElementById("perm_stock_report").checked,
      store_movement_report: document.getElementById("perm_store_movement_report").checked,
      view_cost_price: document.getElementById("perm_view_cost_price").checked,
      allow_negative_stock: document.getElementById("perm_allow_negative_stock").checked,
      print_barcode_labels: document.getElementById("perm_print_barcode_labels").checked
    },
    accounts: {
      view_accounts: document.getElementById("perm_view_accounts").checked,
      acc_new: document.getElementById("perm_acc_new").checked,
      acc_edit: document.getElementById("perm_acc_edit").checked,
      acc_delete: document.getElementById("perm_acc_delete").checked,
      view_account_balance: document.getElementById("perm_view_account_balance").checked,
      view_account_statement: document.getElementById("perm_view_account_statement").checked,
      allowed_customer: document.getElementById("perm_allowed_customer").checked,
      allowed_supplier: document.getElementById("perm_allowed_supplier").checked,
      allowed_rep: document.getElementById("perm_allowed_rep").checked,
      allowed_other: document.getElementById("perm_allowed_other").checked
    },
    treasury: {
      view_treasury_flow: document.getElementById("perm_view_treasury_flow").checked,
      analyze_receipts: document.getElementById("perm_analyze_receipts").checked,
      analyze_expenses: document.getElementById("perm_analyze_expenses").checked
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
  
  const buttons = document.querySelectorAll("#systemSettingsModalOverlay .sahl-tab-btn");
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
    document.getElementById("sys_images_save_path").value = settings.general.images_save_path || "C:\\SAHL\\UserFiles\\";
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
    document.getElementById("sys_backup_protect_pass").value = settings.security.backup_protect_pass || "sahl123";
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

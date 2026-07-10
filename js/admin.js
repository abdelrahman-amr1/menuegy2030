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
  famous: "الأشهر في أسوان"
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

// Super Admin Dashboard Controller - MenuEgy 2030

const MASTER_PASSWORD = "super_admin_2030";

document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  
  // Form elements
  const shopForm = document.getElementById("shopForm");
  const editShopMode = document.getElementById("editShopMode");
  const shopSlug = document.getElementById("shopSlug");
  const shopName = document.getElementById("shopName");
  const shopSlogan = document.getElementById("shopSlogan");
  const shopWhatsapp = document.getElementById("shopWhatsapp");
  const shopLogoUrl = document.getElementById("shopLogoUrl");
  const shopLogoFile = document.getElementById("shopLogoFile");
  const shopLogoPreviewContainer = document.getElementById("shopLogoPreviewContainer");
  const shopLogoPreview = document.getElementById("shopLogoPreview");
  const shopLogoUploadStatus = document.getElementById("shopLogoUploadStatus");
  const shopPrimaryColor = document.getElementById("shopPrimaryColor");
  const shopSecondaryColor = document.getElementById("shopSecondaryColor");
  const shopFreeShipping = document.getElementById("shopFreeShipping");
  const shopMaxProducts = document.getElementById("shopMaxProducts");
  const shopSubscriptionPlan = document.getElementById("shopSubscriptionPlan");
  const shopSubscriptionExpiry = document.getElementById("shopSubscriptionExpiry");
  const shopIsActive = document.getElementById("shopIsActive");
  const shopAdminUser = document.getElementById("shopAdminUser");
  const shopAdminPass = document.getElementById("shopAdminPass");
  const seedDefaultsCheck = document.getElementById("seedDefaultsCheck");
  const seedOptionsGroup = document.getElementById("seedOptionsGroup");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const formPanelTitle = document.getElementById("formPanelTitle");
  const saveShopBtn = document.getElementById("saveShopBtn");

  // Logo file upload handler
  if (shopLogoFile) {
    shopLogoFile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      shopLogoPreviewContainer.style.display = "block";
      shopLogoUploadStatus.style.color = "#d48a37";
      shopLogoUploadStatus.textContent = "⌛ جاري رفع شعار المحل...";
      shopLogoPreview.style.opacity = "0.5";

      try {
        const publicUrl = await uploadFileToSupabase(file, "logos");
        if (publicUrl) {
          shopLogoUrl.value = publicUrl;
          shopLogoPreview.src = publicUrl;
          shopLogoPreview.style.opacity = "1";
          shopLogoUploadStatus.style.color = "#4cd964";
          shopLogoUploadStatus.textContent = "✓ تم رفع الصورة بنجاح";
        } else {
          throw new Error("فشل الرفع");
        }
      } catch (err) {
        console.error(err);
        shopLogoUploadStatus.style.color = "#d9534f";
        shopLogoUploadStatus.textContent = "❌ فشل رفع الصورة";
        shopLogoPreviewContainer.style.display = "none";
        shopLogoUrl.value = "";
      }
    });
  }

  // Authentication Handling
  function initAuth() {
    const authOverlay = document.getElementById("superAuthModal");
    const passInput = document.getElementById("superPasswordInput");
    const loginBtn = document.getElementById("superLoginBtn");
    const errorMsg = document.getElementById("authErrorMsg");

    // Check session
    if (sessionStorage.getItem("super_auth") === "true") {
      authOverlay.style.display = "none";
      loadDashboard();
    }

    loginBtn.addEventListener("click", () => {
      if (passInput.value === MASTER_PASSWORD) {
        sessionStorage.setItem("super_auth", "true");
        authOverlay.style.display = "none";
        loadDashboard();
      } else {
        errorMsg.textContent = "الرقم السري خاطئ! يرجى المحاولة مرة أخرى.";
        errorMsg.style.display = "block";
      }
    });

    passInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") loginBtn.click();
    });
  }

  // Date formatter helper
  function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  // Default expiry date calculator
  function updateDefaultExpiry() {
    if (editShopMode.value === "true") return;
    const today = new Date();
    if (shopSubscriptionPlan.value === "starter") {
      today.setDate(today.getDate() + 30);
      shopMaxProducts.value = 50;
    } else if (shopSubscriptionPlan.value === "pro") {
      today.setDate(today.getDate() + 30);
      shopMaxProducts.value = 200;
    } else if (shopSubscriptionPlan.value === "business") {
      today.setDate(today.getDate() + 365);
      shopMaxProducts.value = 9999;
    } else if (shopSubscriptionPlan.value === "trial") {
      today.setDate(today.getDate() + 7);
      shopMaxProducts.value = 10;
    }
    shopSubscriptionExpiry.value = formatDate(today);
  }

  if (shopSubscriptionPlan) {
    shopSubscriptionPlan.addEventListener("change", updateDefaultExpiry);
    updateDefaultExpiry();
  }

  // Load stats and shop list
  async function loadDashboard() {
    // 1. Update stats counters
    const stats = await getSuperStats();
    document.getElementById("statShopsCount").textContent = stats.totalShops;
    document.getElementById("statProductsCount").textContent = stats.totalProducts;

    // 2. Fetch and render shops
    const shops = await getAllShops();
    const listContainer = document.getElementById("shopsListContainer");
    listContainer.innerHTML = "";

    if (shops.length === 0) {
      listContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #c9ad93;">
          <i class="fa-solid fa-circle-info" style="font-size: 30px; margin-bottom: 10px;"></i>
          <p>لا يوجد متاجر مسجلة حالياً. قم بإضافة أول متجر باستخدام النموذج الجانبي.</p>
        </div>
      `;
      return;
    }

    shops.forEach(shop => {
      const shopCard = document.createElement("div");
      shopCard.className = "shop-card";
      
      const logoHtml = shop.logo_url 
        ? `<img src="${shop.logo_url}" class="shop-logo-img" alt="logo" onerror="this.src=''; this.innerHTML='<i class=fa-solid fa-shop></i>'">`
        : `<div class="shop-logo-img"><i class="fa-solid fa-shop"></i></div>`;

      shopCard.innerHTML = `
        <div>
          <div class="shop-info">
            ${logoHtml}
            <div class="shop-title-desc">
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="margin: 0;">${shop.name}</h3>
                ${shop.is_active !== false 
                  ? `<span style="background: rgba(76, 217, 100, 0.15); color: #4cd964; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">نشط</span>`
                  : `<span style="background: rgba(217, 83, 79, 0.15); color: #d9534f; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">متوقف</span>`
                }
              </div>
              <p>${shop.slogan || "بدون وصف"}</p>
            </div>
          </div>
          
          <div class="shop-meta">
            <div class="meta-row">
              <span class="meta-label">الرابط المعرّف (Slug):</span>
              <span class="meta-val" style="font-family: monospace;">${shop.id}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">رقم الواتساب:</span>
              <span class="meta-val">${shop.whatsapp_number}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">الألوان المخصصة:</span>
              <span class="meta-val">
                <span style="display:inline-block; width:12px; height:12px; background:${shop.primary_color}; border-radius:50%; margin-left:5px;"></span>
                <span style="display:inline-block; width:12px; height:12px; background:${shop.secondary_color}; border-radius:50%;"></span>
              </span>
            </div>
            <div class="meta-row">
              <span class="meta-label">الشحن المجاني فوق:</span>
              <span class="meta-val">${shop.free_shipping_limit} جنيه</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">الحد الأقصى للمنتجات:</span>
              <span class="meta-val" style="font-weight: 700; color: var(--super-accent);">${shop.max_products_limit !== undefined && shop.max_products_limit !== null ? shop.max_products_limit : 50} منتج</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">باقة الاشتراك:</span>
              <span class="meta-val" style="font-weight: 700;">${shop.subscription_plan === 'pro' ? 'الاحترافية 🌟' : shop.subscription_plan === 'business' ? 'الأعمال 💼' : shop.subscription_plan === 'trial' ? 'تجريبي 🎁' : 'الأساسية 💳'}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">تاريخ الانتهاء:</span>
              <span class="meta-val" style="font-weight: 700; color: ${new Date(shop.subscription_expiry) < new Date() ? '#d9534f' : '#4cd964'}">${shop.subscription_expiry ? new Date(shop.subscription_expiry).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
            </div>
            <div class="meta-row" style="margin-top: 5px; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 5px;">
              <span class="meta-label">لوحة التحكم:</span>
              <span class="meta-val" style="color: #d48a37; font-size:12px;">user: ${shop.admin_username} | pass: ${shop.admin_password}</span>
            </div>
          </div>
        </div>

        <div class="shop-actions">
          <a href="../index.html?s=${shop.id}" target="_blank" class="btn-action btn-visit" title="عرض المتجر">
            <i class="fa-solid fa-eye"></i> عرض
          </a>
          <a href="../admin/index.html?shop=${shop.id}" target="_blank" class="btn-action btn-visit" style="background: rgba(111, 66, 193, 0.15); color: #a180e6;" title="لوحة التحكم للأدمن">
            <i class="fa-solid fa-user-gear"></i> إدارة
          </a>
          <button class="btn-action btn-edit" data-slug="${shop.id}" title="تعديل المتجر">
            <i class="fa-solid fa-pen"></i> تعديل
          </button>
          <button class="btn-action btn-delete" data-slug="${shop.id}" title="حذف المتجر">
            <i class="fa-solid fa-trash"></i> حذف
          </button>
        </div>
      `;

      listContainer.appendChild(shopCard);
    });

    // Attach Action Listeners
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", () => handleEditShop(btn.getAttribute("data-slug"), shops));
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => handleDeleteShop(btn.getAttribute("data-slug")));
    });
  }

  // Handle Edit Action
  function handleEditShop(slug, shops) {
    const shop = shops.find(s => s.id === slug);
    if (!shop) return;

    // Set Form Mode to Edit
    editShopMode.value = "true";
    formPanelTitle.innerHTML = `<i class="fa-solid fa-pen"></i> تعديل بيانات متجر (${shop.name})`;
    saveShopBtn.textContent = "حفظ التغييرات";
    cancelEditBtn.style.display = "block";
    seedOptionsGroup.style.display = "none"; // Don't allow re-seeding on edit

    // Populate Fields
    shopSlug.value = shop.id;
    shopSlug.readOnly = true; // Lock slug key
    shopSlug.style.opacity = "0.6";

    shopName.value = shop.name;
    shopSlogan.value = shop.slogan || "";
    shopWhatsapp.value = shop.whatsapp_number;
    shopLogoUrl.value = shop.logo_url || "";
    if (shop.logo_url) {
      shopLogoPreview.src = shop.logo_url;
      shopLogoPreviewContainer.style.display = "block";
      shopLogoUploadStatus.style.color = "#4cd964";
      shopLogoUploadStatus.textContent = "✓ شعار المحل الحالي";
    } else {
      shopLogoPreviewContainer.style.display = "none";
    }
    shopPrimaryColor.value = shop.primary_color;
    shopSecondaryColor.value = shop.secondary_color;
    shopFreeShipping.value = shop.free_shipping_limit;
    shopMaxProducts.value = shop.max_products_limit !== undefined && shop.max_products_limit !== null ? shop.max_products_limit : 50;
    shopSubscriptionPlan.value = shop.subscription_plan || "starter";
    if (shop.subscription_expiry) {
      shopSubscriptionExpiry.value = formatDate(shop.subscription_expiry);
    } else {
      shopSubscriptionExpiry.value = "";
    }
    shopIsActive.checked = shop.is_active !== false;
    shopAdminUser.value = shop.admin_username;
    shopAdminPass.value = shop.admin_password;

    // Scroll form into view
    shopForm.scrollIntoView({ behavior: "smooth" });
  }

  // Cancel edit mode
  cancelEditBtn.addEventListener("click", resetForm);

  function resetForm() {
    editShopMode.value = "false";
    formPanelTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> إضافة متجر جديد`;
    saveShopBtn.textContent = "إنشاء وحفظ المحل";
    cancelEditBtn.style.display = "none";
    seedOptionsGroup.style.display = "block";

    shopForm.reset();
    shopSlug.readOnly = false;
    shopSlug.style.opacity = "1";
    shopPrimaryColor.value = "#b24a27";
    shopSecondaryColor.value = "#d48a37";
    shopMaxProducts.value = "50";
    shopSubscriptionPlan.value = "starter";
    updateDefaultExpiry();
    shopIsActive.checked = true;
    
    // Clear logo upload elements
    if (shopLogoFile) shopLogoFile.value = "";
    shopLogoUrl.value = "";
    if (shopLogoPreviewContainer) shopLogoPreviewContainer.style.display = "none";
  }

  // Handle Save Shop (New or Edit)
  shopForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isEdit = editShopMode.value === "true";
    const slugValue = shopSlug.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    if (!slugValue) {
      alert("يرجى إدخال معرّف رابط (Slug) صحيح بالأحرف الإنجليزية فقط.");
      return;
    }

    // Check duplicate slug on creation
    if (!isEdit) {
      const activeShops = await getAllShops();
      const exists = activeShops.some(s => s.id === slugValue);
      if (exists) {
        alert("عذراً، معرّف الرابط هذا مستخدم بالفعل من محل آخر!");
        return;
      }
    }

    const shopData = {
      id: slugValue,
      name: shopName.value.trim(),
      slogan: shopSlogan.value.trim() || null,
      logo_url: shopLogoUrl.value.trim() || null,
      whatsapp_number: shopWhatsapp.value.trim(),
      primary_color: shopPrimaryColor.value,
      secondary_color: shopSecondaryColor.value,
      free_shipping_limit: parseFloat(shopFreeShipping.value) || 0,
      max_products_limit: parseInt(shopMaxProducts.value) || 50,
      subscription_plan: shopSubscriptionPlan.value,
      subscription_expiry: shopSubscriptionExpiry.value ? new Date(shopSubscriptionExpiry.value).toISOString() : null,
      is_active: shopIsActive.checked,
      admin_username: shopAdminUser.value.trim(),
      admin_password: shopAdminPass.value.trim()
    };

    saveShopBtn.disabled = true;
    saveShopBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري حفظ البيانات...`;

    const res = await saveShopProfile(shopData);

    if (res.success) {
      // Seed defaults if required
      if (!isEdit && seedDefaultsCheck.checked) {
        saveShopBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري تهيئة المنتجات الافتراضية...`;
        await seedDefaultProducts(slugValue);
      }

      alert(isEdit ? "تم تحديث بيانات المحل بنجاح!" : "تم إنشاء المحل بنجاح وتهيئة قاعدة بياناته!");
      resetForm();
      await loadDashboard();
    } else {
      alert("خطأ أثناء حفظ المتجر: " + res.error);
    }

    saveShopBtn.disabled = false;
    saveShopBtn.innerHTML = isEdit ? "حفظ التغييرات" : "إنشاء وحفظ المحل";
  });

  // Handle Delete Shop
  async function handleDeleteShop(slug) {
    if (confirm(`تحذير خطير جداً!\nهل أنت متأكد تماماً من رغبتك في حذف هذا المتجر (${slug}) نهائياً؟\nحذف المتجر سيؤدي إلى مسح جميع المنتجات والبيانات التابعة له فوراً من قاعدة البيانات السحابية بشكل كامل.`)) {
      const success = await deleteShopProfile(slug);
      if (success) {
        alert("تم حذف المتجر وجميع منتجاته بنجاح.");
        await loadDashboard();
      } else {
        alert("فشل حذف المتجر. يرجى التحقق من اتصال قاعدة البيانات.");
      }
    }
  }
});

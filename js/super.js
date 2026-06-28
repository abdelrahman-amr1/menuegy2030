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
  const shopPrimaryColor = document.getElementById("shopPrimaryColor");
  const shopSecondaryColor = document.getElementById("shopSecondaryColor");
  const shopFreeShipping = document.getElementById("shopFreeShipping");
  const shopAdminUser = document.getElementById("shopAdminUser");
  const shopAdminPass = document.getElementById("shopAdminPass");
  const seedDefaultsCheck = document.getElementById("seedDefaultsCheck");
  const seedOptionsGroup = document.getElementById("seedOptionsGroup");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const formPanelTitle = document.getElementById("formPanelTitle");
  const saveShopBtn = document.getElementById("saveShopBtn");

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
              <h3>${shop.name}</h3>
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
            <div class="meta-row" style="margin-top: 5px; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 5px;">
              <span class="meta-label">لوحة التحكم:</span>
              <span class="meta-val" style="color: #d48a37; font-size:12px;">user: ${shop.admin_username} | pass: ${shop.admin_password}</span>
            </div>
          </div>
        </div>

        <div class="shop-actions">
          <a href="../index.html?s=${shop.id}" target="_blank" class="btn-action btn-visit" title="عرض المتجر">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> المتجر
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
    shopPrimaryColor.value = shop.primary_color;
    shopSecondaryColor.value = shop.secondary_color;
    shopFreeShipping.value = shop.free_shipping_limit;
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

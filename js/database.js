// H.M Multi-Tenant SaaS Database Manager (using Supabase)

const DEFAULT_PRODUCTS = [
  // --- 1. Spices (التوابل) ---
  { id: "s1", name: "فلفل أسود أسواني", category: "spices", price: 0, unit: "100 جرام", available: true, description: "فلفل أسود فاخر طازج برائحة نفاذة وطعم قوي." },
  { id: "s2", name: "كمون بلدي منقى", category: "spices", price: 0, unit: "100 جرام", available: true, description: "كمون بلدي ذو طعم مميز ورائحة عطرية قوية من قلب أسوان." },
  { id: "s3", name: "كزبرة ناشفة", category: "spices", price: 0, unit: "100 جرام", available: true, description: "كزبرة جافة منقاة بعناية، مثالية لجميع المأكولات." },
  { id: "s4", name: "السبع بهارات الأسوانية", category: "spices", price: 0, unit: "100 جرام", available: true, description: "خلطة بهارات سحرية بنسب متوازنة ونكهة لا تُقاوم." },
  { id: "s5", name: "شطة حمراء ناري", category: "spices", price: 0, unit: "100 جرام", available: true, description: "شطة أسوانية حارة جداً، مطحونة من قرون الشطة الطبيعية المجففة." },
  { id: "s6", name: "حبهان (هيل) فاخر حصى", category: "spices", price: 0, unit: "100 جرام", available: true, description: "حبهان جامبو ذو فصوص ممتلئة ورائحة عطرية مكثفة." },
  { id: "s7", name: "بابريكا مدخنة", category: "spices", price: 0, unit: "100 جرام", available: true, description: "بابريكا طبيعية حلوة ومدخنة بلون أحمر غني ونكهة رائعة." },
  { id: "s8", name: "بهارات لحمة مميزة", category: "spices", price: 0, unit: "100 جرام", available: true, description: "خلطة خاصة لتتبيل جميع أنواع اللحوم وإعطائها مذاقاً شهياً." },
  { id: "s9", name: "بهارات فراخ فاخرة", category: "spices", price: 0, unit: "100 جرام", available: true, description: "خلطة مخصصة لتتبيل الدجاج المشوي والمطبوخ بنكهة ممتازة." },
  { id: "s10", name: "كاري هندي أصلي", category: "spices", price: 0, unit: "100 جرام", available: true, description: "بهار الكاري ذو اللون الذهبي الجميل والمذاق الدافئ الغني." },
  { id: "s11", name: "روز ماري (إكليل الجبل)", category: "spices", price: 0, unit: "100 جرام", available: true, description: "أوراق الروزماري المجففة ذات الرائحة العشبية المنعشة." },
  { id: "s12", name: "خولنجان", category: "spices", price: 0, unit: "100 جرام", available: true, description: "جذور الخولنجان، بهار مميز للمأكولات والمشروبات الدافئة." },
  { id: "s13", name: "جوزة الطيب كاملة", category: "spices", price: 0, unit: "حبة", available: true, description: "ثمار جوزة الطيب الكاملة الفاخرة لطحنها طازجة عند الاستخدام." },
  { id: "s14", name: "ليمون أسود (لومي) كامل", category: "spices", price: 0, unit: "100 جرام", available: true, description: "ليمون أسواني مجفف، أساسي للأرز البسمتي والكبسة والشوربة." },
  { id: "s15", name: "ورق لاورا (غار) منقى", category: "spices", price: 0, unit: "100 جرام", available: true, description: "أوراق غار عريضة ونظيفة لإضافة نكهة غنية للشوربات واللحوم." },
  { id: "s16", name: "ريحان بري مجفف", category: "spices", price: 0, unit: "100 جرام", available: true, description: "أوراق ريحان مجففة عطرة وممتازة للتتبيل أو المشروبات." },
  { id: "s17", name: "قرنفل (مسمار) فاخر", category: "spices", price: 0, unit: "100 جرام", available: true, description: "مسمار قرنفل ذو رائحة نفاذة وطعم قوي حار." },
  { id: "s18", name: "بصل بودر فاخر", category: "spices", price: 0, unit: "100 جرام", available: true, description: "مسحوق البصل المجفف النقي بدون أي إضافات لتسهيل الطبخ." },
  { id: "s19", name: "ثوم بودر فاخر", category: "spices", price: 0, unit: "100 جرام", available: true, description: "مسحوق الثوم المجفف النقي ذو الطعم المركز والرائحة القوية." },
  { id: "s20", name: "قرفة أعواد خشبية", category: "spices", price: 0, unit: "100 جرام", available: true, description: "أعواد قرفة خشبية عطرية ممتازة للطبخ والمشروبات الساخنة." },
  { id: "s21", name: "مستكة أكل أصلية", category: "spices", price: 0, unit: "10 جرام", available: true, description: "فصوص مستكة طبيعية نقية للطعام والشوربات والحلويات." },
  { id: "s22", name: "زر ورد بلدي مجفف", category: "spices", price: 0, unit: "100 جرام", available: true, description: "بتلات زر الورد المجففة العطرية لإضافتها لخلطات البهارات والشاي." },

  // --- 2. Drinks (المشروبات الطبيعية) ---
  { id: "d1", name: "كركديه أسواني لوزة فاخر", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "كركديه لوزة أسواني أصلي بلون أحمر ياقوتي داكن ومذاق رائع بارد وسخن." },
  { id: "d2", name: "تمر هندي كور أسواني", category: "drinks", price: 0, unit: "كرة (حوالي 250 جرام)", available: true, description: "تمر هندي طبيعي كور ممتاز لتحضير المشروب الرمضاني المنعش." },
  { id: "d3", name: "حلف بر بلدي مجفف", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "عشبة حلف البر الأسوانية الطبيعية والمفيدة جداً للمجاري البولية." },
  { id: "d4", name: "حبة البركة (الكمون الأسود)", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "بذور حبة البركة الغنية بالفوائد لتناولها أو غليها كمشروب دافئ." },
  { id: "d5", name: "شمر بلدي منقى", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "بذور الشمر العطرية المهدئة والمريحة للمعدة بنكهة اليانسون الخفيفة." },
  { id: "d6", name: "بذور كتان طبيعية", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "بذور الكتان الغنية بالألياف والأوميجا-3، رائعة للغلي أو مع الطعام." },
  { id: "d7", name: "دوم أسواني مجروش فاخر", category: "drinks", price: 0, unit: "250 جرام", available: true, description: "دوم مجروش طبيعي ممتاز لعمل عصير الدوم الأسواني المنعش والمفيد للضغط." },
  { id: "d8", name: "عرق سوس منقى", category: "drinks", price: 0, unit: "250 جرام", available: true, description: "مسحوق عرق السوس الفاخر سريع التحضير بطعم أصيل وحلاوة طبيعية." },
  { id: "d9", name: "بذور شيا طبيعية", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "بذور الشيا الأصلية الغنية بالطاقة والفوائد الغذائية المتعددة." },
  { id: "d10", name: "يانسون بلدي فاخر", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "يانسون بلدي ذو رائحة ونكهة عطرية قوية ومهدئ ممتاز للجسم." },
  { id: "d11", name: "كراوية بلدية منقاة", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "كراوية بلدية مفيدة ومريحة للمعدة ومناسبة جداً للأطفال والكبار." },
  { id: "d12", name: "تيليو (زهر الزيزفون)", category: "drinks", price: 0, unit: "100 جرام", available: true, description: "أوراق وزهور التيليو المهدئة للأعصاب والمسكنة للسعال والبرد." },

  // --- 3. Herbs (الأعشاب الطبيعية) ---
  { id: "h1", name: "أشواجاندا (جينسينج هندي)", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "جذور الأشواجاندا النقية لتقليل التوتر، زيادة الطاقة وتحسين النوم." },
  { id: "h2", name: "شرش زلوع أصلي", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "جذور شرش الزلوع البري المعروف بفوائده القوية لزيادة النشاط والحيوية." },
  { id: "h3", name: "بذور القرع (لب قرع نيا)", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "بذور القرع النيئة الغنية بالزنك والمعادن المفيدة جداً لصحة البروستاتا." },
  { id: "h4", name: "حب الرشاد بلدي", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "بذور حب الرشاد الغنية بالكالسيوم والحديد والمفيدة جداً للمفاصل والعظام." },
  { id: "h5", name: "مورينجا أوراق مجففة", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "أوراق المورينجا (شجرة الحياة) الغنية بالفيتامينات ومضادات الأكسدة." },
  { id: "h6", name: "مر بطارخ (مر حجازي) قطع", category: "herbs", price: 0, unit: "50 جرام", available: true, description: "صمغ المر الطبيعي الفاخر، مضاد حيوي طبيعي ومطهر للمعدة والجروح." },
  { id: "h7", name: "راوند (جذور الراوند)", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "جذور الراوند الطبيعية المفيدة لتنظيم الهضم وعلاج الإمساك." },
  { id: "h8", name: "عود إيكر (عرق الوج)", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "جذور عود الإيكر العشبية المفيدة للذاكرة والجهاز الهضمي." },
  { id: "h9", name: "أوراق زيتون القدس مجففة", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "أوراق زيتون القدس الطبيعية الممتازة لتخفيض نسبة السكر وضغط الدم." },
  { id: "h10", name: "مسحوق جذور الماكا", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "مسحوق جذور الماكا الأصلية لتعزيز القدرة البدنية والتحمل والتوازن الهرموني." },
  { id: "h11", name: "حبوب لقاح النحل طبيعية", category: "herbs", price: 0, unit: "100 جرام", available: true, description: "حبوب لقاح النحل الغنية بالبروتينات والإنزيمات لتقوية المناعة العامة." },
  { id: "h12", name: "جذور الجنسينج الأحمر", category: "herbs", price: 0, unit: "50 جرام", available: true, description: "جنسينج أحمر كوري أصلي لزيادة التركيز وتنشيط الدورة الدموية." },

  // --- 4. Natural Oils (الزيوت الطبيعية) ---
  { id: "o1", name: "زيت الروزماري خام نقي", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت إكليل الجبل المركز، ممتاز لتنشيط فروة الرأس وتحفيز نمو الشعر." },
  { id: "o2", name: "زيت الجوجوبا طبيعي معصور بارد", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "مرطب طبيعي رائع للبشرة ولطيف على فروة الرأس والشعر الجاف." },
  { id: "o3", name: "زيت اللوز الحلو نقي", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت خفيف ومغذي للبشرة يساعد على توحيد اللون وتقليل الهالات السوداء." },
  { id: "o4", name: "زيت زيتون بكر ممتاز", category: "oils", price: 0, unit: "زجاجة 250 مل", available: true, description: "عصرة أولى على البارد بنسبة حموضة منخفضة جداً، مفيد للأكل والشعر." },
  { id: "o5", name: "زيت الجرجير الطبيعي خام", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت الجرجير المركز لتغذية جذور الشعر ومنع تساقطه وزيادة طوله." },
  { id: "o6", name: "زيت حبة البركة معصور بارد", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "مستخلص حبة البركة الغني بالفيتامينات، مفيد للمناعة وللشعر والبشرة." },
  { id: "o7", name: "زيت الأرجان المغربي الأصلي", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت الأرجان النقي (الذهب السائل) لتنعيم الشعر وتغذية البشرة بعمق." },
  { id: "o8", name: "زيت الخروع المركز", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت لزج وثقيل ممتاز لزيادة كثافة الرموش والحواجب وإطالة الشعر." },
  { id: "o9", name: "زيت جوز الهند العضوي", category: "oils", price: 0, unit: "عبوة 200 مل", available: true, description: "زيت جوز هند بكر طبيعي ذو رائحة ممتازة يتجمد في البرودة، مثالي للشعر والبشرة." },
  { id: "o10", name: "زيت الصبار الطبيعي", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "مستخلص الصبار لتهدئة البشرة، علاج الحروق الخفيفة وترطيب فروة الرأس." },
  { id: "o11", name: "زيت الجلسرين الطبيعي نقاوة 100%", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "مرطب فائق القوة للبشرة الجافة، يُستعمل مع الليمون لتفتيح البشرة." },
  { id: "o12", name: "زيت الخردل المركز", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت الخردل الدافئ لتنشيط الدورة الدموية في الفروة وتطويل الشعر." },
  { id: "o13", name: "زيت الحلبة الطبيعي", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "مستخلص الحلبة معصور بارد لترطيب وتسمين مناطق الوجه والبشرة." },
  { id: "o14", name: "زيت عشبة 304 الخاصة للشعر", category: "oils", price: 0, unit: "عبوة 200 مل", available: true, description: "تركيبة زيوت طبيعية خاصة 304 لتطويل وتكثيف وتنعيم الشعر التالف." },
  { id: "o15", name: "زيت الفازلين الطبيعي", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت خفيف لتنعيم وتصفيف الشعر وحماية البشرة من الجفاف الشديد." },
  { id: "o16", name: "زيت ذيل الحصان الأصلي", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت غني بالسيليكا الطبيعية يعمل على تقوية ألياف الشعر ومنع تكسره." },
  { id: "o17", name: "زيت الحرجل الأسواني", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت الحرجل العشبي الفعال في تخفيف آلام المفاصل والروماتيزم." },
  { id: "o18", name: "زيت قرع العسل (اليقطين)", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت بذور اليقطين النقي، يمنع تساقط الشعر الهرموني وممتاز للبشرة." },
  { id: "o19", name: "زيت الزنجبيل الحار", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "مستخلص الزنجبيل الدافئ لتنشيط الفروة وتدليك العضلات لتخفيف التوتر." },
  { id: "o20", name: "زيت القرفة العطري", category: "oils", price: 0, unit: "عبوة 100 مل", available: true, description: "زيت القرفة الدافئ ذو الرائحة العطرية القوية والمنشطة للجسم والبشرة." },

  // --- 5. Incense (البخور المشكل) ---
  { id: "i1", name: "خلطة البخور الأسوانية الخاصة H.M", category: "incense", price: 0, unit: "علبة (حوالي 150 جرام)", available: true, description: "خلطة خاصة ومميزة جداً من أعشاب وعطور أسوان النادرة. رائحة ذكية تدوم طويلاً، متوفرة حصرياً لدينا." },

  // --- 6. Famous Aswan Products (المنتجات المشهورة في أسوان) ---
  { id: "f1", name: "فسيخ أسواني سوبر كلابي فاخر", category: "famous", price: 0, unit: "كيلو", available: true, description: "فسيخ أسواني أصلي مملح بعناية، لحم زبدة وردي ونسبة ملوحة مضبوطة تماماً." },
  { id: "f2", name: "ملوحة أسوانية ممتازة", category: "famous", price: 0, unit: "كيلو", available: true, description: "ملوحة راية أسوانية فاخرة، منظفة ومحفوظة بالزيت والخل والبهارات." },
  { id: "f3", name: "مش قديم فلاحي بالمرتة والبهارات", category: "famous", price: 0, unit: "برطمان 1 كيلو", available: true, description: "جبنة مش قديمة معتقة غنية بالطعم القوي ومتبلة بالفلفل الأحمر والقرون الحارة." },
  { id: "f4", name: "سوداني أسواني مقشر سوبر مقلي", category: "famous", price: 0, unit: "كيلو", available: true, description: "سوداني أسواني بلدي مقشر ومحمص بعناية، ذو حجم كبير وطعم مقرمش شهي." },
  { id: "f5", name: "عيش شمس أسواني طازج", category: "famous", price: 0, unit: "رغيف كبير", available: true, description: "الخبز الشمسي الأسواني التقليدي المخبوز على الطريقة الأصلية في الشمس." },
  { id: "f6", name: "فايش أسواني باللبن والسمن البلدي", category: "famous", price: 0, unit: "كيلو", available: true, description: "فايش مقرمش ومحمص برائحة الكركم واللبن والسمن البلدي الأسواني الأصيل." }
];

// Helper to check if Supabase is connected
function isDbConnected() {
  return typeof window.supabaseDb !== 'undefined' && window.supabaseDb !== null;
}

// ----------------------------------------------------
// Tenant Shop Profiles Operations
// ----------------------------------------------------

// Fetch a single shop profile by slug/ID
async function getShopProfile(shopSlug) {
  if (!isDbConnected()) {
    console.error("Database connection missing");
    return null;
  }
  try {
    const { data, error } = await window.supabaseDb
      .from("shops")
      .select("*")
      .eq("id", shopSlug)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Error loading shop profile:", e);
    return null;
  }
}

// Fetch all registered shop profiles (for Super Admin dashboard)
async function getAllShops() {
  if (!isDbConnected()) return [];
  try {
    const { data, error } = await window.supabaseDb
      .from("shops")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("Error loading all shops:", e);
    return [];
  }
}

// Save or Update a shop profile (Super Admin operation)
async function saveShopProfile(shopData) {
  if (!isDbConnected()) return { success: false, error: "Database offline" };
  try {
    const { data, error } = await window.supabaseDb
      .from("shops")
      .upsert(shopData)
      .select();
    
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error("Error saving shop profile:", e);
    return { success: false, error: e.message };
  }
}

// Delete a shop profile (Super Admin operation)
async function deleteShopProfile(shopSlug) {
  if (!isDbConnected()) return false;
  try {
    const { error } = await window.supabaseDb
      .from("shops")
      .delete()
      .eq("id", shopSlug);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error deleting shop profile:", e);
    return false;
  }
}

// ----------------------------------------------------
// Product Operations (Scoped by Tenant shop_id)
// ----------------------------------------------------

// Load all products belonging to a specific shop
async function getShopProducts(shopSlug) {
  if (!isDbConnected()) return [];
  try {
    const { data, error } = await window.supabaseDb
      .from("products")
      .select("*")
      .eq("shop_id", shopSlug);
    
    if (error) throw error;
    
    // Sort logically
    if (data) {
      data.sort((a, b) => a.id.localeCompare(b.id));
    }
    return data || [];
  } catch (e) {
    console.error("Error loading shop products:", e);
    return [];
  }
}

// Save or Update a single product
async function saveShopProduct(productData) {
  if (!isDbConnected()) return false;
  try {
    const { error } = await window.supabaseDb
      .from("products")
      .upsert(productData);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error saving product:", e);
    return false;
  }
}

// Delete a single product
async function deleteShopProduct(productId) {
  if (!isDbConnected()) return false;
  try {
    const { error } = await window.supabaseDb
      .from("products")
      .delete()
      .eq("id", productId);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error deleting product:", e);
    return false;
  }
}

// Reset/Seed products for a shop with default Aswan spice items
async function seedDefaultProducts(shopSlug) {
  if (!isDbConnected()) return false;
  try {
    // Delete existing products for the shop
    await window.supabaseDb
      .from("products")
      .delete()
      .eq("shop_id", shopSlug);
    
    // Map defaults with shop_id
    const productsToInsert = DEFAULT_PRODUCTS.map(p => ({
      ...p,
      shop_id: shopSlug,
      image_url: "" // Admin can edit and add image URLs later
    }));
    
    const { error } = await window.supabaseDb
      .from("products")
      .insert(productsToInsert);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error seeding default products:", e);
    return false;
  }
}

// Save all products (batch upsert when importing backups)
async function saveAllProducts(shopSlug, productsList) {
  if (!isDbConnected()) return false;
  try {
    // Map list to ensure shop_id is set
    const formattedList = productsList.map(p => ({
      id: p.id || "p_" + Math.random().toString(36).substr(2, 9),
      shop_id: shopSlug,
      name: p.name,
      category: p.category,
      price: parseFloat(p.price) || 0,
      cost_price: parseFloat(p.cost_price) || 0,
      quantity: p.quantity !== undefined ? parseFloat(p.quantity) : 100,
      min_stock: parseFloat(p.min_stock) || 5,
      barcode: p.barcode || "200" + Math.floor(100000000 + Math.random() * 900000000),
      store_name: p.store_name || "المخزن الرئيسي",
      unit: p.unit,
      available: p.available !== false,
      description: p.description || "",
      image_url: p.image_url || ""
    }));
    
    const { error } = await window.supabaseDb
      .from("products")
      .upsert(formattedList);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error batch saving products:", e);
    return false;
  }
}

// Get count stats for Super Admin dashboard
async function getSuperStats() {
  if (!isDbConnected()) return { totalShops: 0, totalProducts: 0 };
  try {
    const { count: shopCount, error: shopErr } = await window.supabaseDb
      .from("shops")
      .select("*", { count: "exact", head: true });
      
    const { count: prodCount, error: prodErr } = await window.supabaseDb
      .from("products")
      .select("*", { count: "exact", head: true });
      
    if (shopErr) throw shopErr;
    if (prodErr) throw prodErr;
    
    return {
      totalShops: shopCount || 0,
      totalProducts: prodCount || 0
    };
  } catch (e) {
    console.error("Error fetching stats:", e);
    return { totalShops: 0, totalProducts: 0 };
  }
}

// Upload file to Supabase Storage bucket 'images'
async function uploadFileToSupabase(file, folder = "general") {
  if (!isDbConnected()) {
    throw new Error("قاعدة البيانات غير متصلة");
  }
  try {
    const fileExt = file.name.split('.').pop();
    // Clean file name using timestamp and random string
    const cleanFileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await window.supabaseDb.storage
      .from('images')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = window.supabaseDb.storage
      .from('images')
      .getPublicUrl(cleanFileName);
      
    return publicUrl;
  } catch (e) {
    console.error("Error uploading file:", e);
    throw e;
  }
}

// Clear all products belonging to a specific shop
async function clearShopProducts(shopSlug) {
  if (!isDbConnected()) return false;
  try {
    const { error } = await window.supabaseDb
      .from("products")
      .delete()
      .eq("shop_id", shopSlug);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error clearing shop products:", e);
    return false;
  }
}

// ----------------------------------------------------
// Sahl ERP User Permissions & System Settings Operations
// ----------------------------------------------------

// Fetch Granular User Permissions
async function getShopUserPermissions(shopSlug) {
  const localKey = `menuegy_user_perms_${shopSlug}`;
  let defaultPermissions = {
    // 1. General Permissions (صلاحيات عامة)
    general: {
      admin_app: true,
      backup_create: true,
      backup_restore: true,
      edit_inv_number: true,
      view_today_invoices_only: false,
      allowed_stores: ["المخزن الرئيسي"],
      allowed_safes: ["درج النقدية"],
      active_user: true
    },
    // 2. Invoices (الفواتير)
    invoices: {
      view_sales_invoices: true, sales_new: true, sales_edit: true, sales_delete: false,
      view_quotes: true, quote_new: true, quote_edit: true, quote_delete: false,
      view_purchases: true, purchase_new: true, purchase_edit: true, purchase_delete: false,
      view_stocktake: true,
      view_branch_transfers: true, transfer_new: true, transfer_edit: true, transfer_delete: false,
      view_adjustments: true, adjustment_new: true, adjustment_edit: true, adjustment_delete: false,
      view_expenses: true, expense_new: true, expense_edit: true, expense_delete: false,
      view_receipts: true, receipt_new: true, receipt_edit: true, receipt_delete: false,
      transfer_safe_other: true,
      track_cheques: true,
      cancel_safe_flow: false,
      close_credit_invoices: false,
      allow_sale_edit_price: true,
      allow_invoice_discount: true, max_discount_pct: 10, max_discount_val: 0,
      allow_sale_below_cost: false,
      allow_credit_sales: true,
      track_sales_invoices: true,
      view_invoice_profit: true,
      sales_return: true,
      purchase_return: true,
      allow_credit_purchase: true,
      edit_tax_sales: false,
      edit_tax_purchases: false
    },
    // 3. Inventory / Stock (البضاعة)
    inventory: {
      view_items: true, item_new: true, item_edit: true, item_delete: false,
      item_movement_report: true,
      stock_report: true,
      store_movement_report: true,
      view_cost_price: true,
      allow_negative_stock: false,
      print_barcode_labels: true
    },
    // 4. Accounts (الحسابات)
    accounts: {
      view_accounts: true, acc_new: true, acc_edit: true, acc_delete: false,
      allowed_customer: true, allowed_supplier: true, allowed_rep: true, allowed_other: true,
      view_account_balance: true,
      view_account_statement: true
    },
    // 5. Treasury (الخزينة)
    treasury: {
      view_treasury_flow: true,
      analyze_receipts: true,
      analyze_expenses: true
    },
    // 6. Advanced Reports (تقارير متقدمة)
    advanced_reports: {
      advanced_reports_access: true,
      daily_flow_report: true,
      sales_analysis_report: true,
      purchases_analysis_report: true
    },
    // 7. Installments (تقسيط)
    installments: {
      view_contracts: true, contract_new: true, contract_edit: true, contract_delete: false,
      pay_installment: true,
      due_overdue_installments: true
    }
  };

  try {
    const shop = await getShopProfile(shopSlug);
    if (shop && shop.user_permissions && Object.keys(shop.user_permissions).length > 0) {
      localStorage.setItem(localKey, JSON.stringify(shop.user_permissions));
      return { ...defaultPermissions, ...shop.user_permissions };
    }
  } catch (e) {
    console.error("Error fetching permissions from Supabase:", e);
  }

  // Fallback to localStorage
  const savedLocal = localStorage.getItem(localKey);
  if (savedLocal) {
    try {
      return { ...defaultPermissions, ...JSON.parse(savedLocal) };
    } catch (err) {
      console.error("Error parsing local perms:", err);
    }
  }

  return defaultPermissions;
}

// Save Granular User Permissions
async function saveShopUserPermissions(shopSlug, permissionsObj) {
  const localKey = `menuegy_user_perms_${shopSlug}`;
  localStorage.setItem(localKey, JSON.stringify(permissionsObj));

  if (!isDbConnected()) return true;
  try {
    const { error } = await window.supabaseDb
      .from("shops")
      .update({ user_permissions: permissionsObj })
      .eq("id", shopSlug);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error saving user permissions to Supabase:", e);
    return false;
  }
}

// Fetch System & POS Settings
async function getShopSystemSettings(shopSlug) {
  const localKey = `menuegy_sys_settings_${shopSlug}`;
  let defaultSettings = {
    // 1. General Settings (عام)
    general: {
      auto_deliver_sales: true,
      images_save_path: "/uploads/images/",
      invoice_print_copies: 1,
      lock_invoice_edit_before: "2000-01-01"
    },
    // 2. Custom Fields (حقول إضافية)
    custom_fields: {
      item_field1: "الماركة", item_field2: "الموديل", item_field3: "اسم المورد",
      account_field1: "المدينة", account_field2: "الدولة", account_field3: "التصنيف الفرعي",
      invoice_field1: "اسم المستلم", invoice_field2: "رقم السيارة", invoice_field3: "",
      invoice_calc_buy1: "تكلفة الشحن", invoice_calc_buy_val1: 0,
      invoice_calc_sell1: "رسوم التوصيل", invoice_calc_sell_val1: 0,
      item_extra_label1: "اللون", item_extra_label2: "الكرتونة"
    },
    // 3. Taxes & E-Invoicing (الضرائب والفوترة)
    taxes_einvoicing: {
      tax_reg_number: "100-200-300",
      commercial_reg_number: "987654",
      vat_name1: "ضريبة القيمة المضافة", vat_pct1: 14, auto_add_sell1: true, auto_add_buy1: false,
      vat_name2: "ضريبة أرباح تجارية", vat_pct2: 1, auto_add_sell2: false, auto_add_buy2: false,
      einvoicing_active: true,
      einvoice_qr: true
    },
    // 4. Security & Passwords (كلمات السر)
    security: {
      backup_protect_pass: "menu123",
      restricted_user_pass: "super999"
    },
    // 5. Scale Barcode & Other (ميزان الباركود وخيارات أخرى)
    scale_barcode: {
      enable_scale_barcode: true,
      scale_prefix: "00",
      total_barcode_digits: 13,
      item_code_digits: 5,
      weight_digits: 5
    },
    // 6. Restaurant Setup (إعداد المطعم وطابعات المطبخ)
    restaurant_setup: {
      enable_restaurant_mode: true,
      printers: [
        { id: 1, printer_name: "طابعة المطبخ الرئيسي", filter_field: "القسم", filter_value: "اللحوم والدواجن", template: "نموذج تجهيز المطبخ" },
        { id: 2, printer_name: "طابعة المشويات والأسماك", filter_field: "القسم", filter_value: "الأسماك والمدخن", template: "نموذج تجهيز المشويات" },
        { id: 3, printer_name: "طابعة المخبوزات", filter_field: "القسم", filter_value: "المخبوزات والعجائن", template: "نموذج المعجنات" },
        { id: 4, printer_name: "طابعة المشروبات والبار", filter_field: "القسم", filter_value: "المشروبات الطبيعية", template: "نموذج الكافيه والبار" }
      ]
    }
  };

  try {
    const shop = await getShopProfile(shopSlug);
    if (shop && shop.system_settings && Object.keys(shop.system_settings).length > 0) {
      localStorage.setItem(localKey, JSON.stringify(shop.system_settings));
      return { ...defaultSettings, ...shop.system_settings };
    }
  } catch (e) {
    console.error("Error fetching system settings from Supabase:", e);
  }

  // Fallback to localStorage
  const savedLocal = localStorage.getItem(localKey);
  if (savedLocal) {
    try {
      return { ...defaultSettings, ...JSON.parse(savedLocal) };
    } catch (err) {
      console.error("Error parsing local sys settings:", err);
    }
  }

  return defaultSettings;
}

// Save System & POS Settings
async function saveShopSystemSettings(shopSlug, settingsObj) {
  const localKey = `menuegy_sys_settings_${shopSlug}`;
  localStorage.setItem(localKey, JSON.stringify(settingsObj));

  if (!isDbConnected()) return true;
  try {
    const { error } = await window.supabaseDb
      .from("shops")
      .update({ system_settings: settingsObj })
      .eq("id", shopSlug);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error saving system settings to Supabase:", e);
    return false;
  }
}

// ==========================================
// TREASURY & SHIFTS MODULE (الخزينة والورديات)
// ==========================================

async function addTreasuryTransaction(shopId, type, amount, category, description, userId) {
  if (!isDbConnected()) return false;
  try {
    const { error } = await window.supabaseDb
      .from("treasury_transactions")
      .insert([{
        shop_id: shopId,
        type: type,
        amount: parseFloat(amount),
        category: category,
        description: description,
        user_id: userId
      }]);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error adding treasury transaction:", e);
    return false;
  }
}

async function getTreasuryTransactions(shopId, limit = 100) {
  if (!isDbConnected()) return [];
  try {
    const { data, error } = await window.supabaseDb
      .from("treasury_transactions")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("Error fetching treasury transactions:", e);
    return [];
  }
}

async function getTreasuryBalanceSinceLastShift(shopId) {
  // Simplification for now: get all transactions. 
  // In a full implementation, you'd filter by shift_id or time after last shift.
  if (!isDbConnected()) return 0;
  try {
    const { data, error } = await window.supabaseDb
      .from("treasury_transactions")
      .select("type, amount")
      .eq("shop_id", shopId);
      
    if (error) throw error;
    
    let balance = 0;
    if (data) {
      data.forEach(t => {
        if (t.type === "income") balance += parseFloat(t.amount);
        else if (t.type === "expense") balance -= parseFloat(t.amount);
      });
    }
    return balance;
  } catch (e) {
    console.error("Error calculating treasury balance:", e);
    return 0;
  }
}

async function closeCurrentShift(shopId, userId, expectedAmount, actualAmount, floatAmount) {
  if (!isDbConnected()) return false;
  try {
    // 1. Record the shift closing
    const variance = parseFloat(actualAmount) - parseFloat(expectedAmount);
    const { error: shiftError } = await window.supabaseDb
      .from("shifts")
      .insert([{
        shop_id: shopId,
        user_id: userId,
        end_time: new Date().toISOString(),
        expected_amount: expectedAmount,
        actual_amount: actualAmount,
        variance: variance,
        status: 'closed'
      }]);
      
    if (shiftError) throw shiftError;
    
    // 2. Optional: "Empty the drawer" logic. We can do this by adding an "expense" transaction 
    // to zero out the drawer, and an "income" transaction for the new float amount.
    // For simplicity, we just add the 'floatAmount' as a new 'income' (رصيد افتتاحي) to mark the new shift start.
    
    // First, remove the actual cash from drawer (transfer to safe/owner)
    await addTreasuryTransaction(shopId, 'expense', actualAmount, 'إقفال وردية وتسليم نقدية', `تسليم نقدية الوردية من ${userId}`, userId);
    
    // Then, add the float amount for the next shift if > 0
    if (parseFloat(floatAmount) > 0) {
      await addTreasuryTransaction(shopId, 'income', floatAmount, 'رصيد افتتاحي', `فكة متبقية في الدرج للوردية الجديدة`, userId);
    }

    return true;
  } catch (e) {
    console.error("Error closing shift:", e);
    return false;
  }
}

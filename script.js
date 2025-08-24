// إعدادات API
const API_URL = "https://www.goldapi.io/api/XAU/KWD";
// ✱ ضع مفتاح GoldAPI هنا (سيتاح من حسابك المجاني)
const API_KEY = goldapi-5z18ld4gkwkcydf4-io // ← استبدل هذا النص بالمفتاح الخاص بك

// ثوابت
const OUNCE_TO_GRAM = 31.1034768; // أونصة ترويسية بالجرام
const REFRESH_MS = 10_000;        // 10 ثوانٍ
let backoffMs = REFRESH_MS;       // لزيادة المدة مؤقتًا عند حدوث خطأ

function fmt(n){
  if (typeof n !== "number" || !isFinite(n)) return "—";
  return n.toFixed(3);
}

function setLastUpdate(date){
  const el = document.getElementById("lastUpdate");
  const d = date || new Date();
  // عرض بسيط: HH:MM:SS
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  el.textContent = `آخر تحديث: ${hh}:${mm}:${ss}`;
}

async function fetchPrice(){
  const res = await fetch(API_URL, {
    headers: {
      "x-access-token": API_KEY,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  if (!res.ok){
    // 429 أو غيره: أعد المحاولة مع backoff بسيط
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return data;
}

async function updatePrices(){
  try{
    const data = await fetchPrice();
    const ounce = Number(data?.price); // سعر الأونصة بالدينار
    const g24 = ounce / OUNCE_TO_GRAM;

    document.getElementById("ounce").textContent = fmt(ounce);
    document.getElementById("g24").textContent  = fmt(g24);
    document.getElementById("g22").textContent  = fmt(g24 * (22/24));
    document.getElementById("g21").textContent  = fmt(g24 * (21/24));
    document.getElementById("g18").textContent  = fmt(g24 * (18/24));

    setLastUpdate(new Date());
    // نجحنا: أعد backoff للوضع الطبيعي
    backoffMs = REFRESH_MS;
  }catch(err){
    console.error("Error fetching prices:", err);
    // مدة انتظار أطول مؤقتًا لتجنب تجاوز الحد
    backoffMs = Math.min(backoffMs * 2, 60_000); // حد أقصى 60 ثانية
  }finally{
    // جدول التحديث القادم
    setTimeout(updatePrices, backoffMs);
  }
}

// بدء
setLastUpdate(new Date());
updatePrices();

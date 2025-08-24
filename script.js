<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>أسعار الذهب في الكويت</title>
<style>
:root{--bg:#f7f7f7;--card:#fff;--text:#111;--muted:#6b7280;--border:#e5e7eb;}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}
.container{max-width:720px;margin:24px auto;padding:16px}
h1{margin:0 0 8px;text-align:center;font-size:clamp(22px,4vw,32px)}
.subtitle{text-align:center;color:var(--muted);margin:0 0 16px}
.price-table{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.price-table th,.price-table td{padding:12px 14px;border-bottom:1px solid var(--border);text-align:center}
.price-table thead th{background:#f3f4f6;font-weight:600}
.price-table tbody tr:last-child td{border-bottom:none}
.err{margin-top:12px;color:#b91c1c;text-align:center;direction:ltr}
</style>
</head>
<body>
<main class="container">
  <h1>أسعار الذهب بالدينار الكويتي</h1>
  <p class="subtitle">تحديث تلقائي كل <strong>10</strong> ثوانٍ • <span id="lastUpdate">—</span></p>
  <table class="price-table">
    <thead><tr><th>الوحدة</th><th>السعر (د.ك)</th></tr></thead>
    <tbody>
      <tr><td>أونصة الذهب (عيار 24)</td><td id="ounce">—</td></tr>
      <tr><td>غرام ذهب عيار 24</td><td id="g24">—</td></tr>
      <tr><td>غرام ذهب عيار 22</td><td id="g22">—</td></tr>
      <tr><td>غرام ذهب عيار 21</td><td id="g21">—</td></tr>
      <tr><td>غرام ذهب عيار 18</td><td id="g18">—</td></tr>
    </tbody>
  </table>
  <div id="err" class="err"></div>
</main>
<script>
const API_URL = "https://www.goldapi.io/api/XAU/KWD";
const API_KEY = "goldapi-5z18ld4gkwkcydf4-io"; // مفتاحك
const OUNCE_TO_GRAM = 31.1034768;
const BASE_MS = 10_000;      // 10 ثوانٍ
let nextMs = BASE_MS;

const $$ = id => document.getElementById(id);
function fmt(n){ return (typeof n==="number" && isFinite(n)) ? n.toFixed(3) : "—"; }
function stamp(){
  const d=new Date(), hh=String(d.getHours()).padStart(2,"0"), mm=String(d.getMinutes()).padStart(2,"0"), ss=String(d.getSeconds()).padStart(2,"0");
  $$("lastUpdate").textContent = `آخر تحديث: ${hh}:${mm}:${ss}`;
}

async function fetchGold(){
  const res = await fetch(API_URL, {
    headers: { "x-access-token": API_KEY, "Accept": "application/json" },
    cache: "no-store",
    mode: "cors"
  });
  const text = await res.text(); // نقرأ النص أولًا لعرضه عند الخطأ
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

async function tick(){
  try{
    const {ok, status, data} = await fetchGold();
    if(!ok) throw new Error(`HTTP ${status} :: ${JSON.stringify(data).slice(0,200)}`);
    const ounce = Number(data.price);
    const g24 = ounce / OUNCE_TO_GRAM;
    $$("ounce").textContent = fmt(ounce);
    $$("g24").textContent   = fmt(g24);
    $$("g22").textContent   = fmt(g24 * (22/24));
    $$("g21").textContent   = fmt(g24 * (21/24));
    $$("g18").textContent   = fmt(g24 * (18/24));
    $$("err").textContent = "";
    stamp();
    nextMs = BASE_MS; // رجوع للوتيرة الطبيعية
  }catch(e){
    $$("err").textContent = "Error: " + e.message; // ستراها على الصفحة
    nextMs = Math.min(nextMs * 2, 60_000);         // backoff حتى لا تتخطى الحدود
  }finally{
    setTimeout(tick, nextMs);
  }
}
stamp(); tick();
</script>
</body>
</html>

// ─────────────────────────────────────────────────────────────
// js/util.js — ตัวช่วยเล็ก ๆ ที่ทุกหน้าเรียกใช้
// ─────────────────────────────────────────────────────────────

// แปลงข้อความของผู้ใช้ให้ปลอดภัยก่อนเอาไปวางในหน้าเว็บ
// ถ้าไม่ทำ ข้อความที่มีเครื่องหมาย < > จะทำให้หน้าเว็บเพี้ยนได้
function esc(ข้อความ) {
  return String(ข้อความ == null ? "" : ข้อความ)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ป้ายสถานะสี — รอพิจารณา=เหลือง อนุมัติ=เขียว ไม่อนุมัติ=แดง
function ป้ายสถานะ(สถานะ) {
  return '<span class="badge badge-' + esc(สถานะ) + '">' + esc(สถานะ) + "</span>";
}

// เวลาปัจจุบันในรูปแบบเดียวกับข้อมูลตัวอย่าง เช่น "2026-09-01 09:15"
// เก็บเป็นข้อความเพื่อให้เรียงลำดับและอ่านง่ายโดยไม่ต้องแปลงชนิดข้อมูล
function เวลาตอนนี้() {
  var d = new Date();
  var สองหลัก = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "-" + สองหลัก(d.getMonth() + 1) + "-" + สองหลัก(d.getDate()) +
         " " + สองหลัก(d.getHours()) + ":" + สองหลัก(d.getMinutes());
}

// อ่านค่าที่ต่อท้าย URL เช่น leave-request-detail.html?id=lr001
function ค่าจากURL(ชื่อ) {
  return new URLSearchParams(location.search).get(ชื่อ) || "";
}

// ถาม AI ผ่าน OpenRouter (ใช้ OPENROUTER_API_KEY / OPENROUTER_MODEL จาก js/ai-config.js)
// คืนค่าเป็น Promise ของข้อความคำตอบ · ตัดเวลาที่ 15 วินาทีด้วย AbortController
// หน้าที่จะเรียกฟังก์ชันนี้ต้องใส่ <script src="js/ai-config.js"> ไว้ก่อน js/util.js
function ถามAI(คำสั่งระบบ, คำถาม) {
  if (typeof OPENROUTER_API_KEY === "undefined" || !OPENROUTER_API_KEY) {
    return Promise.reject(new Error("ยังไม่ได้ตั้งค่าคีย์ AI (js/ai-config.js)"));
  }

  var ตัวยกเลิก = new AbortController();
  var ตัวจับเวลา = setTimeout(function () { ตัวยกเลิก.abort(); }, 15000);

  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + OPENROUTER_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: คำสั่งระบบ },
        { role: "user", content: คำถาม }
      ]
    }),
    signal: ตัวยกเลิก.signal
  }).then(function (res) {
    if (!res.ok) throw new Error("AI ตอบกลับผิดพลาด (HTTP " + res.status + ")");
    return res.json();
  }).then(function (ข้อมูล) {
    var คำตอบ = ข้อมูล && ข้อมูล.choices && ข้อมูล.choices[0] &&
                ข้อมูล.choices[0].message && ข้อมูล.choices[0].message.content;
    if (!คำตอบ) throw new Error("AI ไม่ได้ส่งคำตอบกลับมา");
    return String(คำตอบ).trim();
  }).catch(function (err) {
    if (err && err.name === "AbortError") throw new Error("AI ใช้เวลานานเกิน 15 วินาที");
    throw err;
  }).finally(function () {
    clearTimeout(ตัวจับเวลา);
  });
}

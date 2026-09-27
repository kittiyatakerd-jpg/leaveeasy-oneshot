// ─────────────────────────────────────────────────────────────
// js/auth-guard.js — เช็คสถานะล็อกอินก่อนให้หน้าทำงานต่อ
// ทุกหน้าที่ต้องล็อกอินก่อนใช้งาน เรียก เมื่อรู้ผู้ใช้(callback) แทนการเขียน
// logic ตรง ๆ ที่หัวไฟล์ — ถ้ายังไม่ล็อกอิน จะเด้งไปหน้า login.html
// พร้อมจดจำหน้าที่ต้องการกลับมาไว้ใน ?redirect=
// ─────────────────────────────────────────────────────────────

function เมื่อรู้ผู้ใช้(callback) {
  auth.onAuthStateChanged(function (ผู้ใช้) {
    if (!ผู้ใช้) {
      var หน้าปัจจุบัน = location.pathname.split("/").pop() + location.search;
      location.href = "login.html?redirect=" + encodeURIComponent(หน้าปัจจุบัน);
      return;
    }
    callback(ผู้ใช้);
  });
}

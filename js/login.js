// ─────────────────────────────────────────────────────────────
// js/login.js — หน้าเข้าสู่ระบบ / สมัครสมาชิก
// ใช้ firebase.auth() (ตัวแปร auth มาจาก js/firebase-config.js)
// ─────────────────────────────────────────────────────────────

(function () {
  var แท็บเข้าสู่ระบบ = document.getElementById("แท็บเข้าสู่ระบบ");
  var แท็บสมัครสมาชิก = document.getElementById("แท็บสมัครสมาชิก");
  var ฟอร์มเข้าสู่ระบบ = document.getElementById("ฟอร์มเข้าสู่ระบบ");
  var ฟอร์มสมัครสมาชิก = document.getElementById("ฟอร์มสมัครสมาชิก");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");

  แท็บเข้าสู่ระบบ.addEventListener("click", function () { สลับแท็บ(true); });
  แท็บสมัครสมาชิก.addEventListener("click", function () { สลับแท็บ(false); });

  function สลับแท็บ(เป็นเข้าสู่ระบบ) {
    ซ่อนเตือน();
    ฟอร์มเข้าสู่ระบบ.classList.toggle("hidden", !เป็นเข้าสู่ระบบ);
    ฟอร์มสมัครสมาชิก.classList.toggle("hidden", เป็นเข้าสู่ระบบ);
    แท็บเข้าสู่ระบบ.className = เป็นเข้าสู่ระบบ ? "btn" : "btn-ghost";
    แท็บสมัครสมาชิก.className = เป็นเข้าสู่ระบบ ? "btn-ghost" : "btn";
  }

  // ล็อกอิน/สมัครสำเร็จแล้วกลับไปหน้าที่ตั้งใจจะเปิดตั้งแต่แรก (?redirect=)
  // หรือกลับหน้าแรกถ้าเปิด login.html มาตรง ๆ
  function ปลายทางหลังล็อกอิน() {
    return ค่าจากURL("redirect") || "index.html";
  }

  function แสดงเตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }

  function ซ่อนเตือน() {
    กล่องเตือน.classList.add("hidden");
  }

  ฟอร์มเข้าสู่ระบบ.addEventListener("submit", function (e) {
    e.preventDefault();
    ซ่อนเตือน();

    var อีเมล = document.getElementById("loginEmail").value.trim();
    var รหัสผ่าน = document.getElementById("loginPassword").value;

    if (!อีเมล || !รหัสผ่าน) {
      แสดงเตือน("กรอกอีเมลและรหัสผ่านให้ครบก่อนเข้าสู่ระบบ");
      return;
    }

    auth.signInWithEmailAndPassword(อีเมล, รหัสผ่าน)
      .then(function () {
        location.href = ปลายทางหลังล็อกอิน();
      })
      .catch(function (error) {
        แสดงเตือน("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
      });
  });

  ฟอร์มสมัครสมาชิก.addEventListener("submit", function (e) {
    e.preventDefault();
    ซ่อนเตือน();

    var ชื่อ = document.getElementById("signupName").value.trim();
    var อีเมล = document.getElementById("signupEmail").value.trim();
    var รหัสผ่าน = document.getElementById("signupPassword").value;

    if (!ชื่อ || !อีเมล || !รหัสผ่าน) {
      แสดงเตือน("กรอกชื่อ อีเมล และรหัสผ่านให้ครบก่อนสมัครสมาชิก");
      return;
    }

    var ผู้ใช้ใหม่ = null;

    auth.createUserWithEmailAndPassword(อีเมล, รหัสผ่าน)
      .then(function (ผลลัพธ์) {
        ผู้ใช้ใหม่ = ผลลัพธ์.user;
        return ผู้ใช้ใหม่.updateProfile({ displayName: ชื่อ });
      })
      .then(function () {
        // ผู้สมัครใหม่ทุกคนได้ role เริ่มต้นเป็น employee เสมอ ห้ามให้เลือกเอง
        return db.collection("users").doc(ผู้ใช้ใหม่.uid).set({
          name: ชื่อ,
          email: อีเมล,
          role: "employee"
        });
      })
      .then(function () {
        location.href = ปลายทางหลังล็อกอิน();
      })
      .catch(function (error) {
        แสดงเตือน("สมัครสมาชิกไม่สำเร็จ: " + error.message);
      });
  });
})();

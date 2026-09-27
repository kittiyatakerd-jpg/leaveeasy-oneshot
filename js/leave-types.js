// ─────────────────────────────────────────────────────────────
// js/leave-types.js — หน้าที่ 4 จัดการประเภทการลา
// CRUD ที่สมบูรณ์ บนฐานข้อมูล Firestore
// ─────────────────────────────────────────────────────────────

(function () {
  เมื่อรู้ผู้ใช้(function (ผู้ใช้) {
  var ที่วางตาราง = document.getElementById("ตารางประเภท");
  var ช่องชื่อใหม่ = document.getElementById("ชื่อประเภทใหม่");
  var กล่องเตือน = document.getElementById("เตือนประเภท");

  // อ่านประเภทการลาจาก Firestore แล้วแสดงในตาราง
  db.collection("leaveTypes").onSnapshot(function (querySnapshot) {
    var รายการ = [];
    querySnapshot.forEach(function (doc) {
      var ประเภท = doc.data();
      ประเภท.id = doc.id;
      รายการ.push(ประเภท);
    });
    วาดตาราง(รายการ);
  });

  function วาดตาราง(รายการ) {
    if (รายการ.length === 0) {
      ที่วางตาราง.innerHTML = "<p>ยังไม่มีประเภทการลาในระบบ</p>";
      return;
    }

    var html = "<table><thead><tr><th>ชื่อประเภทการลา</th><th>จัดการ</th></tr></thead><tbody>";
    รายการ.forEach(function (ประเภท) {
      html +=
        "<tr><td>" + esc(ประเภท.name) + "</td><td>" +
        '<button type="button" class="btn-ghost" data-edit="' + esc(ประเภท.id) + '">แก้ไข</button> ' +
        '<button type="button" class="btn-danger" data-del="' + esc(ประเภท.id) + '" data-name="' + esc(ประเภท.name) + '">ลบ</button>' +
        "</td></tr>";
    });
    html += "</tbody></table>";
    ที่วางตาราง.innerHTML = html;

    ที่วางตาราง.querySelectorAll("[data-edit]").forEach(function (ปุ่ม) {
      ปุ่ม.addEventListener("click", function () { แก้ประเภท(ปุ่ม.dataset.edit); });
    });
    ที่วางตาราง.querySelectorAll("[data-del]").forEach(function (ปุ่ม) {
      ปุ่ม.addEventListener("click", function () { ลบประเภท(ปุ่ม.dataset.del, ปุ่ม.dataset.name); });
    });
  }

  document.getElementById("ปุ่มเพิ่ม").addEventListener("click", เพิ่มประเภท);

  function เพิ่มประเภท() {
    var ชื่อ = ช่องชื่อใหม่.value.trim();
    if (!ชื่อ) {
      กล่องเตือน.textContent = "⚠️ พิมพ์ชื่อประเภทการลาก่อน จึงจะเพิ่มได้";
      กล่องเตือน.classList.remove("hidden");
      return;
    }
    กล่องเตือน.classList.add("hidden");

    // บันทึกลง Firestore
    db.collection("leaveTypes").add({ name: ชื่อ })
      .then(function () {
        ช่องชื่อใหม่.value = "";
      })
      .catch(function (error) {
        กล่องเตือน.textContent = "⚠️ เกิดข้อผิดพลาด: " + error.message;
        กล่องเตือน.classList.remove("hidden");
      });
  }

  function แก้ประเภท(id) {
    db.collection("leaveTypes").doc(id).get().then(function (doc) {
      if (!doc.exists) {
        alert("ประเภทการลาหายไป");
        return;
      }

      var ประเภท = doc.data();
      var ชื่อใหม่ = prompt("แก้ชื่อประเภทการลา", ประเภท.name);
      if (ชื่อใหม่ === null) return;              // กดยกเลิก
      if (!ชื่อใหม่.trim()) { alert("ชื่อประเภทการลาว่างเปล่าไม่ได้"); return; }

      db.collection("leaveTypes").doc(id).update({ name: ชื่อใหม่.trim() })
        .catch(function (error) {
          alert("เกิดข้อผิดพลาด: " + error.message);
        });
    });
  }

  function ลบประเภท(id, ชื่อ) {
    if (!confirm('ยืนยันการลบประเภท "' + ชื่อ + '" หรือไม่')) return;

    db.collection("leaveTypes").doc(id).delete()
      .catch(function (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
      });
  }
  });
})();

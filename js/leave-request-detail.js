// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// อ่าน/แสดง/แก้ข้อมูลใบลา และความเห็น (subcollection approvals)
// ─────────────────────────────────────────────────────────────

(function () {
  เมื่อรู้ผู้ใช้(function (ผู้ใช้) {
  var รหัสใบลา = ค่าจากURL("id");
  var กล่องใบลา = document.getElementById("กล่องใบลา");
  var กล่องความเห็น = document.getElementById("กล่องความเห็น");
  var ใบ = null;
  var ความเห็น = [];

  // อ่านข้อมูลใบลา
  db.collection("leaveRequests").doc(รหัสใบลา).onSnapshot(function (doc) {
    if (!doc.exists) {
      กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
      return;
    }

    ใบ = doc.data();
    ใบ.id = doc.id;
    วาดใบลา();
    วาดสรุปAI();
  }, function (err) {
    กล่องใบลา.innerHTML = "<p>เปิดใบลานี้ไม่ได้ — คุณอาจไม่มีสิทธิ์เข้าถึง (" + esc(err.message) + ")</p>";
  });

  // อ่านความเห็น (approvals) จากโฟลเดอร์ย่อย
  db.collection("leaveRequests").doc(รหัสใบลา).collection("approvals").onSnapshot(function (querySnapshot) {
    ความเห็น = [];
    querySnapshot.forEach(function (doc) {
      var approval = doc.data();
      approval.id = doc.id;
      ความเห็น.push(approval);
    });
    if (ใบ) วาดความเห็น();
  }, function () {
    // ไม่มีสิทธิ์อ่านความเห็น — ปล่อยให้ error หลักด้านบน (อ่านใบลา) เป็นตัวแจ้งผู้ใช้แทน
  });

  // ── วาดข้อมูลใบลาลงหน้าจอ ──
  function วาดใบลา() {
    var แถว = [
      ["หัวข้อ", esc(ใบ.title)],
      ["เหตุผลการลา", esc(ใบ.reason)],
      ["ประเภทการลา", esc(ใบ.leaveTypeName)],
      ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
      ["ผู้ขอลา", esc(ใบ.requesterName)],
      ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
      ["สถานะ", ป้ายสถานะ(ใบ.status)],
      ["วันที่ยื่น", esc(ใบ.createdAt)]
    ];

    var html = แถว.map(function (r) {
      return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");

    // ปุ่มอนุมัติ / ไม่อนุมัติ ขึ้นเฉพาะใบที่ยังรอพิจารณา
    if (ใบ.status === "รอพิจารณา") {
      html +=
        '<div class="btn-row">' +
        '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
        '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>' +
        '</div>';
    } else {
      html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้</p>';
    }

    // ปุ่มลบ ขึ้นเฉพาะใบที่สถานะ รอพิจารณา
    if (ใบ.status === "รอพิจารณา") {
      html += '<div class="btn-row"><button type="button" class="btn-danger" id="ปุ่มลบใบลา">ลบใบลานี้</button></div>';
    }

    กล่องใบลา.innerHTML = html;

    if (ใบ.status === "รอพิจารณา") {
      document.getElementById("ปุ่มอนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
      document.getElementById("ปุ่มไม่อนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
    }

    var ปุ่มลบ = document.getElementById("ปุ่มลบใบลา");
    if (ปุ่มลบ) {
      ปุ่มลบ.addEventListener("click", ลบใบลา);
    }

    กล่องความเห็น.classList.remove("hidden");
  }

  // ผูกปุ่มส่งความเห็นครั้งเดียวตรงนี้ (ไม่ใช่ใน วาดใบลา()) เพราะปุ่มนี้ไม่ได้ถูกสร้างใหม่ทุกครั้งที่ข้อมูลอัปเดต
  // ถ้าผูกซ้ำในนั้นจะเกิด listener ซ้อนกันหลายชั้นเมื่อ onSnapshot ทำงานมากกว่า 1 ครั้ง
  document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);
  document.getElementById("ปุ่มAIสรุป").addEventListener("click", ขอสรุปจากAI);

  // ── เปลี่ยนสถานะ (แก้เฉพาะ status field) ──
  function เปลี่ยนสถานะ(สถานะใหม่) {
    // กฎ: จะไม่อนุมัติได้ ต้องมีความเห็นอย่างน้อย 1 รายการก่อน
    if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
      alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
      return;
    }

    // อัปเดตเฉพาะ status field โดยใช้ update() ไม่ใช่ set()
    db.collection("leaveRequests").doc(รหัสใบลา).update({
      status: สถานะใหม่
    }).catch(function (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    });
  }

  // ── ลบใบลา (ต้องยืนยันก่อน) ──
  function ลบใบลา() {
    if (!confirm('ยืนยันการลบใบลา "' + ใบ.title + '" หรือไม่')) {
      return;
    }

    // ลบใบลาจาก Firestore
    db.collection("leaveRequests").doc(รหัสใบลา).delete().then(function () {
      location.href = "leave-requests.html";
    }).catch(function (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    });
  }

  // ── รายการความเห็น เรียงจากเก่าไปใหม่ ──
  function วาดความเห็น() {
    var ที่วาง = document.getElementById("รายการความเห็น");
    if (ความเห็น.length === 0) {
      ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
      return;
    }
    ที่วาง.innerHTML = ความเห็น
      .slice()
      .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; })
      .map(function (c) {
        return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
               "</div><div>" + esc(c.message) + "</div></div>";
      }).join("");
  }

  // ── สรุปใบลาโดย AI (ผู้ช่วย AI ระดับ 2) ──
  // AI แค่สรุปสาระสำคัญให้หัวหน้าอ่าน — ไม่แนะนำว่าควรอนุมัติหรือไม่ และไม่แตะ status เด็ดขาด
  // ผลเก็บใน field aiSuggestion (แก้เฉพาะ field นี้) + log ทุกครั้งใน leaveRequests/{id}/aiLog
  var กล่องสรุปAI = document.getElementById("กล่องสรุปAI");
  var ข้อความสรุปAI = document.getElementById("ข้อความสรุปAI");
  var เตือนสรุปAI = document.getElementById("เตือนสรุปAI");
  var ปุ่มAIสรุป = document.getElementById("ปุ่มAIสรุป");
  var ข้อความปุ่มAIสรุป = ปุ่มAIสรุป.textContent;

  // แสดงสรุปเดิมที่บันทึกไว้แล้ว (reload หน้าแล้วยังเห็น ไม่ต้องกดใหม่)
  function วาดสรุปAI() {
    กล่องสรุปAI.classList.remove("hidden");
    if (ใบ.aiSuggestion) {
      แสดงสรุปAI(ใบ.aiSuggestion);
    }
  }

  function แสดงสรุปAI(ข้อความ) {
    ข้อความสรุปAI.textContent = "🤖 สรุปจาก AI — โปรดอ่านใบลาฉบับเต็มประกอบก่อนตัดสินใจ: " + ข้อความ;
    ข้อความสรุปAI.classList.remove("hidden");
  }

  function เตือนAI(ข้อความ) {
    เตือนสรุปAI.textContent = "⚠️ " + ข้อความ;
    เตือนสรุปAI.classList.remove("hidden");
  }

  function ขอสรุปจากAI() {
    if (!ใบ) return;
    เตือนสรุปAI.classList.add("hidden");
    ปุ่มAIสรุป.disabled = true;
    ปุ่มAIสรุป.textContent = "กำลังคิด...";

    var รายการความเห็น = ความเห็น
      .slice()
      .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; })
      .map(function (c) { return "- " + c.authorName + " (" + c.createdAt + "): " + c.message; });

    var คำสั่งระบบ =
      "คุณเป็นผู้ช่วยสรุปใบลาให้หัวหน้าอ่าน สรุปสาระสำคัญของใบลาและความเห็นเป็นภาษาไทย ไม่เกิน 3 ประโยค " +
      "ห้ามแนะนำหรือบอกเป็นนัยว่าควรอนุมัติหรือไม่อนุมัติ ห้ามแสดงความเห็นส่วนตัว สรุปเฉพาะข้อเท็จจริงที่ให้มา";
    var คำถาม =
      "หัวข้อ: " + ใบ.title + "\n" +
      "เหตุผลการลา: " + ใบ.reason + "\n" +
      "ประเภทการลา: " + ใบ.leaveTypeName + "\n" +
      "วันที่ลา: " + ใบ.startDate + " ถึง " + ใบ.endDate + "\n" +
      "ผู้ขอลา: " + ใบ.requesterName + "\n" +
      "ความเห็นที่มีอยู่:\n" + (รายการความเห็น.length ? รายการความเห็น.join("\n") : "- (ยังไม่มีความเห็น)");

    ถามAI(คำสั่งระบบ, คำถาม).then(function (คำตอบ) {
      แสดงสรุปAI(คำตอบ);

      var อ้างอิงใบ = db.collection("leaveRequests").doc(รหัสใบลา);
      // เขียนกลับเฉพาะ aiSuggestion ด้วย update() — ไม่แตะ status หรือ field อื่น
      var งานบันทึกสรุป = อ้างอิงใบ.update({ aiSuggestion: คำตอบ });
      var งานบันทึกlog = อ้างอิงใบ.collection("aiLog").add({
        input: คำถาม,
        output: คำตอบ,
        createdAt: เวลาตอนนี้()
      });

      return Promise.all([
        งานบันทึกสรุป.catch(function (e) { return "บันทึกสรุปไม่สำเร็จ: " + e.message; }),
        งานบันทึกlog.catch(function (e) { return "บันทึก log ไม่สำเร็จ: " + e.message; })
      ]).then(function (ผล) {
        var ข้อผิดพลาด = ผล.filter(function (x) { return typeof x === "string"; });
        if (ข้อผิดพลาด.length) {
          เตือนAI(ข้อผิดพลาด.join(" · ") + " — สรุปด้านบนแสดงชั่วคราว ยังไม่ได้บันทึกลงระบบ");
        }
      });
    }).catch(function (error) {
      เตือนAI("เรียก AI ไม่สำเร็จ (" + error.message + ") — ส่วนอื่นของหน้ายังใช้งานได้ตามปกติ");
    }).finally(function () {
      ปุ่มAIสรุป.disabled = false;
      ปุ่มAIสรุป.textContent = ข้อความปุ่มAIสรุป;
    });
  }

  // ── ส่งความเห็นใหม่ ──
  function ส่งความเห็น() {
    var ช่อง = document.getElementById("ข้อความความเห็น");
    var เตือน = document.getElementById("เตือนความเห็น");
    var ข้อความ = ช่อง.value.trim();

    if (!ข้อความ) {
      เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
      เตือน.classList.remove("hidden");
      return;
    }
    เตือน.classList.add("hidden");

    // ผู้เขียนความเห็นคือคนที่ล็อกอินอยู่จริง (ผู้ใช้ มาจาก เมื่อรู้ผู้ใช้)
    var approvalใหม่ = {
      authorId: ผู้ใช้.uid,
      authorName: ผู้ใช้.displayName || ผู้ใช้.email,
      message: ข้อความ,
      createdAt: เวลาตอนนี้()
    };

    // บันทึกลงโฟลเดอร์ย่อย approvals
    db.collection("leaveRequests").doc(รหัสใบลา).collection("approvals").add(approvalใหม่)
      .then(function () {
        ช่อง.value = "";
      })
      .catch(function (error) {
        เตือน.textContent = "⚠️ เกิดข้อผิดพลาด: " + error.message;
        เตือน.classList.remove("hidden");
      });
  }
  });
})();

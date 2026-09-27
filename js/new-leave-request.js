// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// อ่านประเภทการลาจาก Firestore, บันทึกใบลาใหม่ลง Firestore
// ─────────────────────────────────────────────────────────────

(function () {
  เมื่อรู้ผู้ใช้(function (ผู้ใช้) {
  var ฟอร์ม = document.getElementById("ฟอร์มใบลา");
  var ช่องประเภท = document.getElementById("leaveTypeId");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");

  // อ่านประเภทการลาจาก Firestore
  db.collection("leaveTypes").onSnapshot(function (querySnapshot) {
    // ล้างรายการเดิม เหลือแต่ option แรก
    ช่องประเภท.innerHTML = '<option value="">— เลือกประเภทการลา —</option>';

    querySnapshot.forEach(function (doc) {
      var ประเภท = doc.data();
      var ตัวเลือก = document.createElement("option");
      ตัวเลือก.value = doc.id;
      ตัวเลือก.textContent = ประเภท.name;
      ช่องประเภท.appendChild(ตัวเลือก);
    });
  });

  ฟอร์ม.addEventListener("submit", function (e) {
    e.preventDefault();

    var ค่า = {
      title: document.getElementById("title").value.trim(),
      reason: document.getElementById("reason").value.trim(),
      leaveTypeId: ช่องประเภท.value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value
    };

    // ตรวจว่ากรอกครบก่อนบันทึก
    if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
      return;
    }
    if (ค่า.endDate < ค่า.startDate) {
      เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
      return;
    }

    // อ่านชื่อประเภทการลา
    db.collection("leaveTypes").doc(ค่า.leaveTypeId).get().then(function (doc) {
      if (!doc.exists) {
        เตือน("ประเภทการลาที่เลือกหายไป");
        return;
      }

      var ประเภท = doc.data();

      // ผู้ขอลาคือคนที่ล็อกอินอยู่จริง (ผู้ใช้ มาจาก เมื่อรู้ผู้ใช้)
      var ใบใหม่ = {
        title: ค่า.title,
        reason: ค่า.reason,
        status: "รอพิจารณา",                       // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
        requesterId: ผู้ใช้.uid,
        requesterName: ผู้ใช้.displayName || ผู้ใช้.email,
        approverId: "",
        approverName: "",
        leaveTypeId: ค่า.leaveTypeId,
        leaveTypeName: ประเภท.name,
        startDate: ค่า.startDate,
        endDate: ค่า.endDate,
        createdAt: เวลาตอนนี้()
      };

      // บันทึกลง Firestore
      db.collection("leaveRequests").add(ใบใหม่).then(function () {
        location.href = "leave-requests.html";
      }).catch(function (error) {
        เตือน("เกิดข้อผิดพลาด: " + error.message);
      });
    });
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }

  // ── ปุ่มให้ AI ช่วยจัดประเภทการลา (US-09) ──
  // AI แค่ "เสนอ" ค่าใน dropdown ผู้ใช้แก้เองได้เสมอ · เรียกไม่สำเร็จก็ไม่บล็อกปุ่มบันทึก
  var ปุ่มAI = document.getElementById("ปุ่มAIจัดประเภท");
  var กล่องข้อเสนอAI = document.getElementById("กล่องข้อเสนอAI");
  var ข้อความปุ่มAI = ปุ่มAI.textContent;

  ปุ่มAI.addEventListener("click", function () {
    var เหตุผล = document.getElementById("reason").value.trim();
    if (!เหตุผล) {
      แสดงข้อเสนอAI("⚠️ พิมพ์เหตุผลการลาก่อน แล้วค่อยให้ AI ช่วยจัดประเภท");
      return;
    }

    ปุ่มAI.disabled = true;
    ปุ่มAI.textContent = "กำลังคิด...";

    // ดึงรายชื่อประเภทการลาที่มีอยู่จริงจาก Firestore ณ ตอนกดปุ่ม
    db.collection("leaveTypes").get().then(function (querySnapshot) {
      var รายการประเภท = [];
      querySnapshot.forEach(function (doc) {
        รายการประเภท.push({ id: doc.id, name: doc.data().name });
      });
      if (รายการประเภท.length === 0) throw new Error("ยังไม่มีประเภทการลาในระบบ");

      var ชื่อทั้งหมด = รายการประเภท.map(function (t) { return t.name; });
      var คำสั่งระบบ =
        "คุณเป็นผู้ช่วยจัดประเภทใบลา ให้เลือกประเภทการลาที่เหมาะสมที่สุดจากรายการที่กำหนดเท่านั้น " +
        "ตอบเป็นชื่อประเภทตรงตัวตามรายการเพียงคำเดียว ห้ามมีคำอธิบาย ห้ามมีเครื่องหมายวรรคตอน " +
        "ถ้าไม่เข้ากับประเภทใดเลยให้ตอบว่า ไม่ทราบ";
      var คำถาม = "รายการประเภทการลา: " + ชื่อทั้งหมด.join(", ") + "\nเหตุผลการลา: " + เหตุผล;

      return ถามAI(คำสั่งระบบ, คำถาม).then(function (คำตอบ) {
        // ตัดช่องว่าง/เครื่องหมายคำพูด/จุดที่ AI อาจเผลอใส่มาหัวท้าย แล้วเทียบแบบตรงตัว
        var ชื่อที่ได้ = คำตอบ.replace(/^[\s"'“”‘’`.]+|[\s"'“”‘’`.]+$/g, "");
        var ที่ตรง = รายการประเภท.filter(function (t) { return t.name === ชื่อที่ได้; })[0];

        if (ที่ตรง) {
          ช่องประเภท.value = ที่ตรง.id;
          แสดงข้อเสนอAI("🤖 ข้อเสนอจาก AI — โปรดตรวจสอบก่อนยืนยัน: " + ที่ตรง.name);
        } else {
          แสดงข้อเสนอAI("🤖 AI จัดประเภทให้ไม่ได้ — ไม่ได้เปลี่ยนค่าเดิม โปรดเลือกประเภทการลาเอง");
        }
      });
    }).catch(function (error) {
      แสดงข้อเสนอAI("⚠️ เรียก AI ไม่สำเร็จ (" + error.message + ") — ยังเลือกประเภทและบันทึกใบลาเองได้ตามปกติ");
    }).finally(function () {
      ปุ่มAI.disabled = false;
      ปุ่มAI.textContent = ข้อความปุ่มAI;
    });
  });

  function แสดงข้อเสนอAI(ข้อความ) {
    กล่องข้อเสนอAI.textContent = ข้อความ;
    กล่องข้อเสนอAI.classList.remove("hidden");
  }
  });
})();

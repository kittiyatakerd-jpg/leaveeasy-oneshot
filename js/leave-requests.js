// ─────────────────────────────────────────────────────────────
// js/leave-requests.js — หน้าที่ 1 รายการใบลา
// อ่านจาก Firestore collection leaveRequests
// ─────────────────────────────────────────────────────────────

(function () {
  เมื่อรู้ผู้ใช้(function (ผู้ใช้) {
  var กล่อง = document.getElementById("ผลลัพธ์");

  // กฎความปลอดภัยกำหนดว่า employee อ่านได้เฉพาะใบของตัวเอง (query ต้องกรองด้วย where ก่อน
  // ถ้าไม่กรองแล้ว query ทั้งคอลเลกชัน Firestore จะปฏิเสธทั้งชุดทันที) ส่วน manager/hr อ่านได้ทุกใบ
  // จึงต้องเช็ค role ก่อนว่าจะ query แบบไหน
  db.collection("users").doc(ผู้ใช้.uid).get().then(function (เอกสารผู้ใช้) {
    var role = เอกสารผู้ใช้.exists ? เอกสารผู้ใช้.data().role : "employee";
    var query = (role === "manager" || role === "hr")
      ? db.collection("leaveRequests")
      : db.collection("leaveRequests").where("requesterId", "==", ผู้ใช้.uid);

    query.onSnapshot(function (querySnapshot) {
      var ใบลาทั้งหมด = [];
      querySnapshot.forEach(function (doc) {
        var ข้อมูล = doc.data();
        ข้อมูล.id = doc.id;
        ใบลาทั้งหมด.push(ข้อมูล);
      });

      // ถ้ามีสถานะติดมาท้าย URL ให้กรองเฉพาะสถานะนั้น
      var สถานะที่กรอง = ค่าจากURL("status");
      var ผลลัพธ์ = ใบลาทั้งหมด;
      if (สถานะที่กรอง) {
        ผลลัพธ์ = ผลลัพธ์.filter(function (ใบ) { return ใบ.status === สถานะที่กรอง; });
        document.querySelector(".subtitle").textContent =
          "กำลังแสดงเฉพาะใบลาที่สถานะ " + สถานะที่กรอง + " · กดเมนู รายการใบลา เพื่อดูทั้งหมด";
      }

      แสดงตาราง(ผลลัพธ์);
    }, function (err) {
      กล่อง.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ: " + esc(err.message) + "</p>";
    });
  });

  function แสดงตาราง(รายการ) {
    if (รายการ.length === 0) {
      กล่อง.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    var html =
      "<table><thead><tr>" +
      "<th>หัวข้อ</th>" +
      "<th>ประเภทการลา</th>" +
      "<th>สถานะ</th>" +
      '<th class="hide-mobile">ผู้ขอลา</th>' +
      '<th class="hide-mobile">วันที่ลา</th>' +
      "</tr></thead><tbody>";

    รายการ.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    กล่อง.innerHTML = html;

    // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
    กล่อง.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
  });
})();

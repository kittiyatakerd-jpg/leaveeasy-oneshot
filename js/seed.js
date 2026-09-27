// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างลงฐานข้อมูล Firestore
// เครื่องมือพัฒนาเท่านั้น ไม่ใช่ส่วนของระบบจริง
// ─────────────────────────────────────────────────────────────

(function () {
  เมื่อรู้ผู้ใช้(function (ผู้ใช้) {
  var ปุ่ม = document.getElementById("seedButton");
  var ข้อความสถานะ = document.getElementById("statusMessage");

  ปุ่ม.addEventListener("click", ใส่ข้อมูลตัวอย่าง);

  function ใส่ข้อมูลตัวอย่าง() {
    ปุ่ม.disabled = true;
    ปุ่ม.textContent = "กำลังใส่ข้อมูล…";

    // ผู้ใช้ 3 คน
    var ผู้ใช้ = {
      u001: { name: "สมชาย ใจดี", email: "somchai@example.com", role: "employee" },
      u002: { name: "สมหญิง รักงาน", email: "somying@example.com", role: "manager" },
      u003: { name: "สมศรี ตั้งใจ", email: "somsri@example.com", role: "hr" }
    };

    // ประเภทการลา 3 แบบ
    var ประเภทการลา = {
      lt001: { name: "ลาพักร้อน" },
      lt002: { name: "ลาป่วย" },
      lt003: { name: "ลากิจ" }
    };

    // ใบขอลา 5 ใบ
    var ใบขอลา = {
      lr001: {
        title: "ลาพักร้อนไปเที่ยวกับครอบครัว",
        reason: "วางแผนเดินทางไปต่างจังหวัดกับครอบครัว จองที่พักไว้ล่วงหน้าแล้ว",
        status: "รอพิจารณา",
        requesterId: "u001", requesterName: "สมชาย ใจดี",
        approverId: "u002", approverName: "สมหญิง รักงาน",
        leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
        startDate: "2026-09-07", endDate: "2026-09-09",
        createdAt: "2026-09-01 09:15"
      },
      lr002: {
        title: "ลาป่วยไข้หวัดใหญ่",
        reason: "มีไข้สูงและไอมาก แพทย์แนะนำให้พักอยู่บ้าน 2 วัน",
        status: "อนุมัติ",
        requesterId: "u001", requesterName: "สมชาย ใจดี",
        approverId: "u002", approverName: "สมหญิง รักงาน",
        leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
        startDate: "2026-08-24", endDate: "2026-08-25",
        createdAt: "2026-08-24 08:05"
      },
      lr003: {
        title: "ลากิจไปทำบัตรประชาชน",
        reason: "บัตรประชาชนหมดอายุ ต้องไปทำที่สำนักงานเขตในวันทำการ",
        status: "รอพิจารณา",
        requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
        approverId: "", approverName: "",
        leaveTypeId: "lt003", leaveTypeName: "ลากิจ",
        startDate: "2026-09-15", endDate: "2026-09-15",
        createdAt: "2026-09-10 16:30"
      },
      lr004: {
        title: "ลาพักร้อนช่วงวันหยุดยาว",
        reason: "อยากต่อวันหยุดยาวไปพักผ่อนกับครอบครัวอีก 3 วัน",
        status: "ไม่อนุมัติ",
        requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
        approverId: "u002", approverName: "สมหญิง รักงาน",
        leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
        startDate: "2026-10-12", endDate: "2026-10-16",
        createdAt: "2026-09-20 11:00"
      },
      lr005: {
        title: "ลาป่วยไปพบแพทย์ตามนัด",
        reason: "มีนัดตรวจติดตามอาการกับแพทย์ในช่วงเช้า",
        status: "รอพิจารณา",
        requesterId: "u001", requesterName: "สมชาย ใจดี",
        approverId: "u002", approverName: "สมหญิง รักงาน",
        leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
        startDate: "2026-09-22", endDate: "2026-09-22",
        createdAt: "2026-09-18 14:45"
      }
    };

    // ความเห็นการอนุมัติ (จะบันทึกลงโฟลเดอร์ย่อย approvals)
    var ความเห็น = {
      lr001: [
        {
          authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "รับเรื่องแล้ว ขอดูตารางงานของทีมช่วงนั้นก่อนนะครับ",
          createdAt: "2026-09-01 13:40"
        },
        {
          authorId: "u003", authorName: "สมศรี ตั้งใจ",
          message: "ตรวจแล้ว วันลาพักร้อนคงเหลือครอบคลุมช่วงที่ขอ ไม่ติดขัดฝั่งฝ่ายบุคคล",
          createdAt: "2026-09-02 10:05"
        }
      ],
      lr002: [
        {
          authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "อนุมัติแล้ว พักผ่อนให้เต็มที่ งานที่ค้างไว้เดี๋ยวทีมช่วยดูให้",
          createdAt: "2026-08-24 09:20"
        }
      ],
      lr004: [
        {
          authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "ช่วงนั้นทีมมีงานส่งมอบพอดี ขอเลื่อนเป็นสัปดาห์ถัดไปได้ไหมครับ",
          createdAt: "2026-09-20 15:10"
        }
      ]
    };

    // เริ่มบันทึกข้อมูล
    บันทึกผู้ใช้()
      .then(function () { return บันทึกประเภทการลา(); })
      .then(function () { return บันทึกใบขอลา(); })
      .then(function () {
        ข้อความสถานะ.style.color = "green";
        ข้อความสถานะ.textContent = "✅ ใส่ข้อมูลตัวอย่างเสร็จแล้ว!";
        ปุ่ม.textContent = "✅ เสร็จแล้ว";
      })
      .catch(function (error) {
        ข้อความสถานะ.style.color = "red";
        ข้อความสถานะ.textContent = "❌ เกิดข้อผิดพลาด: " + error.message;
        ปุ่ม.textContent = "📥 ใส่ข้อมูลตัวอย่าง";
        ปุ่ม.disabled = false;
      });

    function บันทึกผู้ใช้() {
      return Promise.all(Object.keys(ผู้ใช้).map(function (id) {
        return db.collection("users").doc(id).set(ผู้ใช้[id]);
      }));
    }

    function บันทึกประเภทการลา() {
      return Promise.all(Object.keys(ประเภทการลา).map(function (id) {
        return db.collection("leaveTypes").doc(id).set(ประเภทการลา[id]);
      }));
    }

    function บันทึกใบขอลา() {
      return Promise.all(Object.keys(ใบขอลา).map(function (id) {
        return db.collection("leaveRequests").doc(id).set(ใบขอลา[id])
          .then(function () {
            // บันทึกความเห็น (approvals) สำหรับใบที่มีความเห็น
            if (ความเห็น[id]) {
              return Promise.all(ความเห็น[id].map(function (approval) {
                return db.collection("leaveRequests").doc(id)
                  .collection("approvals").add(approval);
              }));
            }
            return Promise.resolve();
          });
      }));
    }
  }
  });
})();

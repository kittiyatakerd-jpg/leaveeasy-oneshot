// ─────────────────────────────────────────────────────────────
// tests/leaveeasy.spec.js — ชุดทดสอบอัตโนมัติ 5 ตัวตามใบงานสัปดาห์ที่ 9
// รันด้วย: npx playwright test
// ต้องมีเซิร์ฟเวอร์รันอยู่ที่ http://localhost:5174 ก่อน (python3 -m http.server 5174)
// และต้องมีบัญชีทดสอบสมัครไว้แล้วใน Firebase Auth ของโปรเจกต์ leaveeasy-oneshot-kittiya:
//   oneshot-emp1@example.com / password123  (role: employee)
//   oneshot-emp2@example.com / password123  (role: employee)
//   oneshot-hr@example.com   / password123  (role: hr)
// ─────────────────────────────────────────────────────────────

const { test, expect } = require("@playwright/test");

test.describe.configure({ mode: "serial" });

async function signIn(page, email, password) {
  await page.goto("/login.html");
  await page.evaluate(
    ({ email, password }) => auth.signInWithEmailAndPassword(email, password),
    { email, password }
  );
  await page.waitForTimeout(500);
}

async function signOut(page) {
  await page.evaluate(() => auth.signOut()).catch(() => {});
}

test("1) ยื่นใบลา → เห็นในรายการ → รีเฟรชแล้วยังอยู่", async ({ page }) => {
  const หัวข้อ = "[playwright] ลากิจ " + Date.now();

  await signIn(page, "oneshot-emp1@example.com", "password123");
  await page.goto("/new-leave-request.html");

  await page.getByRole("textbox", { name: "หัวข้อ" }).fill(หัวข้อ);
  await page.getByRole("textbox", { name: "เหตุผลการลา" }).fill("ทดสอบอัตโนมัติด้วย Playwright");
  await page.getByLabel("ประเภทการลา").selectOption({ index: 1 });
  await page.getByRole("textbox", { name: "วันที่เริ่มลา" }).fill("2026-12-01");
  await page.getByRole("textbox", { name: "วันที่สิ้นสุด" }).fill("2026-12-01");
  await page.getByRole("button", { name: "บันทึก" }).click();

  await expect(page).toHaveURL(/leave-requests\.html/);
  await expect(page.getByText(หัวข้อ)).toBeVisible();

  // รีเฟรชหน้า — ต้องอ่านจาก Firestore จริง ไม่ใช่จำไว้ในหน่วยความจำ
  await page.reload();
  await expect(page.getByText(หัวข้อ)).toBeVisible();
});

test("2) อนุมัติ → สถานะเปลี่ยนทันที", async ({ page }) => {
  await signOut(page);
  await signIn(page, "oneshot-hr@example.com", "password123");

  // หาใบล่าสุดของ emp1 ที่ยังรอพิจารณา แล้วเปิดหน้ารายละเอียด
  const requestId = await page.evaluate(async () => {
    const snap = await db.collection("leaveRequests").where("status", "==", "รอพิจารณา").limit(1).get();
    return snap.empty ? null : snap.docs[0].id;
  });
  expect(requestId).not.toBeNull();

  await page.goto(`/leave-request-detail.html?id=${requestId}`);
  await page.getByRole("button", { name: "อนุมัติ", exact: true }).click();

  await expect(page.getByText("อนุมัติ", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "อนุมัติ", exact: true })).toHaveCount(0);
});

test("3) กรอกฟอร์มไม่ครบ (เว้นหัวข้อ) → ต้องถูกปฏิเสธ", async ({ page }) => {
  await signOut(page);
  await signIn(page, "oneshot-emp1@example.com", "password123");
  await page.goto("/new-leave-request.html");

  await page.getByRole("textbox", { name: "เหตุผลการลา" }).fill("ทดสอบกรอกไม่ครบ");
  await page.getByLabel("ประเภทการลา").selectOption({ index: 1 });
  await page.getByRole("textbox", { name: "วันที่เริ่มลา" }).fill("2026-12-02");
  await page.getByRole("textbox", { name: "วันที่สิ้นสุด" }).fill("2026-12-02");
  await page.getByRole("button", { name: "บันทึก" }).click();

  await expect(page).toHaveURL(/new-leave-request\.html/); // ยังไม่ถูกพาไปหน้าอื่น
  await expect(page.getByText("กรอกไม่ครบ")).toBeVisible();
});

test("4) ⭐ ความปลอดภัย: ไม่ล็อกอิน → เปิดหน้ารายการไม่ได้", async ({ page }) => {
  await signOut(page);
  await page.goto("/leave-requests.html");
  await expect(page).toHaveURL(/login\.html/);
});

test("5) ⭐ ความปลอดภัย: บัญชีอื่นเปิดใบลาของคนอื่นไม่ได้", async ({ page }) => {
  await signIn(page, "oneshot-emp1@example.com", "password123");
  const requestId = await page.evaluate(async () => {
    const snap = await db.collection("leaveRequests").where("requesterId", "==", auth.currentUser.uid).limit(1).get();
    return snap.empty ? null : snap.docs[0].id;
  });
  expect(requestId).not.toBeNull();

  await signOut(page);
  await signIn(page, "oneshot-emp2@example.com", "password123");
  await page.goto(`/leave-request-detail.html?id=${requestId}`);

  await expect(page.getByText("ไม่มีสิทธิ์เข้าถึง")).toBeVisible();
});

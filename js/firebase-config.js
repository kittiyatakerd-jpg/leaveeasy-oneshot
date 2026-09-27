// ─────────────────────────────────────────────────────────────
// js/firebase-config.js — ตั้งค่าและเริ่มการเชื่อมต่อ Firebase
// ใช้ Firebase compat SDK (v8-style) ไม่มี build step ไม่ใช้ ES modules
// โปรเจกต์: leaveeasy-oneshot-kittiya (แยกจากโปรเจกต์เดิมทั้งหมด)
// ─────────────────────────────────────────────────────────────

var firebaseConfig = {
  apiKey: "AIzaSyBynGTWvfKzHcU6P_k64I0L961hgf1jurg",
  authDomain: "leaveeasy-oneshot-kittiya.firebaseapp.com",
  projectId: "leaveeasy-oneshot-kittiya",
  storageBucket: "leaveeasy-oneshot-kittiya.firebasestorage.app",
  messagingSenderId: "41981210346",
  appId: "1:41981210346:web:910c82588a2d8fba83b193"
};

firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var auth = firebase.auth();

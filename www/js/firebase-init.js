// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMi45go2kVHmVgv5Ea77oXbvEMetZpMLM",
  authDomain: "savio-app-savio.firebaseapp.com",
  projectId: "savio-app-savio",
  storageBucket: "savio-app-savio.firebasestorage.app",
  messagingSenderId: "809917177178",
  appId: "1:809917177178:web:afcf97bed688e574abe763"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.setCustomParameters({ prompt: "select_account" });

// دالة رفع البيانات إلى سحابة Firestore
async function syncToCloud(uid) {
  if (!uid) return;
  const backup = {};
  const keys = [
    "transactions",
    "accounts",
    "categories",
    "customCategoryIcons",
    "debts",
    "savioBudget",
    "currency",
    "theme",
    "language"
  ];
  keys.forEach(k => {
    const val = localStorage.getItem(k);
    if (val !== null) backup[k] = val;
  });
  await setDoc(doc(db, "users", uid), {
    data: backup,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// دالة تنزيل البيانات من سحابة Firestore واسترجاعها في الهاتف
async function syncFromCloud(uid) {
  if (!uid) return false;
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists() && snap.data().data) {
    const cloudData = snap.data().data;
    Object.keys(cloudData).forEach(k => {
      localStorage.setItem(k, cloudData[k]);
    });
    return true;
  }
  return false;
}

// تصدير للكائن العام window.Savio
window.Savio = window.Savio || {};
window.Savio.auth = auth;
window.Savio.db = db;
window.Savio.googleProvider = googleProvider;
window.Savio.signInWithPopup = signInWithPopup;
window.Savio.getRedirectResult = getRedirectResult;
window.Savio.signInWithRedirect = typeof signInWithRedirect !== "undefined" ? signInWithRedirect : null;
window.Savio.onAuthStateChanged = onAuthStateChanged;
window.Savio.signOut = signOut;
window.Savio.syncToCloud = syncToCloud;
window.Savio.syncFromCloud = syncFromCloud;
window.Savio.ready = true;
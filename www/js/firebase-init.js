// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// باقي ملفاتك JS بتشتغل بـ <script src="..."> عادي (مش type="module")
// فمينفعش تستخدم import/export فيها مباشرة.
// عشان كده بنحط كل حاجة محتاجينها على window.Savio عشان أي ملف عادي يقدر يوصلها.
window.Savio = window.Savio || {};
window.Savio.auth = auth;
window.Savio.db = db;
window.Savio.googleProvider = googleProvider;
window.Savio.signInWithRedirect = signInWithRedirect;
window.Savio.getRedirectResult = getRedirectResult;
window.Savio.onAuthStateChanged = onAuthStateChanged;
window.Savio.signOut = signOut;
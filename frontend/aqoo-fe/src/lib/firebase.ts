import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";

import { FirebaseOptions } from "firebase/app";

// Firebase 설정 객체 타입 지정
firebase.initializeApp({
  apiKey: FIREBASE-API-KEY,
  authDomain: AUTH-DOMAIN,
  projectId: PROJECT-ID,
  storageBucket: STORAGEBUCKET,
  messagingSenderId: FIREBASE-MESSAGE,
  appId: FIREBASE-APP-ID,
  measurementId: MEASUREMENT-ID,
});

// 중복 초기화 방지 (중요)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// console.log("✅ Firebase 앱 초기화 완료:", app);

export { app };

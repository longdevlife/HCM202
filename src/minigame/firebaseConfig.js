import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Cấu hình Firebase Realtime Database thực tế của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAnFuQqmtO8KimZhmVWxoBx3kSsCravBDw",
  authDomain: "minigamehcm202.firebaseapp.com",
  databaseURL: "https://minigamehcm202-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "minigamehcm202",
  storageBucket: "minigamehcm202.firebasestorage.app",
  messagingSenderId: "599249144434",
  appId: "1:599249144434:web:4b07539d341d67800b90eb",
  measurementId: "G-G3W6M79B5N"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Realtime Database
export const db = getDatabase(app);

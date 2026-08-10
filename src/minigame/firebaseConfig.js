import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Cấu hình Firebase Realtime Database thực tế của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBCwUrtaYUmQecaQpghFNt3l0nEwnKwjcE",
  authDomain: "mln122-game.firebaseapp.com",
  projectId: "mln122-game",
  storageBucket: "mln122-game.firebasestorage.app",
  messagingSenderId: "400918566706",
  appId: "1:400918566706:web:c771b3d67496eeb8eca92b",
  measurementId: "G-3LMZ0J3MCG",
  // URL Database Singapore mặc định. 
  // Nếu bạn chọn server Mỹ hoặc Châu Âu khi tạo Realtime Database, hãy thay thế URL này bằng URL hiển thị trên Firebase Console của bạn.
  databaseURL: "https://mln122-game-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Realtime Database
export const db = getDatabase(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCeWhc6QtSI0ZtNp_dKrEBJpYriHEjeUk",
  authDomain: "dashboard-775cf.firebaseapp.com",
  projectId: "dashboard-775cf",
  storageBucket: "dashboard-775cf.firebasestorage.app",
  messagingSenderId: "226618624590",
  appId: "1:226618624590:web:d66646df757b7f7e40911f",
  measurementId: "G-TJLSZ72H2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage=getStorage(app);
export {storage}
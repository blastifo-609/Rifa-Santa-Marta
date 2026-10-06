// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================
// Reemplaza TODOS los valores de abajo por los de TU proyecto.
// Los obtienes en: Firebase Console > (ícono engranaje) Configuración
// del proyecto > pestaña "General" > sección "Tus apps" > app web > "SDK
// setup and configuration" > opción "Config".
//
// IMPORTANTE: databaseURL solo aparece si ya creaste la Realtime
// Database. Si la creaste después de copiar esta configuración,
// ve a Realtime Database en el menú y copia la URL que aparece
// arriba de los datos (algo como
// https://TU-PROYECTO-default-rtdb.firebaseio.com).
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCu1jK76B-Q1fzRqnpVopbERvFx-k5_5SA",
  authDomain: "rifa-santa-marta.firebaseapp.com",
  databaseURL: "https://rifa-santa-marta-default-rtdb.firebaseio.com",
  projectId: "rifa-santa-marta",
  storageBucket: "rifa-santa-marta.firebasestorage.app",
  messagingSenderId: "194162681720",
  appId: "1:194162681720:web:6fe71ea606adbaadb28a8d",
  measurementId: "G-T9HTP58F5Y"
};

firebase.initializeApp(firebaseConfig);

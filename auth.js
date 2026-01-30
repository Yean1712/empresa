// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD5mkWosoBhPzxVLRk8b4xlEVRinEs_3xk",
  authDomain: "miweb-ee0a7.firebaseapp.com",
  projectId: "miweb-ee0a7",
  storageBucket: "miweb-ee0a7.firebasestorage.app",
  messagingSenderId: "1044426067343",
  appId: "1:1044426067343:web:cea4c14db368de1ec80ffa",
  measurementId: "G-HZ05NQ26CJ"
};

// Inicialización global
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- FUNCIÓN: REGISTRO ---
function nuevoRegistro() {
    const nombre = document.getElementById('nombreReal').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if (!nombre || !email || !pass) return alert("Por favor, completa todos los campos.");

    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            // Guardamos el nombre en Firestore vinculado al UID del usuario
            return db.collection("usuarios").doc(userCredential.user.uid).set({
                nombre: nombre,
                email: email,
                role: "user" 
            });
        })
        .then(() => { 
            alert("¡Registro exitoso! Bienvenido.");
            window.location.href = "index.html"; 
        })
        .catch((error) => alert("Error al registrar: " + error.message));
}

// --- FUNCIÓN: LOGIN ---
function acceder() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(() => { window.location.href = "index.html"; })
        .catch((error) => alert("❌ Datos incorrectos: " + error.message));
}

// --- MONITOR DE ESTADO DE SESIÓN ---
firebase.auth().onAuthStateChanged((user) => {
    const authLink = document.getElementById('auth-link');
    const path = window.location.pathname;

    if (user) {
        db.collection("usuarios").doc(user.uid).get().then((doc) => {
            let nombreUsuario = "Usuario";
            let rolUsuario = "user";

            if (doc.exists) {
                nombreUsuario = doc.data().nombre || "Ninja";
                rolUsuario = doc.data().role || "user";
            }

            if (authLink) {
                authLink.innerHTML = `Hola, ${nombreUsuario} (Salir)`;
                authLink.style.color = "#0071e3";
                authLink.onclick = () => firebase.auth().signOut().then(() => location.href="login.html");
                
                // Si es admin, mostramos botón al panel
                if (rolUsuario === "admin") {
                    authLink.innerHTML += ` | <a href="admin.html" style="color:#34c759; text-decoration:none; margin-left:8px;">Panel</a>`;
                }
            }

            // Seguridad para la página Admin
            if (path.includes("admin.html")) {
                if (rolUsuario === "admin") {
                    document.body.style.display = "block";
                } else {
                    window.location.href = "index.html";
                }
            }
        });
    } else {
        // Redirigir si intenta entrar a admin sin loguearse
        if (path.includes("admin.html")) window.location.href = "login.html";
    }
});

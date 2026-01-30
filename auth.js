// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD5mkWosoBhPzxVLRk8b4xlEVRinEs_3xk",
  authDomain: "miweb-ee0a7.firebaseapp.com",
  projectId: "miweb-ee0a7",
  storageBucket: "miweb-ee0a7.firebasestorage.app",
  messagingSenderId: "1044426067343",
  appId: "1:1044426067343:web:cea4c14db368de1ec80ffa"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- INICIAR SESIÓN ---
function acceder() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            return db.collection("usuarios").doc(userCredential.user.uid).get();
        })
        .then((doc) => {
            if (doc.exists && doc.data().rol === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "catalogo.html";
            }
        })
        .catch((error) => alert("❌ Error: " + error.message));
}

// --- REGISTRO DE CLIENTES ---
function nuevoRegistro() {
    const nombre = document.getElementById('nombreReal').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if (!nombre || !email || !pass) return alert("Llena todos los campos");

    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const user = userCredential.user;
            return user.updateProfile({ displayName: nombre }).then(() => {
                return db.collection("usuarios").doc(user.uid).set({
                    nombre: nombre,
                    email: email,
                    rol: "cliente"
                });
            });
        })
        .then(() => {
            alert("✅ Registro exitoso");
            window.location.href = "catalogo.html";
        })
        .catch((error) => alert(error.message));
}

// --- MONITOR DE MENÚ (NAVBAR) ---
firebase.auth().onAuthStateChanged((user) => {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;

    if (user) {
        db.collection("usuarios").doc(user.uid).get().then((doc) => {
            let etiqueta = "🥷 Mi Cuenta";
            let destino = "perfil.html";

            if (doc.exists && doc.data().rol === "admin") {
                etiqueta = "🛠️ Panel Admin";
                destino = "admin.html";
            }

            authLink.parentElement.innerHTML = `
                <a href="${destino}" class="active-link" style="margin-right:15px;">${etiqueta}</a>
                <a href="#" onclick="cerrarSesion()" style="color: #ff3b30; font-weight:bold;">Salir</a>
            `;
        });
    } else {
        authLink.parentElement.innerHTML = `<a href="login.html" id="auth-link">Entrar</a>`;
    }
});

function cerrarSesion() {
    if(confirm("¿Cerrar sesión?")) {
        firebase.auth().signOut().then(() => window.location.href = "index.html");
    }
}
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

// Inicialización global segura
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- LOGIN ---
function acceder() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    firebase.auth().signInWithEmailAndPassword(email, pass)
        .then(() => { window.location.href = "index.html"; })
        .catch((error) => alert("❌ Error: " + error.message));
}

// --- REGISTRO CORREGIDO ---
function nuevoRegistro() {
    const nombre = document.getElementById('nombreReal').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if (!nombre || !email || !pass) return alert("Llena todos los campos");

    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            // Guardar en la colección 'usuarios' ANTES de redirigir
            return db.collection("usuarios").doc(userCredential.user.uid).set({
                nombre: nombre,
                email: email,
                role: "user" 
            });
        })
        .then(() => { 
            alert("¡Registro exitoso!");
            window.location.href = "index.html"; 
        })
        .catch((error) => alert("Error en registro: " + error.message));
}

// --- MONITOR DE SESIÓN Y ROLES ---
firebase.auth().onAuthStateChanged((user) => {
    const authLink = document.getElementById('auth-link');
    const path = window.location.pathname;

    if (user) {
        db.collection("usuarios").doc(user.uid).get().then((doc) => {
            let nombreMostrar = "Ninja";
            let userRole = "user";

            if (doc.exists) {
                const data = doc.data();
                nombreMostrar = data.nombre || "Ninja";
                userRole = data.role || "user";
            }

            if (authLink) {
                authLink.innerHTML = `Hola, ${nombreMostrar} (Salir)`;
                authLink.style.display = "inline";
                authLink.onclick = (e) => {
                    e.preventDefault();
                    firebase.auth().signOut().then(() => location.href="login.html");
                };

                // Mostrar link al Panel solo si es admin
                if (userRole === "admin" && (path.includes("index.html") || path === "/")) {
                    authLink.innerHTML += ` | <a href="admin.html" style="color:#34c759; text-decoration:none; margin-left:5px;">Panel</a>`;
                }
            }

            // Seguridad de página de Admin
            if (path.includes("admin.html")) {
                if (userRole === "admin") {
                    document.body.style.display = "block";
                } else {
                    window.location.href = "index.html";
                }
            }
        });
    } else {
        if (path.includes("admin.html") || path.includes("catalogo.html")) {
            window.location.href = "login.html";
        }
    }
});

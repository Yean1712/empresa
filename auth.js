// Configuración de tu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD5mkWosoBhPzxVLRk8b4xlEVRinEs_3xk",
  authDomain: "miweb-ee0a7.firebaseapp.com",
  projectId: "miweb-ee0a7",
  storageBucket: "miweb-ee0a7.firebasestorage.app",
  messagingSenderId: "1044426067343",
  appId: "1:1044426067343:web:cea4c14db368de1ec80ffa",
  measurementId: "G-HZ05NQ26CJ"
};

// 1. Inicializar Firebase solo una vez
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 2. Variable db declarada pero asignada después
const db = firebase.firestore();

// --- FUNCIÓN: REGISTRO DE NUEVOS CLIENTES ---
function nuevoRegistro() {
    const nombre = document.getElementById('nombreReal').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if (!nombre || !email || !pass) {
        alert("⚠️ Por favor, llena todos los campos.");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Guardamos el perfil con rol cliente
            return db.collection("usuarios").doc(user.uid).set({
                nombre: nombre,
                email: email,
                rol: "cliente",
                fechaRegistro: new Date().toLocaleString()
            }).then(() => {
                return user.updateProfile({ displayName: nombre });
            });
        })
        .then(() => {
            alert("¡Bienvenido, " + nombre + "!");
            window.location.href = "catalogo.html"; 
        })
        .catch((error) => {
            alert("❌ Error: " + error.message);
        });
}

// --- FUNCIÓN: LOGIN (Redirección por Rol) ---
function acceder() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if (!email || !pass) {
        alert("⚠️ Ingresa correo y contraseña.");
        return;
    }

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
        .catch((error) => {
            alert("❌ Correo o contraseña incorrectos.");
        });
}

// --- MONITOR DE SESIÓN ---
firebase.auth().onAuthStateChanged((user) => {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;

    if (user) {
        db.collection("usuarios").doc(user.uid).get().then((doc) => {
            if (doc.exists && doc.data().rol === "admin") {
                authLink.innerText = "🛠️ Panel Admin";
                authLink.href = "admin.html";
            } else {
                authLink.innerText = "🥷 " + (user.displayName || "Mi Cuenta");
                authLink.href = "perfil.html";
            }
        });
    } else {
        authLink.innerText = "Entrar";
        authLink.href = "login.html";
    }
});

// --- FUNCIÓN: CARGAR HISTORIAL ---
function cargarHistorial() {
    const user = firebase.auth().currentUser;
    const lista = document.getElementById('lista-compras');

    if (user && lista) {
        db.collection("compras")
            .where("userId", "==", user.uid)
            .get()
            .then((querySnapshot) => {
                lista.innerHTML = "";
                if (querySnapshot.empty) {
                    lista.innerHTML = "<p style='color: #666;'>No tienes pedidos aún.</p>";
                    return;
                }
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    lista.innerHTML += `
                        <div style="background: #121212; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #222;">
                            <h4 style="color: white; margin: 0;">${data.producto}</h4>
                            <p style="color: #0071e3; font-weight: bold; margin: 5px 0;">$${data.precio}</p>
                            <small style="color: #555;">${data.fecha}</small>
                        </div>`;
                });
            });
    }
}
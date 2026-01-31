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

// MONITOR DE USUARIO ÚNICO
firebase.auth().onAuthStateChanged((user) => {
    const authContainer = document.getElementById('auth-link-container');
    if (!authContainer) return;

    if (user) {
        db.collection("usuarios").doc(user.uid).get().then((doc) => {
            let nombre = doc.exists ? doc.data().nombre : "Usuario";
            let destino = (doc.exists && doc.data().rol === "admin") ? "admin.html" : "perfil.html";
            
            authContainer.innerHTML = `
                <div class="user-nav-box">
                    <a href="${destino}" class="user-link">Hola, ${nombre.split(' ')[0]}</a>
                    <button onclick="cerrarSesion()" class="btn-logout-mini">Salir</button>
                </div>`;
        });
    } else {
        authContainer.innerHTML = `<a href="login.html" class="btn-login-nav">Entrar</a>`;
    }
});

function cerrarSesion() {
    if(confirm("¿Cerrar sesión?")) {
        firebase.auth().signOut().then(() => { window.location.href = "index.html"; });
    }
}

// Funciones de Login y Registro (se mantienen igual)
async function acceder() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    try {
        await firebase.auth().signInWithEmailAndPassword(email, pass);
        window.location.href = "catalogo.html";
    } catch (e) { alert("Error: " + e.message); }
}

async function nuevoRegistro() {
    const nombre = document.getElementById('nombreReal').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    try {
        const res = await firebase.auth().createUserWithEmailAndPassword(email, pass);
        await db.collection("usuarios").doc(res.user.uid).set({
            nombre: nombre, email: email, rol: "cliente"
        });
        window.location.href = "catalogo.html";
    } catch (e) { alert(e.message); }
}

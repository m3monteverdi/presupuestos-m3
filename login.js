// =====================================
// LOGIN GENERAL DE LA APLICACIÓN
// =====================================

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const botonIngresar =
    document.getElementById(
        "botonIngresarApp"
    );

const mensajeLogin =
    document.getElementById(
        "mensajeLoginApp"
    );


// =====================================
// VER SI YA HAY SESIÓN
// =====================================

async function comprobarSesionExistente() {

    const { data } =
        await supabaseClient
            .auth
            .getSession();


    if (data.session) {

        window.location.href =
            "index.html";

    }

}


// =====================================
// INICIAR SESIÓN
// =====================================

async function iniciarSesionApp() {

    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;


    if (!email || !password) {

        mensajeLogin.textContent =
            "Complete correo electrónico y contraseña.";

        return;

    }


    botonIngresar.disabled =
        true;

    botonIngresar.textContent =
        "Ingresando...";

    mensajeLogin.textContent =
        "";


    const { error } =
        await supabaseClient
            .auth
            .signInWithPassword({

                email:
                    email,

                password:
                    password

            });


    if (error) {

        console.error(
            "Error iniciando sesión:",
            error
        );


        mensajeLogin.textContent =
            "Correo o contraseña incorrectos.";


        botonIngresar.disabled =
            false;

        botonIngresar.textContent =
            "Ingresar";

        return;

    }


    window.location.href =
        "index.html";

}


// =====================================
// BOTÓN
// =====================================

botonIngresar.addEventListener(
    "click",
    iniciarSesionApp
);


// =====================================
// ENTER
// =====================================

loginPassword.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Enter"
        ) {

            iniciarSesionApp();

        }

    }
);


// =====================================
// INICIO
// =====================================

comprobarSesionExistente();
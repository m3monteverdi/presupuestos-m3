// =====================================
// PROTECCIÓN GENERAL DE LA APLICACIÓN
// =====================================

async function protegerPagina() {

    const { data, error } =
        await supabaseClient
            .auth
            .getSession();


    if (error || !data.session) {

        window.location.href =
            "login.html";

        return;

    }

}


// =====================================
// CERRAR SESIÓN
// =====================================

async function cerrarSesion() {

    const { error } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

        alert(
            "No se pudo cerrar la sesión."
        );

        return;

    }


    window.location.href =
        "login.html";

}


// =====================================
// BOTÓN CERRAR SESIÓN
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const botonCerrarSesion =
            document.getElementById(
                "cerrarSesionApp"
            );


        if (botonCerrarSesion) {

            botonCerrarSesion.addEventListener(
                "click",
                cerrarSesion
            );

        }

    }
);


// =====================================
// INICIO
// =====================================

protegerPagina();
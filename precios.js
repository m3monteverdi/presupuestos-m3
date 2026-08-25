// =====================================
// ACTUALIZAR PRECIOS
// =====================================

const seccionLogin =
    document.getElementById("seccionLogin");

const seccionPrecios =
    document.getElementById("seccionPrecios");

const emailAdmin =
    document.getElementById("emailAdmin");

const passwordAdmin =
    document.getElementById("passwordAdmin");

const botonLogin =
    document.getElementById("botonLogin");

const botonCerrarSesion =
    document.getElementById("botonCerrarSesion");

const mensajeLogin =
    document.getElementById("mensajeLogin");

const mensajePrecios =
    document.getElementById("mensajePrecios");

const botonGuardarPrecios =
    document.getElementById("guardarPrecios");


// =====================================
// MAPA CÓDIGO SUPABASE → INPUT
// =====================================

const camposPrecios = {

    // HORMIGONES

    H8:
        "precioH8",

    H13:
        "precioH13",

    H17:
        "precioH17",

    H21:
        "precioH21",

    H25:
        "precioH25",

    H30:
        "precioH30",

    H40:
        "precioH40",


    // MR120

    mr120_H8:
        "precioMr120H8",

    mr120_H13:
        "precioMr120H13",

    mr120_H17:
        "precioMr120H17",

    mr120_H21:
        "precioMr120H21",

    mr120_H25:
        "precioMr120H25",

    mr120_H30:
        "precioMr120H30",

    mr120_H40:
        "precioMr120H40",


    // MACROFIBRA / MICROFIBRA

    macro_H8:
        "precioMacroH8",

    macro_H13:
        "precioMacroH13",

    macro_H17:
        "precioMacroH17",

    macro_H21:
        "precioMacroH21",

    macro_H25:
        "precioMacroH25",

    macro_H30:
        "precioMacroH30",

    macro_H40:
        "precioMacroH40",


    // HIDROFUGO

    hidrofugo_H8:
        "precioHidrofugoH8",

    hidrofugo_H13:
        "precioHidrofugoH13",

    hidrofugo_H17:
        "precioHidrofugoH17",

    hidrofugo_H21:
        "precioHidrofugoH21",

    hidrofugo_H25:
        "precioHidrofugoH25",

    hidrofugo_H30:
        "precioHidrofugoH30",

    hidrofugo_H40:
        "precioHidrofugoH40",


    // SERVICIOS

    bomba:
        "precioBombaAdmin",

    vibrador:
        "precioVibradorAdmin"

};


// =====================================
// MOSTRAR LOGIN
// =====================================

function mostrarLogin() {

    seccionLogin.style.display =
        "block";

    seccionPrecios.style.display =
        "none";

}


// =====================================
// MOSTRAR PRECIOS
// =====================================

function mostrarPanelPrecios() {

    seccionLogin.style.display =
        "none";

    seccionPrecios.style.display =
        "block";

}


// =====================================
// LOGIN
// =====================================

async function iniciarSesion() {

    const email =
        emailAdmin.value.trim();

    const password =
        passwordAdmin.value;


    if (
        !email ||
        !password
    ) {

        mensajeLogin.textContent =
            "Complete email y contraseña.";

        return;

    }


    mensajeLogin.textContent =
        "Ingresando...";


    const {
        data,
        error
    } =
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
            "Email o contraseña incorrectos.";

        return;

    }


    mensajeLogin.textContent =
        "";


    console.log(
        "Administrador autenticado:",
        data.user.email
    );


    mostrarPanelPrecios();


    await cargarPreciosSupabase();

}


// =====================================
// CERRAR SESIÓN
// =====================================

async function cerrarSesion() {

    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

        return;

    }


    mostrarLogin();

}


// =====================================
// CARGAR PRECIOS
// =====================================

async function cargarPreciosSupabase() {

    mensajePrecios.textContent =
        "Cargando precios...";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("precios")
            .select(
                "codigo, valor"
            );


    if (error) {

        console.error(
            "Error leyendo precios:",
            error
        );


        mensajePrecios.textContent =
            "No se pudieron cargar los precios.";

        return;

    }


    data.forEach(
        fila => {

            const idInput =
                camposPrecios[
                    fila.codigo
                ];


            if (!idInput) {

                return;

            }


            const input =
                document.getElementById(
                    idInput
                );


            if (input) {

                input.value =
                    Number(
                        fila.valor ||
                        0
                    );

            }

        }
    );


    mensajePrecios.textContent =
        "";

}


// =====================================
// ACTUALIZAR PRECIO
// =====================================

async function actualizarPrecio(
    codigo,
    valor
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("precios")
            .update({

                valor:
                    Number(
                        valor
                    ) || 0,

                actualizado_en:
                    new Date()
                        .toISOString()

            })
            .eq(
                "codigo",
                codigo
            )
            .select(
                "codigo"
            );


    if (error) {

        console.error(
            `Error actualizando ${codigo}:`,
            error
        );

        throw error;

    }


    if (
        !data ||
        data.length ===
        0
    ) {

        throw new Error(
            `No se pudo actualizar ${codigo}`
        );

    }

}


// =====================================
// GUARDAR TODOS LOS PRECIOS
// =====================================

async function guardarPreciosSupabase() {

    botonGuardarPrecios.disabled =
        true;


    mensajePrecios.textContent =
        "Guardando precios...";


    try {

        const codigos =
            Object.keys(
                camposPrecios
            );


        for (
            const codigo
            of codigos
        ) {

            const idInput =
                camposPrecios[
                    codigo
                ];


            const input =
                document.getElementById(
                    idInput
                );


            if (!input) {

                continue;

            }


            await actualizarPrecio(

                codigo,

                input.value

            );

        }


        mensajePrecios.textContent =
            "Precios actualizados correctamente.";


    } catch (error) {

        console.error(
            "Error guardando precios:",
            error
        );


        mensajePrecios.textContent =
            "No se pudieron guardar los precios.";


    } finally {

        botonGuardarPrecios.disabled =
            false;

    }

}


// =====================================
// SESIÓN ACTUAL
// =====================================

async function comprobarSesion() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (
        error ||
        !data.session
    ) {

        mostrarLogin();

        return;

    }


    mostrarPanelPrecios();


    await cargarPreciosSupabase();

}


// =====================================
// EVENTOS
// =====================================

if (botonLogin) {

    botonLogin.addEventListener(
        "click",
        iniciarSesion
    );

}


if (botonCerrarSesion) {

    botonCerrarSesion.addEventListener(
        "click",
        cerrarSesion
    );

}


if (botonGuardarPrecios) {

    botonGuardarPrecios.addEventListener(
        "click",
        guardarPreciosSupabase
    );

}


if (passwordAdmin) {

    passwordAdmin.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                iniciarSesion();

            }

        }
    );

}


// =====================================
// INICIO
// =====================================

comprobarSesion();
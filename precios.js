// =====================================
// ELEMENTOS
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


// CAMPOS DE PRECIOS

const precioH8 =
    document.getElementById("precioH8");

const precioH13 =
    document.getElementById("precioH13");

const precioH17 =
    document.getElementById("precioH17");

const precioH21 =
    document.getElementById("precioH21");

const precioH25 =
    document.getElementById("precioH25");

const precioH30 =
    document.getElementById("precioH30");

const precioH40 =
    document.getElementById("precioH40");

const precioMR120 =
    document.getElementById("precioMR120");

const precioMacro =
    document.getElementById("precioMacro");

const precioBombaAdmin =
    document.getElementById("precioBombaAdmin");

const precioVibradorAdmin =
    document.getElementById("precioVibradorAdmin");


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
// MOSTRAR ADMINISTRACIÓN
// =====================================

function mostrarPrecios() {

    seccionLogin.style.display =
        "none";

    seccionPrecios.style.display =
        "block";

}


// =====================================
// INICIAR SESIÓN
// =====================================

async function iniciarSesion() {

    const email =
        emailAdmin.value.trim();

    const password =
        passwordAdmin.value;


    if (!email || !password) {

        mensajeLogin.textContent =
            "Complete email y contraseña.";

        return;

    }


    mensajeLogin.textContent =
        "Ingresando...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        console.error(
            "Error al iniciar sesión:",
            error
        );

        mensajeLogin.textContent =
            "Email o contraseña incorrectos.";

        return;

    }


    console.log(
        "Usuario autenticado:",
        data.user.email
    );


    mensajeLogin.textContent =
        "";


    mostrarPrecios();

    await cargarPreciosSupabase();

}


// =====================================
// CERRAR SESIÓN
// =====================================

async function cerrarSesion() {

    const { error } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Error al cerrar sesión:",
            error
        );

        return;

    }


    emailAdmin.value =
        "";

    passwordAdmin.value =
        "";


    mostrarLogin();

}


// =====================================
// CARGAR PRECIOS DESDE SUPABASE
// =====================================

async function cargarPreciosSupabase() {

    mensajePrecios.textContent =
        "Cargando precios...";


    const { data, error } =
        await supabaseClient
            .from("precios")
            .select("codigo, valor");


    if (error) {

        console.error(
            "Error leyendo precios:",
            error
        );

        mensajePrecios.textContent =
            "No se pudieron cargar los precios.";

        return;

    }


    console.log(
        "Precios cargados:",
        data
    );


    const precios = {};


    data.forEach(
        fila => {

            precios[fila.codigo] =
                Number(fila.valor);

        }
    );


    precioH8.value =
        precios.H8 ?? 0;

    precioH13.value =
        precios.H13 ?? 0;

    precioH17.value =
        precios.H17 ?? 0;

    precioH21.value =
        precios.H21 ?? 0;

    precioH25.value =
        precios.H25 ?? 0;

    precioH30.value =
        precios.H30 ?? 0;

    precioH40.value =
        precios.H40 ?? 0;


    precioMR120.value =
        precios.mr120 ?? 0;

    precioMacro.value =
        precios.macro ?? 0;


    precioBombaAdmin.value =
        precios.bomba ?? 0;

    precioVibradorAdmin.value =
        precios.vibrador ?? 0;


    mensajePrecios.textContent =
        "";

}


// =====================================
// COMPROBAR SI YA HAY SESIÓN
// =====================================

async function comprobarSesion() {

    const { data, error } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

        mostrarLogin();

        return;

    }


    if (data.session) {

        mostrarPrecios();

        await cargarPreciosSupabase();

    } else {

        mostrarLogin();

    }

}


// =====================================
// EVENTOS
// =====================================

botonLogin.addEventListener(
    "click",
    iniciarSesion
);


botonCerrarSesion.addEventListener(
    "click",
    cerrarSesion
);


// Permitir ENTER para iniciar sesión

passwordAdmin.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            iniciarSesion();

        }

    }
);


// =====================================
// INICIO
// =====================================

comprobarSesion();
// =====================================
// GUARDAR PRECIOS EN SUPABASE
// =====================================

const botonGuardarPrecios =
    document.getElementById("guardarPrecios");


async function actualizarPrecio(codigo, valor) {

    const { data, error } =
        await supabaseClient
            .from("precios")
            .update({
                valor: Number(valor) || 0,
                actualizado_en: new Date().toISOString()
            })
            .eq("codigo", codigo)
            .select("codigo, valor");


    if (error) {

        console.error(
            `Error actualizando ${codigo}:`,
            error
        );

        throw error;

    }


    if (!data || data.length === 0) {

        throw new Error(
            `No se pudo actualizar ${codigo}`
        );

    }

}


// =====================================
// GUARDAR TODOS LOS PRECIOS
// =====================================

async function guardarPreciosSupabase() {

    mensajePrecios.textContent =
        "Guardando precios...";


    botonGuardarPrecios.disabled =
        true;


    try {

        await actualizarPrecio(
            "H8",
            precioH8.value
        );

        await actualizarPrecio(
            "H13",
            precioH13.value
        );

        await actualizarPrecio(
            "H17",
            precioH17.value
        );

        await actualizarPrecio(
            "H21",
            precioH21.value
        );

        await actualizarPrecio(
            "H25",
            precioH25.value
        );

        await actualizarPrecio(
            "H30",
            precioH30.value
        );

        await actualizarPrecio(
            "H40",
            precioH40.value
        );

        await actualizarPrecio(
            "mr120",
            precioMR120.value
        );

        await actualizarPrecio(
            "macro",
            precioMacro.value
        );

        await actualizarPrecio(
            "bomba",
            precioBombaAdmin.value
        );

        await actualizarPrecio(
            "vibrador",
            precioVibradorAdmin.value
        );


        mensajePrecios.textContent =
            "Precios actualizados correctamente.";


        console.log(
            "Todos los precios fueron actualizados en Supabase."
        );

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
// EVENTO BOTÓN GUARDAR
// =====================================

botonGuardarPrecios.addEventListener(
    "click",
    guardarPreciosSupabase
);
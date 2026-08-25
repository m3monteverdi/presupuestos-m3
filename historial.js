// =====================================
// HISTORIAL DESDE SUPABASE
// =====================================

const listaHistorial =
    document.getElementById(
        "listaHistorial"
    );

const mensajeVacio =
    document.getElementById(
        "mensajeHistorialVacio"
    );

const buscador =
    document.getElementById(
        "buscarPresupuesto"
    );


let presupuestosGuardados = [];


// =====================================
// FORMATO PESOS
// =====================================

function formatoPesos(valor) {

    return Number(valor || 0).toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2
        }
    );

}


// =====================================
// FORMATO FECHA
// =====================================

function formatoFecha(fecha) {

    if (!fecha) {

        return "-";

    }


    const partes =
        fecha.split("-");


    if (partes.length !== 3) {

        return fecha;

    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// =====================================
// COMPROBAR SESIÓN
// =====================================

async function comprobarSesion() {

    const { data, error } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

        return false;

    }


    if (!data.session) {

        alert(
            "Debe iniciar sesión para acceder al historial."
        );


        window.location.href =
            "login.html";


        return false;

    }


    return true;

}


// =====================================
// CARGAR PRESUPUESTOS
// =====================================

async function cargarHistorial() {

    const haySesion =
        await comprobarSesion();


    if (!haySesion) {

        return;

    }


    mensajeVacio.style.display =
        "block";

    mensajeVacio.textContent =
        "Cargando presupuestos...";


    const { data, error } =
        await supabaseClient
            .from("presupuestos")
            .select(`
                id,
                created_at,
                nombre,
                tipo_planilla,
                senores,
                presupuesto_numero,
                fecha,
                total_final
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Error cargando historial:",
            error
        );


        mensajeVacio.textContent =
            "No se pudo cargar el historial.";

        return;

    }


    presupuestosGuardados =
        data || [];


    console.log(
        "Presupuestos recibidos:",
        presupuestosGuardados
    );


    mostrarHistorial();

}


// =====================================
// VER PRESUPUESTO
// =====================================

function verPresupuesto(id) {

    window.location.href =
        `ver-presupuesto.html?id=${id}`;

}


// =====================================
// ELIMINAR PRESUPUESTO
// =====================================

async function eliminarPresupuesto(
    presupuesto
) {

    const confirmar =
        confirm(
            `¿Seguro que desea eliminar "${presupuesto.nombre}"?`
        );


    if (!confirmar) {

        return;

    }


    const { data, error } =
        await supabaseClient
            .from("presupuestos")
            .delete()
            .eq(
                "id",
                presupuesto.id
            )
            .select();


    if (error) {

        console.error(
            "Error eliminando presupuesto:",
            error
        );


        alert(
            "No se pudo eliminar el presupuesto."
        );

        return;

    }


    if (!data || data.length === 0) {

        alert(
            "No tiene permiso para eliminar este presupuesto."
        );

        return;

    }


    alert(
        `Presupuesto "${presupuesto.nombre}" eliminado correctamente.`
    );


    await cargarHistorial();

}


// =====================================
// CREAR FILA
// =====================================

function crearFila(presupuesto) {

    const fila =
        document.createElement("div");


    fila.className =
        "fila-historial fila-historial-datos";


    // NOMBRE

    const columnaNombre =
        document.createElement("div");


    const nombre =
        document.createElement("strong");


    nombre.textContent =
        presupuesto.nombre;


    columnaNombre.appendChild(
        nombre
    );


    // NÚMERO

    const columnaNumero =
        document.createElement("div");


    columnaNumero.textContent =
        presupuesto.presupuesto_numero;


    // FECHA

    const columnaFecha =
        document.createElement("div");


    columnaFecha.textContent =
        formatoFecha(
            presupuesto.fecha
        );


    // TIPO

    const columnaTipo =
        document.createElement("div");


    columnaTipo.textContent =
        presupuesto.tipo_planilla;


    // TOTAL

    const columnaTotal =
        document.createElement("div");


    columnaTotal.textContent =
        formatoPesos(
            presupuesto.total_final
        );


    // ACCIONES

    const columnaAcciones =
        document.createElement("div");


    columnaAcciones.className =
        "acciones-historial";


    const botonVer =
        document.createElement("button");


    botonVer.textContent =
        "Ver";


    botonVer.className =
        "boton-historial boton-ver";


    botonVer.addEventListener(
        "click",
        function () {

            verPresupuesto(
                presupuesto.id
            );

        }
    );


    const botonEliminar =
        document.createElement("button");


    botonEliminar.textContent =
        "Eliminar";


    botonEliminar.className =
        "boton-historial boton-eliminar";


    botonEliminar.addEventListener(
        "click",
        function () {

            eliminarPresupuesto(
                presupuesto
            );

        }
    );


    columnaAcciones.appendChild(
        botonVer
    );


    columnaAcciones.appendChild(
        botonEliminar
    );


    // ARMAR FILA

    fila.appendChild(
        columnaNombre
    );

    fila.appendChild(
        columnaNumero
    );

    fila.appendChild(
        columnaFecha
    );

    fila.appendChild(
        columnaTipo
    );

    fila.appendChild(
        columnaTotal
    );

    fila.appendChild(
        columnaAcciones
    );


    return fila;

}


// =====================================
// MOSTRAR HISTORIAL
// =====================================

function mostrarHistorial() {

    listaHistorial.innerHTML =
        "";


    const textoBusqueda =
        buscador.value
            .toLowerCase()
            .trim();


    const filtrados =
        presupuestosGuardados.filter(
            presupuesto => {

                const senores =
                    String(
                        presupuesto.senores || ""
                    )
                    .toLowerCase();


                const numero =
                    String(
                        presupuesto.presupuesto_numero || ""
                    )
                    .toLowerCase();


                return (
                    senores.includes(
                        textoBusqueda
                    ) ||
                    numero.includes(
                        textoBusqueda
                    )
                );

            }
        );


    if (filtrados.length === 0) {

        mensajeVacio.style.display =
            "block";


        mensajeVacio.textContent =
            textoBusqueda
                ? "No se encontraron presupuestos."
                : "Todavía no hay presupuestos guardados.";


        return;

    }


    mensajeVacio.style.display =
        "none";


    filtrados.forEach(
        presupuesto => {

            listaHistorial.appendChild(
                crearFila(
                    presupuesto
                )
            );

        }
    );

}


// =====================================
// BUSCADOR
// =====================================

buscador.addEventListener(
    "input",
    mostrarHistorial
);


// =====================================
// INICIO
// =====================================

cargarHistorial();

// =====================================
// DESCARGAR TODOS LOS PRESUPUESTOS
// =====================================

async function descargarTodosLosPresupuestos() {

    const boton =
        document.getElementById(
            "descargarTodos"
        );


    if (
        !presupuestosGuardados.length
    ) {

        alert(
            "No hay presupuestos para descargar."
        );

        return;

    }


    const textoOriginal =
        boton.textContent;


    boton.disabled = true;


    try {

        const { data, error } =
            await supabaseClient
                .from("presupuestos")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw error;

        }


        const presupuestos =
            data || [];


        if (!presupuestos.length) {

            alert(
                "No hay presupuestos para descargar."
            );

            return;

        }


        const zip =
            new JSZip();


        const nombresUsados =
            new Set();


        for (
            let i = 0;
            i < presupuestos.length;
            i++
        ) {

            const presupuesto =
                presupuestos[i];


            boton.textContent =
                `Preparando ${i + 1} de ${presupuestos.length}...`;


            const conIVA =
                presupuesto.tipo_planilla ===
                "PresupuestosM3+IVA";


            const bytes =
                conIVA
                    ? await generarM3IVA(
                        presupuesto
                    )
                    : await generarM3(
                        presupuesto
                    );


            let nombreBase =
                limpiarNombreArchivo(
                    `${presupuesto.senores || "Cliente"} - ` +
                    `Presupuesto ${presupuesto.presupuesto_numero || presupuesto.id}`
                );


            if (!nombreBase) {

                nombreBase =
                    `Presupuesto ${presupuesto.id}`;

            }


            let nombrePDF =
                `${nombreBase}.pdf`;


            let repetido = 2;


            while (
                nombresUsados.has(
                    nombrePDF
                )
            ) {

                nombrePDF =
                    `${nombreBase} (${repetido}).pdf`;

                repetido++;

            }


            nombresUsados.add(
                nombrePDF
            );


            zip.file(
                nombrePDF,
                bytes
            );

        }


        boton.textContent =
            "Armando ZIP...";


        const archivoZIP =
            await zip.generateAsync({
                type: "blob"
            });


        const url =
            URL.createObjectURL(
                archivoZIP
            );


        const enlace =
            document.createElement(
                "a"
            );


        enlace.href = url;

        enlace.download =
            "Historial Presupuestos Monteverdi.zip";


        document.body.appendChild(
            enlace
        );


        enlace.click();

        enlace.remove();


        setTimeout(
            function () {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


    } catch (error) {

        console.error(
            "Error descargando historial:",
            error
        );


        alert(
            "No se pudo descargar todo el historial."
        );


    } finally {

        boton.disabled = false;

        boton.textContent =
            textoOriginal;

    }

}


// =====================================
// ELIMINAR TODOS LOS PRESUPUESTOS
// =====================================

async function eliminarTodosLosPresupuestos() {

    if (
        !presupuestosGuardados.length
    ) {

        alert(
            "No hay presupuestos para eliminar."
        );

        return;

    }


    const confirmar =
        confirm(
            `Se eliminarán los ${presupuestosGuardados.length} presupuestos del historial. ` +
            "Esta acción no se puede deshacer. ¿Desea continuar?"
        );


    if (!confirmar) {

        return;

    }


    const confirmarFinal =
        confirm(
            "Última confirmación: ¿eliminar TODO el historial?"
        );


    if (!confirmarFinal) {

        return;

    }


    const boton =
        document.getElementById(
            "eliminarTodos"
        );


    const textoOriginal =
        boton.textContent;


    boton.disabled = true;

    boton.textContent =
        "Eliminando...";


    try {

        const { data, error } =
            await supabaseClient
                .from("presupuestos")
                .delete()
                .not(
                    "id",
                    "is",
                    null
                )
                .select("id");


        if (error) {

            throw error;

        }


        if (
            !data ||
            data.length === 0
        ) {

            alert(
                "No se eliminó ningún presupuesto. Verifique los permisos del administrador."
            );

            return;

        }


        alert(
            `Se eliminaron ${data.length} presupuestos correctamente.`
        );


        await cargarHistorial();


    } catch (error) {

        console.error(
            "Error eliminando todo el historial:",
            error
        );


        alert(
            "No se pudo eliminar todo el historial."
        );


    } finally {

        boton.disabled = false;

        boton.textContent =
            textoOriginal;

    }

}


// =====================================
// BOTONES GENERALES DEL HISTORIAL
// =====================================

document
    .getElementById(
        "descargarTodos"
    )
    .addEventListener(
        "click",
        descargarTodosLosPresupuestos
    );


document
    .getElementById(
        "eliminarTodos"
    )
    .addEventListener(
        "click",
        eliminarTodosLosPresupuestos
    );

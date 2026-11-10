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


const resumenTotal =
    document.getElementById(
        "resumenTotal"
    );

const resumenAprobados =
    document.getElementById(
        "resumenAprobados"
    );

const resumenNoAprobados =
    document.getElementById(
        "resumenNoAprobados"
    );

const resumenPorcAprobados =
    document.getElementById(
        "resumenPorcAprobados"
    );

const resumenPorcNoAprobados =
    document.getElementById(
        "resumenPorcNoAprobados"
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
                total_final,
                aprobado
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

    actualizarResumen();

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
// CAMBIAR ESTADO DE APROBACION
// =====================================

async function cambiarAprobacion(
    presupuesto,
    estado
) {

    const { error } =
        await supabaseClient
            .from("presupuestos")
            .update(
                {
                    aprobado: estado
                }
            )
            .eq(
                "id",
                presupuesto.id
            )
            .select();

    if (error) {

        console.error(
            "Error actualizando aprobacion:",
            error
        );

        alert(
            "No se pudo actualizar el estado del presupuesto."
        );

        return false;

    }

    const indice =
        presupuestosGuardados.findIndex(
            p => String(p.id) === String(presupuesto.id)
        );

    if (indice !== -1) {

        presupuestosGuardados[
            indice
        ].aprobado = estado;

    }

    actualizarResumen();

    return true;

}



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


    // BOTON EDITAR

    const botonEditar =
        document.createElement("button");

    botonEditar.textContent =
        "Editar";

    botonEditar.className =
        "boton-historial boton-editar";

    botonEditar.addEventListener(
        "click",
        function () {

            console.log("Editando presupuesto:", presupuesto);

            localStorage.setItem(
                "m3_presupuesto_editar",
                JSON.stringify(
                    presupuesto
                )
            );

            console.log("Guardado en localStorage:", localStorage.getItem("m3_presupuesto_editar"));

            window.location.href =
                presupuesto.tipo_planilla ===
                "PresupuestosM3+IVA"
                    ? "presupuesto-iva.html"
                    : "presupuesto.html";

        }
    );

    columnaAcciones.appendChild(
        botonEditar
    );


    // ESTADO DE APROBACION

    const contenedorEstado =
        document.createElement("div");

    contenedorEstado.className =
        "estado-aprobacion";

    const btnAprobado =
        document.createElement("button");

    btnAprobado.type =
        "button";

    btnAprobado.className =
        "btn-estado btn-ok";

    btnAprobado.textContent =
        "OK";

    btnAprobado.title =
        "Marcar como aprobado";

    const btnNoAprobado =
        document.createElement("button");

    btnNoAprobado.type =
        "button";

    btnNoAprobado.className =
        "btn-estado btn-no";

    btnNoAprobado.textContent =
        "X";

    btnNoAprobado.title =
        "Marcar como no aprobado";

    const aprobadoActual =
        Boolean(
            presupuesto.aprobado
        );

    function aplicarEstado(
        estado
    ) {

        if (estado) {

            btnAprobado.classList.add("activo");

            btnAprobado.style.background =
                "#2e7d32";

            btnAprobado.style.color =
                "#fff";

            btnNoAprobado.classList.remove("activo");

            btnNoAprobado.style.background =
                "";

            btnNoAprobado.style.color =
                "";

        } else {

            btnNoAprobado.classList.add("activo");

            btnNoAprobado.style.background =
                "#c62828";

            btnNoAprobado.style.color =
                "#fff";

            btnAprobado.classList.remove("activo");

            btnAprobado.style.background =
                "";

            btnAprobado.style.color =
                "";

        }

    }

    aplicarEstado(aprobadoActual);

    btnAprobado.addEventListener(
        "click",
        async function () {

            if (
                btnAprobado.classList
                    .contains("activo")
            ) {

                return;

            }

            const ok =
                await cambiarAprobacion(
                    presupuesto,
                    true
                );

            if (!ok) {

                return;

            }

            aplicarEstado(true);

        }
    );

    btnNoAprobado.addEventListener(
        "click",
        async function () {

            if (
                btnNoAprobado.classList
                    .contains("activo")
            ) {

                return;

            }

            const ok =
                await cambiarAprobacion(
                    presupuesto,
                    false
                );

            if (!ok) {

                return;

            }

            aplicarEstado(false);

        }
    );

    contenedorEstado.appendChild(
        btnAprobado
    );

    contenedorEstado.appendChild(
        btnNoAprobado
    );

    columnaAcciones.appendChild(
        contenedorEstado
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
// ACTUALIZAR RESUMEN
// =====================================

function actualizarResumen() {

    const total =
        presupuestosGuardados.length;

    const aprobados =
        presupuestosGuardados.filter(
            p => Boolean(p.aprobado)
        ).length;

    const noAprobados =
        total - aprobados;

    const porcAprobados =
        total === 0
            ? 0
            : Math.round(
                (aprobados / total) * 100
            );

    const porcNoAprobados =
        total === 0
            ? 0
            : Math.round(
                (noAprobados / total) * 100
            );

    if (resumenTotal) {

        resumenTotal.textContent =
            total;

    }

    if (resumenAprobados) {

        resumenAprobados.textContent =
            aprobados;

    }

    if (resumenNoAprobados) {

        resumenNoAprobados.textContent =
            noAprobados;

    }

    if (resumenPorcAprobados) {

        resumenPorcAprobados.textContent =
            porcAprobados;

    }

    if (resumenPorcNoAprobados) {

        resumenPorcNoAprobados.textContent =
            porcNoAprobados;

    }

}



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


    actualizarResumen();

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

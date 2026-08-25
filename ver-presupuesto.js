// =====================================
// VER PRESUPUESTO DESDE SUPABASE
// =====================================

const contenedor =
    document.getElementById(
        "detallePresupuesto"
    );


const parametros =
    new URLSearchParams(
        window.location.search
    );


const idPresupuesto =
    Number(
        parametros.get("id")
    );


// =====================================
// FORMATO PESOS
// =====================================

function formatoPesos(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
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
        String(fecha)
            .split("-");


    if (
        partes.length !==
        3
    ) {

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
// TEXTO SEGURO
// =====================================

function textoHTML(valor) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================
// NOMBRE ADITIVO
// =====================================

function obtenerNombreAditivo(tipo) {

    if (
        tipo ===
        "mr120"
    ) {

        return (
            "ADITIVO EN OBRA " +
            "MR120 superfluidificante"
        );

    }


    if (
        tipo ===
        "macro"
    ) {

        return (
            "MACROFIBRA / MICROFIBRA"
        );

    }


    if (
        tipo ===
        "hidrofugo"
    ) {

        return (
            "HIDROFUGO - IDROCRET HP"
        );

    }


    return tipo
        ? String(tipo)
        : "Sin aditivo";

}


// =====================================
// NORMALIZAR HORMIGONES
// =====================================

function normalizarHormigones(
    datos
) {

    if (
        Array.isArray(
            datos.hormigones
        ) &&
        datos.hormigones.length >
        0
    ) {

        return datos.hormigones;

    }


    if (
        datos.hormigon &&
        datos.hormigon.tipo
    ) {

        return [
            datos.hormigon
        ];

    }


    return [];

}


// =====================================
// NORMALIZAR ADITIVOS
// =====================================

function normalizarAditivos(
    datos,
    hormigones
) {

    if (
        Array.isArray(
            datos.aditivos
        )
    ) {

        return datos.aditivos;

    }


    if (
        datos.aditivo &&
        datos.aditivo.tipo
    ) {

        return [

            {
                ...datos.aditivo,

                hormigonTipo:
                    datos.aditivo
                        .hormigonTipo ||
                    (
                        hormigones[0]
                            ? hormigones[0]
                                .tipo
                            : ""
                    )
            }

        ];

    }


    return [];

}


// =====================================
// SESIÓN
// =====================================

async function comprobarSesion() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

        return false;

    }


    if (!data.session) {

        alert(
            "Debe iniciar sesión para ver el presupuesto."
        );


        window.location.href =
            "login.html";


        return false;

    }


    return true;

}


// =====================================
// CARGAR PRESUPUESTO
// =====================================

async function cargarPresupuesto() {

    const haySesion =
        await comprobarSesion();


    if (!haySesion) {

        return;

    }


    if (!idPresupuesto) {

        mostrarNoEncontrado();

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "presupuestos"
            )
            .select("*")
            .eq(
                "id",
                idPresupuesto
            )
            .single();


    if (error) {

        console.error(
            "Error cargando presupuesto:",
            error
        );


        mostrarNoEncontrado();

        return;

    }


    console.log(
        "Presupuesto recibido desde Supabase:",
        data
    );


    mostrarPresupuesto(
        data
    );

}


// =====================================
// NO ENCONTRADO
// =====================================

function mostrarNoEncontrado() {

    contenedor.innerHTML = `

        <h2>
            Presupuesto no encontrado
        </h2>

        <p>
            El presupuesto solicitado no existe
            o no se pudo cargar.
        </p>

    `;

}


// =====================================
// BLOQUE HORMIGONES
// =====================================

function crearBloqueHormigones(
    hormigones
) {

    if (
        hormigones.length ===
        0
    ) {

        return `
            <p>
                No hay hormigones cargados.
            </p>
        `;

    }


    return hormigones
        .map(
            hormigon => `

                <div
                    class="detalle-grid"
                    style="margin-bottom: 12px;"
                >

                    <div class="detalle-item">

                        <span>
                            TIPO DE H°
                        </span>

                        <strong>
                            ${textoHTML(
                                hormigon.tipo ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            M3
                        </span>

                        <strong>
                            ${textoHTML(
                                hormigon.cantidad ||
                                0
                            )}
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            TIPO CEMENTO
                        </span>

                        <strong>
                            ${textoHTML(
                                hormigon.cemento ||
                                "CPP40 KG"
                            )}
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            DISTANCIA
                        </span>

                        <strong>
                            ${textoHTML(
                                hormigon.distancia ||
                                0
                            )} KM
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            VALOR x M3
                        </span>

                        <strong>
                            ${formatoPesos(
                                hormigon.precioM3
                            )}
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            TOTAL
                        </span>

                        <strong>
                            ${formatoPesos(
                                hormigon.total
                            )}
                        </strong>

                    </div>

                </div>

            `
        )
        .join("");

}


// =====================================
// BLOQUE ADITIVOS
// =====================================

function crearBloqueAditivos(
    aditivos
) {

    if (
        aditivos.length ===
        0
    ) {

        return `

            <div class="detalle-grid">

                <div class="detalle-item">

                    <span>
                        TIPO ADITIVO
                    </span>

                    <strong>
                        Sin aditivos
                    </strong>

                </div>

            </div>

        `;

    }


    return aditivos
        .map(
            aditivo => `

                <div
                    class="detalle-grid"
                    style="margin-bottom: 12px;"
                >

                    <div class="detalle-item">

                        <span>
                            TIPO DE H°
                        </span>

                        <strong>
                            ${textoHTML(
                                aditivo
                                    .hormigonTipo ||
                                "-"
                            )}
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            KG
                        </span>

                        <strong>
                            ${textoHTML(
                                aditivo.cantidad ||
                                0
                            )}
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            TIPO ADITIVO
                        </span>

                        <strong>
                            ${textoHTML(
                                obtenerNombreAditivo(
                                    aditivo.tipo
                                )
                            )}
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            VALOR x M3
                        </span>

                        <strong>
                            ${formatoPesos(
                                aditivo.precioM3
                            )}
                        </strong>

                    </div>


                    <div class="detalle-item">

                        <span>
                            TOTAL
                        </span>

                        <strong>
                            ${formatoPesos(
                                aditivo.total
                            )}
                        </strong>

                    </div>

                </div>

            `
        )
        .join("");

}


// =====================================
// MOSTRAR PRESUPUESTO
// =====================================

function mostrarPresupuesto(
    presupuesto
) {

    const datos =
        presupuesto.datos ||
        {};


    const hormigones =
        normalizarHormigones(
            datos
        );


    const aditivos =
        normalizarAditivos(
            datos,
            hormigones
        );


    const servicios =
        datos.servicios ||
        {};


    const bomba =
        servicios.bomba ||
        {};


    const vibrador =
        servicios.vibrador ||
        {};


    // =====================================
    // CUIT
    // =====================================

    let bloqueCUIT =
        "";


    if (
        presupuesto.tipo_planilla ===
        "PresupuestosM3+IVA"
    ) {

        bloqueCUIT = `

            <div class="detalle-item">

                <span>
                    CUIT:
                </span>

                <strong>
                    ${textoHTML(
                        datos.cuit ||
                        "-"
                    )}
                </strong>

            </div>

        `;

    }


    // =====================================
    // TOTALES
    // =====================================

    let bloqueTotales =
        "";


    if (
        presupuesto.tipo_planilla ===
        "PresupuestosM3+IVA"
    ) {

        bloqueTotales = `

            <div class="resumen">

                <div class="linea-resumen">

                    <span>
                        4- SUBTOTAL SIN IVA
                    </span>

                    <strong>
                        ${formatoPesos(
                            datos.subtotalSinIVA
                        )}
                    </strong>

                </div>


                <div class="linea-resumen">

                    <span>
                        5- IVA 21%
                    </span>

                    <strong>
                        ${formatoPesos(
                            datos.iva21
                        )}
                    </strong>

                </div>


                <div class="total-final">

                    <span>
                        6- TOTAL CON IVA
                    </span>

                    <strong>
                        ${formatoPesos(
                            presupuesto
                                .total_final
                        )}
                    </strong>

                </div>

            </div>

        `;

    } else {

        bloqueTotales = `

            <div class="resumen">

                <div class="total-final">

                    <span>
                        4- TOTAL SIN IVA
                    </span>

                    <strong>
                        ${formatoPesos(
                            presupuesto
                                .total_final
                        )}
                    </strong>

                </div>

            </div>

        `;

    }


    // =====================================
    // ARMAR PÁGINA
    // =====================================

    contenedor.innerHTML = `

        <div class="detalle-encabezado">

            <p class="detalle-tipo">

                ${textoHTML(
                    presupuesto
                        .tipo_planilla
                )}

            </p>


            <h1>

                ${textoHTML(
                    presupuesto.nombre
                )}

            </h1>

        </div>


        <h2 class="titulo-seccion">

            DATOS DEL PRESUPUESTO

        </h2>


        <div class="detalle-grid">

            <div class="detalle-item">

                <span>
                    Señores:
                </span>

                <strong>
                    ${textoHTML(
                        presupuesto.senores
                    )}
                </strong>

            </div>


            ${bloqueCUIT}


            <div class="detalle-item">

                <span>
                    Atención:
                </span>

                <strong>
                    ${textoHTML(
                        datos.atencion ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detalle-item">

                <span>
                    Destino:
                </span>

                <strong>
                    ${textoHTML(
                        datos.destino ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detalle-item">

                <span>
                    Fecha:
                </span>

                <strong>
                    ${formatoFecha(
                        presupuesto.fecha
                    )}
                </strong>

            </div>


            <div class="detalle-item">

                <span>
                    Presupuesto N°
                </span>

                <strong>
                    ${textoHTML(
                        presupuesto
                            .presupuesto_numero
                    )}
                </strong>

            </div>

        </div>


        <p class="consideracion">

            De nuestra consideración le hacemos llegar
            el siguiente presupuesto según pliego de :

        </p>


        <h2 class="titulo-seccion">

            1- HORMIGÓN ELABORADO POR TIPO Y DISTANCIA

        </h2>


        ${crearBloqueHormigones(
            hormigones
        )}


        <h2 class="titulo-seccion">

            2- VALOR ADITIVOS EXTRAS x m3

        </h2>


        ${crearBloqueAditivos(
            aditivos
        )}


        <h2 class="titulo-seccion">

            3- SERVICIOS EXTRAS

        </h2>


        <div class="detalle-grid">

            <div class="detalle-item">

                <span>
                    SERVICIOS DE BOMBA
                </span>

                <strong>
                    ${formatoPesos(
                        bomba.total
                    )}
                </strong>

            </div>


            <div class="detalle-item">

                <span>
                    VIBRADOR
                </span>

                <strong>
                    ${formatoPesos(
                        vibrador.total
                    )}
                </strong>

            </div>


            <div class="detalle-item">

                <span>
                    DESCUENTO
                </span>

                <strong>
                    ${formatoPesos(
                        datos.descuento
                    )}
                </strong>

            </div>

        </div>


        ${bloqueTotales}


        <div class="acciones-presupuesto">

            <button
                class="boton principal"
                id="generarPDFHistorial"
            >

                Generar PDF

            </button>

        </div>

    `;

}


// =====================================
// INICIO
// =====================================

cargarPresupuesto();
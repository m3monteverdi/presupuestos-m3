// =====================================
// VER PRESUPUESTO DESDE SUPABASE
// =====================================

const contenedor =
    document.getElementById(
        "detallePresupuesto"
    );


// =====================================
// OBTENER ID DE LA URL
// =====================================

const parametros =
    new URLSearchParams(
        window.location.search
    );


const idPresupuesto =
    Number(
        parametros.get("id")
    );


// =====================================
// FORMATO DE PESOS
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
// FORMATO DE FECHA
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
// NOMBRE DEL ADITIVO
// =====================================

function obtenerNombreAditivo(tipo) {

    if (tipo === "mr120") {

        return "ADITIVO EN OBRA MR120 superfluidificante";

    }


    if (tipo === "macro") {

        return "MACRO FIBRAS";

    }


    return "Sin aditivo";

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


    const { data, error } =
        await supabaseClient
            .from("presupuestos")
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
// PRESUPUESTO NO ENCONTRADO
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
// MOSTRAR PRESUPUESTO
// =====================================

function mostrarPresupuesto(
    presupuesto
) {

    const datos =
        presupuesto.datos || {};


    const hormigon =
        datos.hormigon || {};


    const aditivo =
        datos.aditivo || {};


    const servicios =
        datos.servicios || {};


    const bomba =
        servicios.bomba || {};


    const vibrador =
        servicios.vibrador || {};


    const nombreAditivo =
        obtenerNombreAditivo(
            aditivo.tipo
        );


    // =====================================
    // CUIT
    // Solo aparece en PresupuestosM3+IVA
    // =====================================

    let bloqueCUIT = "";


    if (
        presupuesto.tipo_planilla ===
        "PresupuestosM3+IVA"
    ) {

        bloqueCUIT = `

            <div class="detalle-item">

                <span>CUIT:</span>

                <strong>
                    ${datos.cuit || "-"}
                </strong>

            </div>

        `;

    }


    // =====================================
    // TOTALES SEGÚN PLANILLA
    // =====================================

    let bloqueTotales = "";


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
                            presupuesto.total_final
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
                            presupuesto.total_final
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
                ${presupuesto.tipo_planilla}
            </p>

            <h1>
                ${presupuesto.nombre}
            </h1>

        </div>


        <!-- DATOS GENERALES -->

        <h2 class="titulo-seccion">
            DATOS DEL PRESUPUESTO
        </h2>


        <div class="detalle-grid">

            <div class="detalle-item">

                <span>Señores:</span>

                <strong>
                    ${presupuesto.senores}
                </strong>

            </div>


            ${bloqueCUIT}


            <div class="detalle-item">

                <span>Atención:</span>

                <strong>
                    ${datos.atencion || "-"}
                </strong>

            </div>


            <div class="detalle-item">

                <span>Destino:</span>

                <strong>
                    ${datos.destino || "-"}
                </strong>

            </div>


            <div class="detalle-item">

                <span>Fecha:</span>

                <strong>
                    ${formatoFecha(
                        presupuesto.fecha
                    )}
                </strong>

            </div>


            <div class="detalle-item">

                <span>Presupuesto N°</span>

                <strong>
                    ${presupuesto.presupuesto_numero}
                </strong>

            </div>

        </div>


        <p class="consideracion">

            De nuestra consideración le hacemos llegar
            el siguiente presupuesto según pliego de :

        </p>


        <!-- HORMIGÓN -->

        <h2 class="titulo-seccion">

            1- HORMIGÓN ELABORADO POR TIPO Y DISTANCIA

        </h2>


        <div class="detalle-grid">

            <div class="detalle-item">

                <span>TIPO DE H°</span>

                <strong>
                    ${hormigon.tipo || "-"}
                </strong>

            </div>


            <div class="detalle-item">

                <span>M3</span>

                <strong>
                    ${hormigon.cantidad || 0}
                </strong>

            </div>


            <div class="detalle-item">

                <span>TIPO CEMENTO</span>

                <strong>
                    ${hormigon.cemento || "CPP40 KG"}
                </strong>

            </div>


            <div class="detalle-item">

                <span>DISTANCIA</span>

                <strong>
                    ${hormigon.distancia || 0} KM
                </strong>

            </div>


            <div class="detalle-item">

                <span>VALOR x M3</span>

                <strong>
                    ${formatoPesos(
                        hormigon.precioM3
                    )}
                </strong>

            </div>


            <div class="detalle-item">

                <span>TOTAL</span>

                <strong>
                    ${formatoPesos(
                        hormigon.total
                    )}
                </strong>

            </div>

        </div>


        <!-- ADITIVOS -->

        <h2 class="titulo-seccion">

            2- VALOR ADITIVOS EXTRAS x m3

        </h2>


        <div class="detalle-grid">

            <div class="detalle-item">

                <span>TIPO DE H°</span>

                <strong>
                    ${hormigon.tipo || "-"}
                </strong>

            </div>


            <div class="detalle-item">

                <span>M3</span>

                <strong>
                    ${hormigon.cantidad || 0}
                </strong>

            </div>


            <div class="detalle-item">

                <span>TIPO ADITIVO</span>

                <strong>
                    ${nombreAditivo}
                </strong>

            </div>


            <div class="detalle-item">

                <span>VALOR x M3</span>

                <strong>
                    ${formatoPesos(
                        aditivo.precioM3
                    )}
                </strong>

            </div>


            <div class="detalle-item">

                <span>TOTAL</span>

                <strong>
                    ${formatoPesos(
                        aditivo.total
                    )}
                </strong>

            </div>

        </div>


        <!-- SERVICIOS -->

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


        <!-- ACCIONES -->

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
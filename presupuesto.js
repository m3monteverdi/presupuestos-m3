// =====================================
// PRESUPUESTOS MONTEVERDI
// =====================================


// =====================================
// PRECIOS
// Se cargan desde Supabase
// =====================================

let precios = {

    hormigones: {
        H8: 0,
        H13: 0,
        H17: 0,
        H21: 0,
        H25: 0,
        H30: 0,
        H40: 0
    },

    aditivos: {
        mr120: 0,
        macro: 0
    },

    bomba: 0,

    vibrador: 0

};


// =====================================
// VARIABLES DE TOTALES
// =====================================

let valorTotalHormigon = 0;
let valorTotalAditivo = 0;
let valorTotalBomba = 0;
let valorTotalVibrador = 0;


// =====================================
// CANTIDADES PERSONALIZADAS
// Para opción "otro"
// =====================================

let cantidadBombaOtro = 0;
let cantidadVibradorOtro = 0;


// =====================================
// DESCUENTO MANUAL
// =====================================

let descuentoModificadoManualmente = false;


// =====================================
// CAMPOS DEL FORMULARIO
// =====================================

const tipoHormigon =
    document.getElementById(
        "tipoHormigon"
    );

const cantidadHormigon =
    document.getElementById(
        "cantidadHormigon"
    );

const distancia =
    document.getElementById(
        "distancia"
    );

const precioHormigon =
    document.getElementById(
        "precioHormigon"
    );

const totalHormigon =
    document.getElementById(
        "totalHormigon"
    );


const tipoHormigonAditivo =
    document.getElementById(
        "tipoHormigonAditivo"
    );

const cantidadAditivo =
    document.getElementById(
        "cantidadAditivo"
    );

const tipoAditivo =
    document.getElementById(
        "tipoAditivo"
    );

const precioAditivo =
    document.getElementById(
        "precioAditivo"
    );

const totalAditivo =
    document.getElementById(
        "totalAditivo"
    );


const cantidadBomba =
    document.getElementById(
        "cantidadBomba"
    );

const precioBomba =
    document.getElementById(
        "precioBomba"
    );

const totalBomba =
    document.getElementById(
        "totalBomba"
    );


const cantidadVibrador =
    document.getElementById(
        "cantidadVibrador"
    );

const precioVibrador =
    document.getElementById(
        "precioVibrador"
    );

const totalVibrador =
    document.getElementById(
        "totalVibrador"
    );


const resumenHormigon =
    document.getElementById(
        "resumenHormigon"
    );

const resumenAditivo =
    document.getElementById(
        "resumenAditivo"
    );

const resumenServicios =
    document.getElementById(
        "resumenServicios"
    );


const descuento =
    document.getElementById(
        "descuento"
    );


const totalSinIVA =
    document.getElementById(
        "totalSinIVA"
    );

const subtotalSinIVA =
    document.getElementById(
        "subtotalSinIVA"
    );

const iva21 =
    document.getElementById(
        "iva21"
    );

const totalConIVA =
    document.getElementById(
        "totalConIVA"
    );


// =====================================
// FORMATEAR PESOS
// =====================================

function formatoPesos(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "es-AR",
            {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 2
            }
        );

}


// =====================================
// CARGAR PRECIOS DESDE SUPABASE
// =====================================

async function cargarPreciosDesdeSupabase() {

    try {

        const { data, error } =
            await supabaseClient
                .from("precios")
                .select(
                    "codigo, valor"
                );


        if (error) {

            console.error(
                "Error cargando precios:",
                error
            );

            alert(
                "No se pudieron cargar los precios."
            );

            return;
        }


        data.forEach(
            fila => {

                const codigo =
                    fila.codigo;

                const valor =
                    Number(
                        fila.valor || 0
                    );


                // HORMIGONES

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            precios.hormigones,
                            codigo
                        )
                ) {

                    precios.hormigones[
                        codigo
                    ] = valor;

                }


                // ADITIVOS

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            precios.aditivos,
                            codigo
                        )
                ) {

                    precios.aditivos[
                        codigo
                    ] = valor;

                }


                // BOMBA

                if (
                    codigo === "bomba"
                ) {

                    precios.bomba =
                        valor;

                }


                // VIBRADOR

                if (
                    codigo === "vibrador"
                ) {

                    precios.vibrador =
                        valor;

                }

            }
        );


        console.log(
            "Precios cargados desde Supabase:",
            precios
        );


        // Recalcular todo

        calcularHormigon();
        calcularAditivo();
        calcularBomba();
        calcularVibrador();
        calcularTotales();


    } catch (error) {

        console.error(
            "Error inesperado cargando precios:",
            error
        );

    }

}


// =====================================
// CALCULAR HORMIGÓN
// =====================================

function calcularHormigon() {

    if (
        !tipoHormigon ||
        !cantidadHormigon
    ) {

        return;

    }


    const tipo =
        tipoHormigon.value;


    const cantidad =
        parseFloat(
            cantidadHormigon.value
        ) || 0;


    const precio =
        precios.hormigones[
            tipo
        ] || 0;


    valorTotalHormigon =
        cantidad *
        precio;


    if (precioHormigon) {

        precioHormigon.value =
            formatoPesos(
                precio
            );

    }


    if (totalHormigon) {

        totalHormigon.value =
            formatoPesos(
                valorTotalHormigon
            );

    }


    // Copiar automáticamente
    // hormigón y cantidad al aditivo

    if (
        tipoHormigonAditivo
    ) {

        tipoHormigonAditivo.value =
            tipo;

    }


    if (
        cantidadAditivo
    ) {

        cantidadAditivo.value =
            cantidad || "";

    }


    calcularAditivo();

}


// =====================================
// CALCULAR ADITIVO
// =====================================

function calcularAditivo() {

    if (!tipoAditivo) {

        return;

    }


    const tipo =
        tipoAditivo.value;


    const cantidad =
        parseFloat(
            cantidadAditivo
                ? cantidadAditivo.value
                : 0
        ) || 0;


    const precio =
        precios.aditivos[
            tipo
        ] || 0;


    valorTotalAditivo =
        cantidad *
        precio;


    if (precioAditivo) {

        precioAditivo.value =
            tipo
                ? formatoPesos(
                    precio
                )
                : formatoPesos(0);

    }


    if (totalAditivo) {

        totalAditivo.value =
            formatoPesos(
                valorTotalAditivo
            );

    }


    // El descuento automático
    // inicialmente es igual al total
    // de aditivos.

    if (
        descuento &&
        !descuentoModificadoManualmente
    ) {

        descuento.value =
            valorTotalAditivo.toFixed(2);

    }


    calcularTotales();

}


// =====================================
// OBTENER CANTIDAD DE BOMBA
// =====================================

function obtenerCantidadBomba() {

    if (!cantidadBomba) {

        return 0;

    }


    if (
        cantidadBomba.value ===
        "otro"
    ) {

        return Number(
            cantidadBombaOtro
        ) || 0;

    }


    return Number(
        cantidadBomba.value
    ) || 0;

}


// =====================================
// CALCULAR BOMBA
// =====================================

function calcularBomba() {

    if (!cantidadBomba) {

        return;

    }


    const cantidad =
        obtenerCantidadBomba();


    valorTotalBomba =
        cantidad *
        precios.bomba;


    if (precioBomba) {

        precioBomba.value =
            formatoPesos(
                precios.bomba
            );

    }


    if (totalBomba) {

        totalBomba.value =
            formatoPesos(
                valorTotalBomba
            );

    }


    calcularTotales();

}


// =====================================
// OBTENER CANTIDAD VIBRADOR
// =====================================

function obtenerCantidadVibrador() {

    if (!cantidadVibrador) {

        return 0;

    }


    if (
        cantidadVibrador.value ===
        "otro"
    ) {

        return Number(
            cantidadVibradorOtro
        ) || 0;

    }


    return Number(
        cantidadVibrador.value
    ) || 0;

}


// =====================================
// CALCULAR VIBRADOR
// =====================================

function calcularVibrador() {

    if (!cantidadVibrador) {

        return;

    }


    const cantidad =
        obtenerCantidadVibrador();


    valorTotalVibrador =
        cantidad *
        precios.vibrador;


    if (precioVibrador) {

        precioVibrador.value =
            formatoPesos(
                precios.vibrador
            );

    }


    if (totalVibrador) {

        totalVibrador.value =
            formatoPesos(
                valorTotalVibrador
            );

    }


    calcularTotales();

}


// =====================================
// CALCULAR TOTALES GENERALES
// =====================================

function calcularTotales() {

    const valorDescuento =
        parseFloat(
            descuento
                ? descuento.value
                : 0
        ) || 0;


    const servicios =
        valorTotalBomba +
        valorTotalVibrador;


    const subtotal =
        valorTotalHormigon +
        valorTotalAditivo +
        servicios -
        valorDescuento;


    // =====================================
    // RESUMEN
    // =====================================

    if (resumenHormigon) {

        resumenHormigon.textContent =
            formatoPesos(
                valorTotalHormigon
            );

    }


    if (resumenAditivo) {

        resumenAditivo.textContent =
            formatoPesos(
                valorTotalAditivo
            );

    }


    if (resumenServicios) {

        resumenServicios.textContent =
            formatoPesos(
                servicios
            );

    }


    // =====================================
    // PLANILLA SIN IVA
    // =====================================

    if (totalSinIVA) {

        totalSinIVA.textContent =
            formatoPesos(
                subtotal
            );

    }


    // =====================================
    // PLANILLA CON IVA
    // =====================================

    if (subtotalSinIVA) {

        subtotalSinIVA.textContent =
            formatoPesos(
                subtotal
            );

    }


    const valorIVA =
        subtotal *
        0.21;


    if (iva21) {

        iva21.textContent =
            formatoPesos(
                valorIVA
            );

    }


    if (totalConIVA) {

        totalConIVA.textContent =
            formatoPesos(
                subtotal +
                valorIVA
            );

    }

}


// =====================================
// EVENTOS HORMIGÓN
// =====================================

if (tipoHormigon) {

    tipoHormigon.addEventListener(
        "change",
        calcularHormigon
    );

}


if (cantidadHormigon) {

    cantidadHormigon.addEventListener(
        "input",
        calcularHormigon
    );

}


if (distancia) {

    distancia.addEventListener(
        "input",
        calcularHormigon
    );

}


// =====================================
// EVENTOS ADITIVOS
// =====================================

if (tipoAditivo) {

    tipoAditivo.addEventListener(
        "change",
        function () {

            descuentoModificadoManualmente =
                false;


            calcularAditivo();

        }
    );

}


if (cantidadAditivo) {

    cantidadAditivo.addEventListener(
        "input",
        calcularAditivo
    );

}


// =====================================
// EVENTO BOMBA
// =====================================

if (cantidadBomba) {

    cantidadBomba.addEventListener(
        "change",
        function () {

            if (
                cantidadBomba.value ===
                "otro"
            ) {

                const respuesta =
                    prompt(
                        "Ingrese la cantidad de servicios de bomba:"
                    );


                if (
                    respuesta === null
                ) {

                    cantidadBomba.value =
                        "0";

                    cantidadBombaOtro =
                        0;

                } else {

                    cantidadBombaOtro =
                        Number(
                            respuesta
                                .replace(
                                    ",",
                                    "."
                                )
                        ) || 0;

                }

            } else {

                cantidadBombaOtro =
                    0;

            }


            calcularBomba();

        }
    );

}


// =====================================
// EVENTO VIBRADOR
// =====================================

if (cantidadVibrador) {

    cantidadVibrador.addEventListener(
        "change",
        function () {

            if (
                cantidadVibrador.value ===
                "otro"
            ) {

                const respuesta =
                    prompt(
                        "Ingrese la cantidad de vibradores:"
                    );


                if (
                    respuesta === null
                ) {

                    cantidadVibrador.value =
                        "0";

                    cantidadVibradorOtro =
                        0;

                } else {

                    cantidadVibradorOtro =
                        Number(
                            respuesta
                                .replace(
                                    ",",
                                    "."
                                )
                        ) || 0;

                }

            } else {

                cantidadVibradorOtro =
                    0;

            }


            calcularVibrador();

        }
    );

}


// =====================================
// EVENTO DESCUENTO
// =====================================

if (descuento) {

    descuento.addEventListener(
        "input",
        function () {

            descuentoModificadoManualmente =
                true;


            calcularTotales();

        }
    );

}


// =====================================
// GUARDAR PRESUPUESTO EN SUPABASE
// =====================================

const botonGuardarPresupuesto =
    document.getElementById(
        "guardarPresupuesto"
    );


async function guardarPresupuesto() {

    if (!botonGuardarPresupuesto) {

        return;

    }


    botonGuardarPresupuesto.disabled =
        true;


    botonGuardarPresupuesto.textContent =
        "Guardando...";


    try {

        // =====================================
        // COMPROBAR SESIÓN
        // =====================================

        const {
            data: sesionData,
            error: sesionError
        } =
            await supabaseClient
                .auth
                .getSession();


        if (sesionError) {

            console.error(
                "Error comprobando sesión:",
                sesionError
            );


            alert(
                "No se pudo comprobar la sesión."
            );

            return;

        }


        if (!sesionData.session) {

            alert(
                "Debe iniciar sesión antes de guardar un presupuesto."
            );

            return;

        }


        // =====================================
        // DATOS GENERALES
        // =====================================

        const senores =
            document
                .getElementById(
                    "senores"
                )
                .value
                .trim();


        const atencion =
            document
                .getElementById(
                    "atencion"
                )
                .value
                .trim();


        const destino =
            document
                .getElementById(
                    "destino"
                )
                .value
                .trim();


        const fecha =
            document
                .getElementById(
                    "fecha"
                )
                .value;


        const presupuestoNumero =
            document
                .getElementById(
                    "presupuestoNumero"
                )
                .value
                .trim();


        const campoCUIT =
            document.getElementById(
                "cuit"
            );


        const cuit =
            campoCUIT
                ? campoCUIT.value.trim()
                : "";


        const tipoPlanilla =
            document.body.dataset.tipo;


        // =====================================
        // VALIDACIONES
        // =====================================

        if (!senores) {

            alert(
                "Debe completar Señores."
            );

            return;

        }


        if (!presupuestoNumero) {

            alert(
                "Debe completar Presupuesto N°."
            );

            return;

        }


        if (
            !tipoHormigon ||
            !tipoHormigon.value
        ) {

            alert(
                "Debe seleccionar un TIPO DE H°."
            );

            return;

        }


        if (
            !cantidadHormigon.value ||
            Number(
                cantidadHormigon.value
            ) <= 0
        ) {

            alert(
                "Debe ingresar una cantidad de M3."
            );

            return;

        }


        // =====================================
        // NOMBRE DEL PRESUPUESTO
        // =====================================

        const nombrePresupuesto =
            `${senores} - ${presupuestoNumero}`;


        // =====================================
        // CANTIDADES
        // =====================================

        const cantidadHormigonGuardada =
            parseFloat(
                cantidadHormigon.value
            ) || 0;


        const cantidadAditivoGuardada =
            parseFloat(
                cantidadAditivo
                    ? cantidadAditivo.value
                    : 0
            ) || 0;


        const cantidadBombaGuardada =
            obtenerCantidadBomba();


        const cantidadVibradorGuardada =
            obtenerCantidadVibrador();


        // =====================================
        // TOTALES
        // =====================================

        const valorDescuento =
            parseFloat(
                descuento
                    ? descuento.value
                    : 0
            ) || 0;


        const subtotal =
            valorTotalHormigon +
            valorTotalAditivo +
            valorTotalBomba +
            valorTotalVibrador -
            valorDescuento;


        const valorIVA =
            tipoPlanilla ===
            "PresupuestosM3+IVA"
                ? subtotal * 0.21
                : 0;


        const totalFinal =
            tipoPlanilla ===
            "PresupuestosM3+IVA"
                ? subtotal +
                    valorIVA
                : subtotal;


        // =====================================
        // DATOS COMPLETOS
        // =====================================

        const datosCompletos = {

            atencion:
                atencion,

            destino:
                destino,

            cuit:
                cuit,


            hormigon: {

                tipo:
                    tipoHormigon.value,

                cantidad:
                    cantidadHormigonGuardada,

                cemento:
                    "CPP40 KG",

                distancia:
                    parseFloat(
                        distancia
                            ? distancia.value
                            : 0
                    ) || 0,

                precioM3:
                    precios.hormigones[
                        tipoHormigon.value
                    ] || 0,

                total:
                    valorTotalHormigon

            },


            aditivo: {

                tipo:
                    tipoAditivo
                        ? tipoAditivo.value
                        : "",

                cantidad:
                    cantidadAditivoGuardada,

                precioM3:
                    tipoAditivo
                        ? (
                            precios.aditivos[
                                tipoAditivo.value
                            ] || 0
                        )
                        : 0,

                total:
                    valorTotalAditivo

            },


            servicios: {

                bomba: {

                    cantidad:
                        cantidadBombaGuardada,

                    rango:
                        "De 01 m3 a 30 m3",

                    precio:
                        precios.bomba,

                    total:
                        valorTotalBomba

                },


                vibrador: {

                    cantidad:
                        cantidadVibradorGuardada,

                    porUnidad:
                        1,

                    precio:
                        precios.vibrador,

                    total:
                        valorTotalVibrador

                }

            },


            descuento:
                valorDescuento,

            subtotalSinIVA:
                subtotal,

            iva21:
                valorIVA,

            totalFinal:
                totalFinal

        };


        // =====================================
        // INSERTAR EN SUPABASE
        // =====================================

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "presupuestos"
                )
                .insert({

                    nombre:
                        nombrePresupuesto,

                    tipo_planilla:
                        tipoPlanilla,

                    senores:
                        senores,

                    presupuesto_numero:
                        presupuestoNumero,

                    fecha:
                        fecha || null,

                    total_final:
                        totalFinal,

                    datos:
                        datosCompletos

                })
                .select();


        if (error) {

            console.error(
                "Error guardando presupuesto:",
                error
            );


            alert(
                "No se pudo guardar el presupuesto."
            );

            return;

        }


        console.log(
            "Presupuesto guardado en Supabase:",
            data
        );


        alert(
            `Presupuesto "${nombrePresupuesto}" guardado correctamente.`
        );


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );


        alert(
            "Ocurrió un error al guardar el presupuesto."
        );


    } finally {

        botonGuardarPresupuesto.disabled =
            false;


        botonGuardarPresupuesto.textContent =
            "Guardar presupuesto";

    }

}


// =====================================
// ACTIVAR BOTÓN GUARDAR
// =====================================

if (botonGuardarPresupuesto) {

    botonGuardarPresupuesto.addEventListener(
        "click",
        guardarPresupuesto
    );

}


// =====================================
// INICIO
// =====================================

cargarPreciosDesdeSupabase();
// =====================================
// GENERAR PDF DESDE EL FORMULARIO
// =====================================


// =====================================
// ARMAR PRESUPUESTO ACTUAL
// =====================================

function construirPresupuestoActual() {

    const senores =
        document
            .getElementById("senores")
            .value
            .trim();


    const atencion =
        document
            .getElementById("atencion")
            .value
            .trim();


    const destino =
        document
            .getElementById("destino")
            .value
            .trim();


    const fecha =
        document
            .getElementById("fecha")
            .value;


    const presupuestoNumero =
        document
            .getElementById(
                "presupuestoNumero"
            )
            .value
            .trim();


    const campoCUIT =
        document.getElementById("cuit");


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

        return null;

    }


    if (!presupuestoNumero) {

        alert(
            "Debe completar Presupuesto N°."
        );

        return null;

    }


    if (!tipoHormigon.value) {

        alert(
            "Debe seleccionar un TIPO DE H°."
        );

        return null;

    }


    const cantidadHormigonActual =
        parseFloat(
            cantidadHormigon.value
        ) || 0;


    if (
        cantidadHormigonActual <= 0
    ) {

        alert(
            "Debe ingresar una cantidad de M3."
        );

        return null;

    }


    // =====================================
    // CANTIDADES
    // =====================================

    const cantidadAditivoActual =
        parseFloat(
            cantidadAditivo
                ? cantidadAditivo.value
                : 0
        ) || 0;


    const cantidadBombaActual =
        obtenerCantidadBomba();


    const cantidadVibradorActual =
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
            ? subtotal + valorIVA
            : subtotal;


    // =====================================
    // OBJETO COMPATIBLE CON pdf.js
    // =====================================

    return {

        senores:
            senores,

        presupuesto_numero:
            presupuestoNumero,

        fecha:
            fecha,

        tipo_planilla:
            tipoPlanilla,

        total_final:
            totalFinal,


        datos: {

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
                    cantidadHormigonActual,

                cemento:
                    "CPP40 KG",

                distancia:
                    parseFloat(
                        distancia.value
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
                    cantidadAditivoActual,

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
                        cantidadBombaActual,

                    rango:
                        "De 01 m3 a 30 m3",

                    precio:
                        precios.bomba,

                    total:
                        valorTotalBomba

                },


                vibrador: {

                    cantidad:
                        cantidadVibradorActual,

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

        }

    };

}


// =====================================
// GENERAR PDF ACTUAL
// =====================================

async function generarPDFFormulario(
    boton
) {

    const textoOriginal =
        boton.textContent;


    boton.disabled =
        true;


    boton.textContent =
        "Generando PDF...";


    try {

        const presupuesto =
            construirPresupuestoActual();


        if (!presupuesto) {

            return;

        }


        const conIVA =
            presupuesto.tipo_planilla ===
            "PresupuestosM3+IVA";


        let bytes;


        if (conIVA) {

            bytes =
                await generarM3IVA(
                    presupuesto
                );

        } else {

            bytes =
                await generarM3(
                    presupuesto
                );

        }


        const nombreArchivo =
            limpiarNombreArchivo(

                `${presupuesto.senores} - ` +
                `Presupuesto ` +
                `${presupuesto.presupuesto_numero}.pdf`

            );


        descargarBytes(
            bytes,
            nombreArchivo
        );


    } catch (error) {

        console.error(
            "Error generando PDF desde formulario:",
            error
        );


        alert(
            "No se pudo generar el PDF."
        );


    } finally {

        boton.disabled =
            false;


        boton.textContent =
            textoOriginal;

    }

}


// =====================================
// BOTÓN GENERAR PDF
// =====================================

const botonGenerarPDF =
    document.getElementById(
        "generarPDF"
    );


if (botonGenerarPDF) {

    botonGenerarPDF.addEventListener(
        "click",
        function () {

            generarPDFFormulario(
                botonGenerarPDF
            );

        }
    );

}